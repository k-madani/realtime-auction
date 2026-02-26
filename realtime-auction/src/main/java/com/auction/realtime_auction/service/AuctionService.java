package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.AuctionResponse;
import com.auction.realtime_auction.dto.CreateAuctionRequest;
import com.auction.realtime_auction.dto.PriceInsightsResponse;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.ForbiddenException;
import com.auction.realtime_auction.exception.ResourceNotFoundException;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.Auction.AuctionStatus;
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
    private final CloudinaryService cloudinaryService;

    public List<AuctionResponse> getAllAuctions(String status, String category, String search) {
        List<Auction> auctions = auctionRepository.findAll();

        if (status != null && !status.isEmpty()) {
            try {
                AuctionStatus auctionStatus = AuctionStatus.valueOf(status.toUpperCase());
                auctions = auctions.stream()
                        .filter(a -> a.getStatus() == auctionStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status value: " + status);
            }
        }

        if (category != null && !category.isEmpty()) {
            try {
                AuctionCategory auctionCategory = AuctionCategory.valueOf(category.toUpperCase());
                auctions = auctions.stream()
                        .filter(a -> a.getCategory() == auctionCategory)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid category value: " + category);
            }
        }

        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            auctions = auctions.stream()
                    .filter(a -> a.getTitle().toLowerCase().contains(searchLower) ||
                            (a.getDescription() != null && a.getDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        return auctions.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AuctionResponse getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));
        return mapToResponse(auction);
    }

    @Transactional
    public AuctionResponse createAuction(CreateAuctionRequest request, String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        LocalDateTime now = LocalDateTime.now();
        if (request.getStartTime().isBefore(now)) {
            throw new BadRequestException("Start time must be in the future");
        }
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        AuctionCategory category = request.getCategory() != null ? request.getCategory() : AuctionCategory.OTHER;

        Auction auction = new Auction();
        auction.setTitle(request.getTitle());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setCurrentPrice(request.getStartingPrice());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setStatus(AuctionStatus.PENDING);
        auction.setSeller(seller);
        auction.setCategory(category);

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            auction.setImageUrls(new ArrayList<>(request.getImageUrls()));
        }

        return mapToResponse(auctionRepository.save(auction));
    }

    @Transactional
    public AuctionResponse updateAuction(Long id, CreateAuctionRequest request, String username) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        if (!auction.getSeller().getUsername().equals(username)) {
            throw new ForbiddenException("You are not authorized to update this auction");
        }

        if (auction.getStatus() != AuctionStatus.PENDING) {
            throw new BadRequestException("Only auctions that have not started yet can be updated");
        }

        auction.setTitle(request.getTitle());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setCurrentPrice(request.getStartingPrice());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setCategory(request.getCategory());

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            auction.setImageUrls(new ArrayList<>(request.getImageUrls()));
        }

        return mapToResponse(auctionRepository.save(auction));
    }

    @Transactional
    public void deleteAuction(Long id, String username) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        if (!auction.getSeller().getUsername().equals(username)) {
            throw new ForbiddenException("You are not authorized to delete this auction");
        }

        if (auction.getStatus() != AuctionStatus.PENDING) {
            throw new BadRequestException("Only auctions that have not started yet can be deleted");
        }

        if (auction.getTotalBids() > 0) {
            throw new BadRequestException("Cannot delete an auction that already has bids");
        }

        if (auction.getImageUrls() != null && !auction.getImageUrls().isEmpty()) {
            try {
                cloudinaryService.deleteMultipleImages(auction.getImageUrls());
            } catch (Exception e) {
                System.err.println("Failed to delete images from Cloudinary: " + e.getMessage());
            }
        }

        auctionRepository.delete(auction);
    }

    @Transactional
    public void cancelAuction(Long id, String username) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        if (!auction.getSeller().getUsername().equals(username)) {
            throw new ForbiddenException("You are not authorized to cancel this auction");
        }

        if (auction.getStatus() == AuctionStatus.ENDED) {
            throw new BadRequestException("Cannot cancel an auction that has already ended");
        }

        if (auction.getTotalBids() > 0) {
            throw new BadRequestException("Cannot cancel an auction that already has bids");
        }

        auction.setStatus(AuctionStatus.CANCELLED);
        auctionRepository.save(auction);
    }

    public List<AuctionResponse> getAuctionsBySeller(String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return auctionRepository.findBySellerId(seller.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AuctionResponse> getActiveAuctions() {
        return auctionRepository.findByStatus(AuctionStatus.ACTIVE)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AuctionResponse> searchAuctions(String query) {
        return auctionRepository.searchAuctions(query)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public PriceInsightsResponse getPriceInsights(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        List<Auction> completedAuctions = auctionRepository.findByCategoryAndStatus(
                auction.getCategory(), AuctionStatus.ENDED);

        if (completedAuctions.isEmpty()) {
            return new PriceInsightsResponse(
                    auction.getCurrentPrice(), null, null, null, 0,
                    "insufficient_data", 0,
                    "Not enough historical data for price comparison.");
        }

        BigDecimal sum = BigDecimal.ZERO;
        BigDecimal min = completedAuctions.get(0).getCurrentPrice();
        BigDecimal max = completedAuctions.get(0).getCurrentPrice();

        for (Auction a : completedAuctions) {
            BigDecimal price = a.getCurrentPrice();
            sum = sum.add(price);
            if (price.compareTo(min) < 0) min = price;
            if (price.compareTo(max) > 0) max = price;
        }

        BigDecimal average = sum.divide(BigDecimal.valueOf(completedAuctions.size()), 2, RoundingMode.HALF_UP);
        BigDecimal percentageDiff = auction.getCurrentPrice().subtract(average)
                .divide(average, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        int percentageInt = percentageDiff.intValue();

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
                auction.getCurrentPrice(), average, min, max,
                completedAuctions.size(), comparison, percentageInt, recommendation);
    }

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
        response.setImageUrls(auction.getImageUrls() != null ? new ArrayList<>(auction.getImageUrls()) : new ArrayList<>());

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
        if (auction.getCategory() != null) {
            response.setCategoryDisplay(auction.getCategory().getDisplayNameWithEmoji());
        }

        return response;
    }
}