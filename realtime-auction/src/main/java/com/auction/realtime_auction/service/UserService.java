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
        int auctionsWon = (int) userAuctions.stream()
                .filter(a -> a.getStatus() == Auction.AuctionStatus.ENDED)
                .filter(a -> a.getWinner() != null && a.getWinner().getId().equals(user.getId()))
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
    
    private AuctionResponse mapAuctionToResponse(Auction auction) {
        return new AuctionResponse(
                auction.getId(),
                auction.getTitle(),
                auction.getDescription(),
                auction.getStartingPrice(),
                auction.getCurrentPrice(),
                auction.getStartTime(),
                auction.getEndTime(),
                auction.getStatus().name(),
                auction.getSeller().getUsername(),
                auction.getWinner() != null ? auction.getWinner().getUsername() : null,
                auction.getImageUrl(),
                auction.getTotalBids(),
                auction.getCreatedAt()
        );
    }
    
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