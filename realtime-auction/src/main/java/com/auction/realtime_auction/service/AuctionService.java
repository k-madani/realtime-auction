package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.AuctionResponse;
import com.auction.realtime_auction.dto.CreateAuctionRequest;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionService {
    
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public AuctionResponse createAuction(CreateAuctionRequest request, String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.auction.realtime_auction.exception.ResourceNotFoundException(
                        "User not found: " + username));
        
        // Validate end time is after start time
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new com.auction.realtime_auction.exception.BadRequestException(
                    "End time must be after start time");
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
        auction.setImageUrl(request.getImageUrl());
        
        auction = auctionRepository.save(auction);
        
        return mapToResponse(auction);
    }
    
    public AuctionResponse getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new com.auction.realtime_auction.exception.ResourceNotFoundException(
                        "Auction not found with id: " + id));
        return mapToResponse(auction);
    }
    
    public List<AuctionResponse> getAllActiveAuctions() {
        return auctionRepository.findByStatus(Auction.AuctionStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<AuctionResponse> getMyAuctions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.auction.realtime_auction.exception.ResourceNotFoundException(
                        "User not found: " + username));
        
        return auctionRepository.findBySellerId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void startAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new com.auction.realtime_auction.exception.ResourceNotFoundException(
                        "Auction not found with id: " + auctionId));
        
        if (auction.getStatus() != Auction.AuctionStatus.PENDING) {
            throw new com.auction.realtime_auction.exception.BadRequestException(
                    "Auction cannot be started. Current status: " + auction.getStatus());
        }
        
        auction.setStatus(Auction.AuctionStatus.ACTIVE);
        auctionRepository.save(auction);
    }
    
    @Transactional
    public void endAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new com.auction.realtime_auction.exception.ResourceNotFoundException(
                        "Auction not found with id: " + auctionId));
        
        if (auction.getStatus() != Auction.AuctionStatus.ACTIVE) {
            throw new com.auction.realtime_auction.exception.BadRequestException(
                    "Only active auctions can be ended. Current status: " + auction.getStatus());
        }
        
        auction.setStatus(Auction.AuctionStatus.ENDED);
        auctionRepository.save(auction);
    }
    
    @Transactional
    public void cancelAuction(Long auctionId, String username) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new com.auction.realtime_auction.exception.ResourceNotFoundException(
                        "Auction not found with id: " + auctionId));
        
        if (!auction.getSeller().getUsername().equals(username)) {
            throw new com.auction.realtime_auction.exception.UnauthorizedException(
                    "Only the seller can cancel this auction");
        }
        
        if (auction.getStatus() == Auction.AuctionStatus.ENDED) {
            throw new com.auction.realtime_auction.exception.BadRequestException(
                    "Cannot cancel an auction that has already ended");
        }
        
        auction.setStatus(Auction.AuctionStatus.CANCELLED);
        auctionRepository.save(auction);
    }
    
    private AuctionResponse mapToResponse(Auction auction) {
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
}