package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.AuctionResponse;
import com.auction.realtime_auction.dto.WatchlistResponse;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.ResourceNotFoundException;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.model.Watchlist;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.UserRepository;
import com.auction.realtime_auction.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchlistService {
    
    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    
    /**
     * Add auction to watchlist
     */
    @Transactional
    public WatchlistResponse addToWatchlist(Long auctionId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + auctionId));
        
        // Check if already in watchlist
        if (watchlistRepository.existsByUserIdAndAuctionId(user.getId(), auctionId)) {
            throw new BadRequestException("Auction is already in your watchlist");
        }
        
        // Cannot watch your own auction
        if (auction.getSeller().getId().equals(user.getId())) {
            throw new BadRequestException("You cannot add your own auction to watchlist");
        }
        
        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setAuction(auction);
        
        watchlist = watchlistRepository.save(watchlist);
        
        return mapToResponse(watchlist);
    }
    
    /**
     * Remove auction from watchlist
     */
    @Transactional
    public void removeFromWatchlist(Long auctionId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        Watchlist watchlist = watchlistRepository.findByUserIdAndAuctionId(user.getId(), auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found in watchlist"));
        
        watchlistRepository.delete(watchlist);
    }
    
    /**
     * Get user's watchlist
     */
    public List<WatchlistResponse> getMyWatchlist(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        return watchlistRepository.findByUserIdOrderByAddedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if auction is in user's watchlist
     */
    public boolean isInWatchlist(Long auctionId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        return watchlistRepository.existsByUserIdAndAuctionId(user.getId(), auctionId);
    }
    
    /**
     * Get watchlist auction IDs for user (for bulk check)
     */
    public List<Long> getWatchlistAuctionIds(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        return watchlistRepository.findAuctionIdsByUserId(user.getId());
    }
    
    /**
     * Map Watchlist entity to WatchlistResponse DTO with multiple images support
     */
    private WatchlistResponse mapToResponse(Watchlist watchlist) {
    Auction auction = watchlist.getAuction();
    
    AuctionResponse auctionResponse = new AuctionResponse();
    auctionResponse.setId(auction.getId());
    auctionResponse.setTitle(auction.getTitle());
    auctionResponse.setDescription(auction.getDescription());
    auctionResponse.setStartingPrice(auction.getStartingPrice());
    auctionResponse.setCurrentPrice(auction.getCurrentPrice());
    auctionResponse.setStartTime(auction.getStartTime());
    auctionResponse.setEndTime(auction.getEndTime());
    auctionResponse.setStatus(auction.getStatus());
    auctionResponse.setCategory(auction.getCategory());
    auctionResponse.setTotalBids(auction.getTotalBids());
    auctionResponse.setCreatedAt(auction.getCreatedAt());
    auctionResponse.setUpdatedAt(auction.getUpdatedAt());
    
    // FIXED: Only set imageUrls, not deprecated imageUrl
    auctionResponse.setImageUrls(auction.getImageUrls() != null ? 
        new ArrayList<>(auction.getImageUrls()) : new ArrayList<>());
    
    if (auction.getSeller() != null) {
        auctionResponse.setSellerId(auction.getSeller().getId());
        auctionResponse.setSellerName(auction.getSeller().getUsername());
    }
    
    if (auction.getWinner() != null) {
        auctionResponse.setWinnerId(auction.getWinner().getId());
        auctionResponse.setWinnerName(auction.getWinner().getUsername());
    }
    
    return new WatchlistResponse(
            watchlist.getId(),
            auctionResponse,
            watchlist.getAddedAt()
    );
}
}