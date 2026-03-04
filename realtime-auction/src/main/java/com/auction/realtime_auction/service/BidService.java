package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.BidResponse;
import com.auction.realtime_auction.dto.PlaceBidRequest;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.ForbiddenException;
import com.auction.realtime_auction.exception.ResourceNotFoundException;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.Bid;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.BidRepository;
import com.auction.realtime_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${auction.anti-snipe.enabled:true}")
    private boolean antiSnipeEnabled;

    @Value("${auction.anti-snipe.threshold-minutes:5}")
    private int antiSnipeThresholdMinutes;

    @Value("${auction.anti-snipe.extension-minutes:5}")
    private int antiSnipeExtensionMinutes;

    @Transactional
    public BidResponse placeBid(PlaceBidRequest request, String username) {
        User bidder = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Auction auction = auctionRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + request.getAuctionId()));

        if (auction.getStatus() != Auction.AuctionStatus.ACTIVE) {
            throw new BadRequestException("Bidding is only allowed on active auctions");
        }

        if (auction.getSeller().getId().equals(bidder.getId())) {
            throw new ForbiddenException("You cannot place a bid on your own auction");
        }

        BigDecimal bidAmount = request.getAmount();
        BigDecimal minimumBid = auction.getCurrentPrice().add(getMinimumIncrement(auction.getCurrentPrice()));

        if (bidAmount.compareTo(minimumBid) < 0) {
            throw new BadRequestException("Bid amount must be at least $" + minimumBid);
        }

        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setAmount(bidAmount);
        bid.setBidTime(LocalDateTime.now());
        bid.setIsWinning(true);

        bidRepository.markAllBidsAsNotWinning(auction.getId());
        bid = bidRepository.save(bid);

        auction.setCurrentPrice(bidAmount);
        auction.setWinner(bidder);
        auction.incrementBidCount();

        // Anti-snipe logic
        if (antiSnipeEnabled) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime endTime = auction.getEndTime();
            long minutesUntilEnd = java.time.Duration.between(now, endTime).toMinutes();

            if (minutesUntilEnd < antiSnipeThresholdMinutes) {
                LocalDateTime newEndTime = now.plusMinutes(antiSnipeExtensionMinutes);
                if (newEndTime.isAfter(endTime)) {
                    auction.setEndTime(newEndTime);

                    Map<String, Object> extensionNotification = new HashMap<>();
                    extensionNotification.put("auctionId", auction.getId());
                    extensionNotification.put("type", "AUCTION_EXTENDED");
                    extensionNotification.put("message", "⏰ Auction extended by " + antiSnipeExtensionMinutes + " minutes due to new bid!");
                    extensionNotification.put("newEndTime", newEndTime);
                    extensionNotification.put("oldEndTime", endTime);
                    extensionNotification.put("minutesAdded", antiSnipeExtensionMinutes);
                    extensionNotification.put("bidderUsername", bidder.getUsername());

                    messagingTemplate.convertAndSend("/topic/auction/" + auction.getId(), (Object) extensionNotification);
                }
            }
        }

        auctionRepository.save(auction);

        Map<String, Object> notification = new HashMap<>();
        notification.put("auctionId", auction.getId());
        notification.put("bidderUsername", bidder.getUsername());
        notification.put("amount", bidAmount);
        notification.put("currentPrice", auction.getCurrentPrice());
        notification.put("totalBids", auction.getTotalBids());
        notification.put("bidTime", bid.getBidTime());

        messagingTemplate.convertAndSend("/topic/auction/" + auction.getId(), (Object) notification);

        return mapToResponse(bid);
    }

    public List<BidResponse> getAuctionBids(Long auctionId) {
        auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        return bidRepository.findByAuctionIdOrderByBidTimeDesc(auctionId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BidResponse> getMyBids(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return bidRepository.findByBidderIdOrderByBidTimeDesc(user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public BidResponse getHighestBid(Long auctionId) {
        auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        Optional<Bid> highestBid = bidRepository.findHighestBidForAuction(auctionId);
        return mapToResponse(highestBid
                .orElseThrow(() -> new ResourceNotFoundException("No bids found for auction: " + auctionId)));
    }

    private BigDecimal getMinimumIncrement(BigDecimal currentPrice) {
        if (currentPrice.compareTo(new BigDecimal("100")) < 0) return new BigDecimal("5");
        if (currentPrice.compareTo(new BigDecimal("500")) < 0) return new BigDecimal("10");
        if (currentPrice.compareTo(new BigDecimal("1000")) < 0) return new BigDecimal("25");
        return new BigDecimal("50");
    }

    private BidResponse mapToResponse(Bid bid) {
        return new BidResponse(
                bid.getId(),
                bid.getAuction().getId(),
                bid.getBidder().getUsername(),
                bid.getAmount(),
                bid.getBidTime(),
                bid.getIsWinning()
        );
    }
}