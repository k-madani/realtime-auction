package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.BidResponse;
import com.auction.realtime_auction.dto.PlaceBidRequest;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.Bid;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.BidRepository;
import com.auction.realtime_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {
    
    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public BidResponse placeBid(Long auctionId, PlaceBidRequest request, String username) {
        // Get auction
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        
        // Get bidder
        User bidder = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate auction is active
        if (auction.getStatus() != Auction.AuctionStatus.ACTIVE) {
            throw new RuntimeException("Auction is not active");
        }
        
        // Validate auction hasn't ended
        if (LocalDateTime.now().isAfter(auction.getEndTime())) {
            throw new RuntimeException("Auction has ended");
        }
        
        // Validate seller cannot bid on own auction
        if (auction.getSeller().getId().equals(bidder.getId())) {
            throw new RuntimeException("Seller cannot bid on their own auction");
        }
        
        // Validate bid amount is higher than current price
        if (request.getAmount().compareTo(auction.getCurrentPrice()) <= 0) {
            throw new RuntimeException("Bid must be higher than current price: " + auction.getCurrentPrice());
        }
        
        // Mark previous winning bid as not winning
        bidRepository.findHighestBidForAuction(auctionId)
                .ifPresent(previousHighest -> {
                    previousHighest.setIsWinning(false);
                    bidRepository.save(previousHighest);
                });
        
        // Create new bid
        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setAmount(request.getAmount());
        bid.setIsWinning(true);
        
        bid = bidRepository.save(bid);
        
        // Update auction current price and bid count
        auction.setCurrentPrice(request.getAmount());
        auction.setTotalBids(auction.getTotalBids() + 1);
        auction.setWinner(bidder);
        auctionRepository.save(auction);
        
        return mapToResponse(bid);
    }
    
    public List<BidResponse> getAuctionBids(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByBidTimeDesc(auctionId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<BidResponse> getMyBids(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return bidRepository.findByBidderIdOrderByBidTimeDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public BidResponse getHighestBid(Long auctionId) {
        return bidRepository.findHighestBidForAuction(auctionId)
                .map(this::mapToResponse)
                .orElse(null);
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