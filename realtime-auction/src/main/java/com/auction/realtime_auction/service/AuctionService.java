package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.AuctionResponse;
import com.auction.realtime_auction.dto.CreateAuctionRequest;
import com.auction.realtime_auction.dto.PriceInsightsResponse;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.ResourceNotFoundException;
import com.auction.realtime_auction.exception.UnauthorizedException;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.AuctionCategory;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionService {
    
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    
    /**
     * Get all auctions with optional filters
     */
    public List<AuctionResponse> getAllAuctions(String status, String category, String search) {
        List<Auction> auctions = auctionRepository.findAll();
        
        // Apply filters
        if (status != null && !status.isEmpty()) {
            try {
                Auction.AuctionStatus auctionStatus = Auction.AuctionStatus.valueOf(status.toUpperCase());
                auctions = auctions.stream()
                        .filter(a -> a.getStatus() == auctionStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore filter
            }
        }
        
        if (category != null && !category.isEmpty()) {
            try {
                AuctionCategory auctionCategory = AuctionCategory.valueOf(category.toUpperCase());
                auctions = auctions.stream()
                        .filter(a -> a.getCategory() == auctionCategory)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid category, ignore filter
            }
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            auctions = auctions.stream()
                    .filter(a -> a.getTitle().toLowerCase().contains(searchLower) ||
                               (a.getDescription() != null && a.getDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }
        
        return auctions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get auction by ID
     */
    public AuctionResponse getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + id));
        return mapToResponse(auction);
    }
    
    /**
     * Create new auction
     */
    @Transactional
    public AuctionResponse createAuction(CreateAuctionRequest request, String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        // Validate times
        LocalDateTime now = LocalDateTime.now();
        if (request.getStartTime().isBefore(now)) {
            throw new BadRequestException("Start time must be in the future");
        }
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
        
        AuctionCategory category = request.getCategory();
        if (category == null) {
            category = AuctionCategory.OTHER;
        }
        
        Auction auction = new Auction();
        auction.setTitle(request.getTitle());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setCurrentPrice(request.getStartingPrice());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setStatus(Auction.AuctionStatus.PENDING);
        auction.setSeller(seller);
        auction.setCategory(category);
        
        // Handle multiple images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            auction.setImageUrls(new ArrayList<>(request.getImageUrls()));
        }
        
        auction = auctionRepository.save(auction);
        
        return mapToResponse(auction);
    }
    
    /**
     * Update auction
     */
    @Transactional
    public AuctionResponse updateAuction(Long id, CreateAuctionRequest request, String username) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + id));
        
        // Check if user is the seller
        if (!auction.getSeller().getUsername().equals(username)) {
            throw new UnauthorizedException("You can only update your own auctions");
        }
        
        // Can only update PENDING auctions
        if (auction.getStatus() != Auction.AuctionStatus.PENDING) {
            throw new BadRequestException("Can only update auctions that haven't started yet");
        }
        
        // Update fields
        auction.setTitle(request.getTitle());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setCurrentPrice(request.getStartingPrice());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setCategory(request.getCategory());
        
        // Update images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            auction.setImageUrls(new ArrayList<>(request.getImageUrls()));
        }
        
        auction = auctionRepository.save(auction);
        return mapToResponse(auction);
    }
    
    /**
     * Cancel auction
     */
    @Transactional
    public void cancelAuction(Long id, String username) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + id));
        
        // Check if user is the seller
        if (!auction.getSeller().getUsername().equals(username)) {
            throw new UnauthorizedException("You can only cancel your own auctions");
        }
        
        // Can only cancel PENDING or ACTIVE auctions with no bids
        if (auction.getStatus() == Auction.AuctionStatus.ENDED) {
            throw new BadRequestException("Cannot cancel an ended auction");
        }
        
        if (auction.getTotalBids() > 0) {
            throw new BadRequestException("Cannot cancel auction with existing bids");
        }
        
        auction.setStatus(Auction.AuctionStatus.CANCELLED);
        auctionRepository.save(auction);
    }
    
    /**
     * Get auctions by seller username
     */
    public List<AuctionResponse> getAuctionsBySeller(String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        return auctionRepository.findBySellerId(seller.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get active auctions
     */
    public List<AuctionResponse> getActiveAuctions() {
        return auctionRepository.findByStatus(Auction.AuctionStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Search auctions by query
     */
    public List<AuctionResponse> searchAuctions(String query) {
        return auctionRepository.searchAuctions(query)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get price insights for an auction based on similar completed auctions
     */
    public PriceInsightsResponse getPriceInsights(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + auctionId));
        
        // Get completed auctions in same category
        List<Auction> completedAuctions = auctionRepository.findByCategoryAndStatus(
            auction.getCategory(),
            Auction.AuctionStatus.ENDED
        );
        
        if (completedAuctions.isEmpty()) {
            // No data available
            return new PriceInsightsResponse(
                auction.getCurrentPrice(),
                null,
                null,
                null,
                0,
                "insufficient_data",
                0,
                "Not enough historical data for price comparison."
            );
        }
        
        // Calculate statistics
        BigDecimal sum = BigDecimal.ZERO;
        BigDecimal min = completedAuctions.get(0).getCurrentPrice();
        BigDecimal max = completedAuctions.get(0).getCurrentPrice();
        
        for (Auction completedAuction : completedAuctions) {
            BigDecimal price = completedAuction.getCurrentPrice();
            sum = sum.add(price);
            
            if (price.compareTo(min) < 0) min = price;
            if (price.compareTo(max) > 0) max = price;
        }
        
        BigDecimal average = sum.divide(
            BigDecimal.valueOf(completedAuctions.size()),
            2,
            RoundingMode.HALF_UP
        );
        
        // Calculate percentage difference
        BigDecimal difference = auction.getCurrentPrice().subtract(average);
        BigDecimal percentageDiff = difference
            .divide(average, 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));
        
        int percentageInt = percentageDiff.intValue();
        
        // Determine comparison category
        String comparison;
        String recommendation;
        
        if (percentageInt < -10) {
            comparison = "below_average";
            recommendation = "Great deal! This price is significantly below average for this category.";
        } else if (percentageInt > 10) {
            comparison = "above_average";
            recommendation = "Price is above average. Consider if this item has unique features that justify the premium.";
        } else {
            comparison = "average";
            recommendation = "Fair price. This is in line with similar items in this category.";
        }
        
        return new PriceInsightsResponse(
            auction.getCurrentPrice(),
            average,
            min,
            max,
            completedAuctions.size(),
            comparison,
            percentageInt,
            recommendation
        );
    }
    
    /**
     * Map Auction entity to AuctionResponse DTO
     */
    private AuctionResponse mapToResponse(Auction auction) {
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
        
        // Map multiple images
        response.setImageUrls(auction.getImageUrls() != null ? 
            new ArrayList<>(auction.getImageUrls()) : new ArrayList<>());
        
        if (auction.getSeller() != null) {
            response.setSellerId(auction.getSeller().getId());
            response.setSellerName(auction.getSeller().getUsername());
            response.setSellerUsername(auction.getSeller().getUsername());
        }
        
        if (auction.getWinner() != null) {
            response.setWinnerId(auction.getWinner().getId());
            response.setWinnerName(auction.getWinner().getUsername());
            response.setWinnerUsername(auction.getWinner().getUsername());
        }
        
        // Add category display info
        if (auction.getCategory() != null) {
            response.setCategoryDisplay(auction.getCategory().getDisplayNameWithEmoji());
        }
        
        return response;
    }
}