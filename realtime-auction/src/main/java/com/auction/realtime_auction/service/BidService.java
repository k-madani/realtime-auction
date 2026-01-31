package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.BidResponse;
import com.auction.realtime_auction.dto.PlaceBidRequest;
import com.auction.realtime_auction.exception.BadRequestException;
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
    
    // Anti-Snipe Configuration
    @Value("${auction.anti-snipe.enabled:true}")
    private boolean antiSnipeEnabled;
    
    @Value("${auction.anti-snipe.threshold-minutes:5}")
    private int antiSnipeThresholdMinutes;
    
    @Value("${auction.anti-snipe.extension-minutes:5}")
    private int antiSnipeExtensionMinutes;
    
    /**
     * Place a bid on an auction with anti-snipe protection
     */
    @Transactional
    public BidResponse placeBid(PlaceBidRequest request, String username) {
        User bidder = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        Auction auction = auctionRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + request.getAuctionId()));
        
        // Validations
        if (auction.getStatus() != Auction.AuctionStatus.ACTIVE) {
            throw new BadRequestException("Auction is not active");
        }
        
        if (auction.getSeller().getId().equals(bidder.getId())) {
            throw new BadRequestException("You cannot bid on your own auction");
        }
        
        BigDecimal bidAmount = request.getAmount();
        BigDecimal minimumBid = auction.getCurrentPrice().add(getMinimumIncrement(auction.getCurrentPrice()));
        
        if (bidAmount.compareTo(minimumBid) < 0) {
            throw new BadRequestException("Bid must be at least $" + minimumBid);
        }
        
        // Create new bid
        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setAmount(bidAmount);
        bid.setBidTime(LocalDateTime.now());
        bid.setIsWinning(true);
        
        // Mark all previous bids as not winning
        bidRepository.markAllBidsAsNotWinning(auction.getId());
        
        // Save new bid
        bid = bidRepository.save(bid);
        
        // Update auction
        auction.setCurrentPrice(bidAmount);
        auction.setWinner(bidder);
        auction.incrementBidCount();
        
        // ============================================
        // ANTI-SNIPE LOGIC
        // ============================================
        if (antiSnipeEnabled && auction.getStatus() == Auction.AuctionStatus.ACTIVE) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime endTime = auction.getEndTime();
            long minutesUntilEnd = java.time.Duration.between(now, endTime).toMinutes();
            
            // If bid placed within threshold minutes of ending, extend the auction
            if (minutesUntilEnd < antiSnipeThresholdMinutes) {
                LocalDateTime newEndTime = now.plusMinutes(antiSnipeExtensionMinutes);
                
                // Only extend if new time is later than current end time
                if (newEndTime.isAfter(endTime)) {
                    auction.setEndTime(newEndTime);
                    
                    System.out.println("🔔 ANTI-SNIPE: Auction " + auction.getId() + 
                                     " '" + auction.getTitle() + "' extended by " + 
                                     antiSnipeExtensionMinutes + " minutes due to late bid");
                    System.out.println("   Old end time: " + endTime);
                    System.out.println("   New end time: " + newEndTime);
                    System.out.println("   Bidder: " + bidder.getUsername());
                    
                    // Notify via WebSocket that auction was extended
                    Map<String, Object> extensionNotification = new HashMap<>();
                    extensionNotification.put("auctionId", auction.getId());
                    extensionNotification.put("type", "AUCTION_EXTENDED");
                    extensionNotification.put("message", "⏰ Auction extended by " + antiSnipeExtensionMinutes + " minutes due to new bid!");
                    extensionNotification.put("newEndTime", newEndTime);
                    extensionNotification.put("oldEndTime", endTime);
                    extensionNotification.put("minutesAdded", antiSnipeExtensionMinutes);
                    extensionNotification.put("bidderUsername", bidder.getUsername());
                    
                    // FIXED: Cast to avoid ambiguity
                    String extensionDest = "/topic/auction/" + auction.getId();
                    Object extensionMsg = extensionNotification;
                    messagingTemplate.convertAndSend(extensionDest, extensionMsg);
                }
            }
        }
        
        auctionRepository.save(auction);
        
        // Send WebSocket notification for new bid
        Map<String, Object> notification = new HashMap<>();
        notification.put("auctionId", auction.getId());
        notification.put("bidderUsername", bidder.getUsername());
        notification.put("amount", bidAmount);
        notification.put("currentPrice", auction.getCurrentPrice());
        notification.put("totalBids", auction.getTotalBids());
        notification.put("bidTime", bid.getBidTime());
        
        // FIXED: Cast to avoid ambiguity
        String bidDest = "/topic/auction/" + auction.getId();
        Object bidMsg = notification;
        messagingTemplate.convertAndSend(bidDest, bidMsg);
        
        return mapToResponse(bid);
    }
    
    /**
     * Get all bids for an auction
     */
    public List<BidResponse> getAuctionBids(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByBidTimeDesc(auctionId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get user's bids (my bids)
     */
    public List<BidResponse> getMyBids(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        return bidRepository.findByBidderIdOrderByBidTimeDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get highest bid for an auction
     */
    public BidResponse getHighestBid(Long auctionId) {
        Optional<Bid> highestBid = bidRepository.findHighestBidForAuction(auctionId);
        
        if (highestBid.isEmpty()) {
            throw new ResourceNotFoundException("No bids found for auction: " + auctionId);
        }
        
        return mapToResponse(highestBid.get());
    }
    
    /**
     * Calculate minimum bid increment based on current price
     */
    private BigDecimal getMinimumIncrement(BigDecimal currentPrice) {
        if (currentPrice.compareTo(new BigDecimal("100")) < 0) {
            return new BigDecimal("5");
        } else if (currentPrice.compareTo(new BigDecimal("500")) < 0) {
            return new BigDecimal("10");
        } else if (currentPrice.compareTo(new BigDecimal("1000")) < 0) {
            return new BigDecimal("25");
        } else {
            return new BigDecimal("50");
        }
    }
    
    /**
     * Map Bid entity to BidResponse DTO
     */
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