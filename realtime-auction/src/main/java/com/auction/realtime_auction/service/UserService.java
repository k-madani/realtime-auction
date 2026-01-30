package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.*;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.ResourceNotFoundException;
import com.auction.realtime_auction.exception.UnauthorizedException;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.Bid;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.BidRepository;
import com.auction.realtime_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        // Get statistics
        List<Auction> userAuctions = auctionRepository.findBySellerId(user.getId());
        List<Bid> userBids = bidRepository.findByBidderIdOrderByBidTimeDesc(user.getId());
        
        int totalAuctionsCreated = userAuctions.size();
        int activeAuctionsCount = (int) userAuctions.stream()
                .filter(a -> a.getStatus() == Auction.AuctionStatus.ACTIVE)
                .count();
        int totalBidsPlaced = userBids.size();
        int auctionsWon = (int) userBids.stream()
                .filter(b -> b.getAuction().getStatus() == Auction.AuctionStatus.ENDED)
                .filter(Bid::getIsWinning)
                .count();
        
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                totalAuctionsCreated,
                activeAuctionsCount,
                totalBidsPlaced,
                auctionsWon
        );
    }
    
    public UserStatsResponse getUserStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        // Seller statistics
        List<Auction> userAuctions = auctionRepository.findBySellerId(user.getId());
        int totalAuctionsCreated = userAuctions.size();
        int activeAuctions = (int) userAuctions.stream()
                .filter(a -> a.getStatus() == Auction.AuctionStatus.ACTIVE)
                .count();
        int endedAuctions = (int) userAuctions.stream()
                .filter(a -> a.getStatus() == Auction.AuctionStatus.ENDED)
                .count();
        
        BigDecimal totalRevenue = userAuctions.stream()
                .filter(a -> a.getStatus() == Auction.AuctionStatus.ENDED)
                .filter(a -> a.getWinner() != null)
                .map(Auction::getCurrentPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Bidder statistics
        List<Bid> userBids = bidRepository.findByBidderIdOrderByBidTimeDesc(user.getId());
        int totalBidsPlaced = userBids.size();
        
        int currentlyWinning = (int) userBids.stream()
                .filter(Bid::getIsWinning)
                .filter(b -> b.getAuction().getStatus() == Auction.AuctionStatus.ACTIVE)
                .map(b -> b.getAuction().getId())
                .distinct()
                .count();
        
        int auctionsWon = (int) userBids.stream()
                .filter(b -> b.getAuction().getStatus() == Auction.AuctionStatus.ENDED)
                .filter(Bid::getIsWinning)
                .count();
        
        BigDecimal totalSpent = userBids.stream()
                .filter(b -> b.getAuction().getStatus() == Auction.AuctionStatus.ENDED)
                .filter(Bid::getIsWinning)
                .map(Bid::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Recent activity (last 5)
        List<AuctionResponse> recentAuctions = userAuctions.stream()
                .sorted((a1, a2) -> a2.getCreatedAt().compareTo(a1.getCreatedAt()))
                .limit(5)
                .map(this::mapAuctionToResponse)
                .collect(Collectors.toList());
        
        List<BidResponse> recentBids = userBids.stream()
                .limit(5)
                .map(this::mapBidToResponse)
                .collect(Collectors.toList());
        
        return new UserStatsResponse(
                totalAuctionsCreated,
                activeAuctions,
                endedAuctions,
                totalRevenue,
                totalBidsPlaced,
                auctionsWon,
                currentlyWinning,
                totalSpent,
                recentAuctions,
                recentBids
        );
    }
    
    @Transactional
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        // Verify current password
        if (request.getCurrentPassword() == null || 
            !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        
        // Update username if provided and different
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
            }
            user.setUsername(request.getUsername());
        }
        
        // Update email if provided and different
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email '" + request.getEmail() + "' is already registered");
            }
            user.setEmail(request.getEmail());
        }
        
        // Update password if new password provided
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        
        user = userRepository.save(user);
        
        return getUserProfile(user.getUsername());
    }
    
    /**
     * Map Auction entity to AuctionResponse DTO with multiple images support
     */
    private AuctionResponse mapAuctionToResponse(Auction auction) {
    AuctionResponse response = new AuctionResponse();
    response.setId(auction.getId());
    response.setTitle(auction.getTitle());
    response.setDescription(auction.getDescription());
    response.setStartingPrice(auction.getStartingPrice());
    response.setCurrentPrice(auction.getCurrentPrice());
    response.setStartTime(auction.getStartTime());
    response.setEndTime(auction.getEndTime());
    response.setStatus(auction.getStatus());
    response.setCategory(auction.getCategory());
    response.setTotalBids(auction.getTotalBids());
    response.setCreatedAt(auction.getCreatedAt());
    response.setUpdatedAt(auction.getUpdatedAt());
    
    // FIXED: Only set imageUrls, not deprecated imageUrl
    response.setImageUrls(auction.getImageUrls() != null ? 
        new ArrayList<>(auction.getImageUrls()) : new ArrayList<>());
    
    if (auction.getSeller() != null) {
        response.setSellerId(auction.getSeller().getId());
        response.setSellerName(auction.getSeller().getUsername());
    }
    
    if (auction.getWinner() != null) {
        response.setWinnerId(auction.getWinner().getId());
        response.setWinnerName(auction.getWinner().getUsername());
    }
    
    return response;
}
    
    /**
     * Map Bid entity to BidResponse DTO
     */
    private BidResponse mapBidToResponse(Bid bid) {
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