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
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate end time is after start time
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
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
                .orElseThrow(() -> new RuntimeException("Auction not found"));
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
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return auctionRepository.findBySellerId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void startAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        
        if (auction.getStatus() != Auction.AuctionStatus.PENDING) {
            throw new RuntimeException("Auction cannot be started");
        }
        
        auction.setStatus(Auction.AuctionStatus.ACTIVE);
        auctionRepository.save(auction);
    }
    
    @Transactional
    public void endAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        
        if (auction.getStatus() != Auction.AuctionStatus.ACTIVE) {
            throw new RuntimeException("Auction is not active");
        }
        
        auction.setStatus(Auction.AuctionStatus.ENDED);
        auctionRepository.save(auction);
    }
    
    @Transactional
    public void cancelAuction(Long auctionId, String username) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        
        if (!auction.getSeller().getUsername().equals(username)) {
            throw new RuntimeException("Only seller can cancel the auction");
        }
        
        if (auction.getStatus() == Auction.AuctionStatus.ENDED) {
            throw new RuntimeException("Cannot cancel ended auction");
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