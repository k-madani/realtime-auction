package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.AuctionResponse;
import com.auction.realtime_auction.dto.AuctionSearchRequest;
import com.auction.realtime_auction.dto.AuctionStatusNotification;
import com.auction.realtime_auction.dto.CreateAuctionRequest;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.ResourceNotFoundException;
import com.auction.realtime_auction.exception.UnauthorizedException;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionService {

        private final AuctionRepository auctionRepository;
        private final UserRepository userRepository;
        private final WebSocketNotificationService notificationService;

        @Transactional
        public AuctionResponse createAuction(CreateAuctionRequest request, String username) {
                User seller = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found: " + username));

                // Validate end time is after start time
                if (request.getEndTime().isBefore(request.getStartTime())) {
                        throw new BadRequestException(
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
                                .orElseThrow(() -> new ResourceNotFoundException(
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
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found: " + username));

                return auctionRepository.findBySellerId(user.getId())
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void startAuction(Long auctionId) {
                Auction auction = auctionRepository.findById(auctionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Auction not found with id: " + auctionId));

                if (auction.getStatus() != Auction.AuctionStatus.PENDING) {
                        throw new BadRequestException(
                                        "Auction cannot be started. Current status: " + auction.getStatus());
                }

                auction.setStatus(Auction.AuctionStatus.ACTIVE);
                auctionRepository.save(auction);

                // Send WebSocket notification
                AuctionStatusNotification notification = new AuctionStatusNotification(
                                auctionId,
                                "ACTIVE",
                                "Auction has started!",
                                null);
                notificationService.sendAuctionStatusNotification(notification);
        }

        @Transactional
        public void endAuction(Long auctionId) {
                Auction auction = auctionRepository.findById(auctionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Auction not found with id: " + auctionId));

                if (auction.getStatus() != Auction.AuctionStatus.ACTIVE) {
                        throw new BadRequestException(
                                        "Only active auctions can be ended. Current status: " + auction.getStatus());
                }

                auction.setStatus(Auction.AuctionStatus.ENDED);
                auctionRepository.save(auction);

                // Send WebSocket notification
                String winnerUsername = auction.getWinner() != null ? auction.getWinner().getUsername() : null;
                AuctionStatusNotification notification = new AuctionStatusNotification(
                                auctionId,
                                "ENDED",
                                "Auction has ended!",
                                winnerUsername);
                notificationService.sendAuctionStatusNotification(notification);
        }

        @Transactional
        public void cancelAuction(Long auctionId, String username) {
                Auction auction = auctionRepository.findById(auctionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Auction not found with id: " + auctionId));

                if (!auction.getSeller().getUsername().equals(username)) {
                        throw new UnauthorizedException(
                                        "Only the seller can cancel this auction");
                }

                if (auction.getStatus() == Auction.AuctionStatus.ENDED) {
                        throw new BadRequestException(
                                        "Cannot cancel an auction that has already ended");
                }

                auction.setStatus(Auction.AuctionStatus.CANCELLED);
                auctionRepository.save(auction);

                // Send WebSocket notification
                AuctionStatusNotification notification = new AuctionStatusNotification(
                                auctionId,
                                "CANCELLED",
                                "Auction has been cancelled by the seller",
                                null);
                notificationService.sendAuctionStatusNotification(notification);
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
                                auction.getCreatedAt());
        }

        /**
         * Search and filter auctions
         */
        public List<AuctionResponse> searchAuctions(AuctionSearchRequest request) {
                List<Auction> auctions;

                // Determine end time filter
                LocalDateTime endsBefore = null;
                if (request.getEndTimeFilter() != null) {
                        LocalDateTime now = LocalDateTime.now();
                        switch (request.getEndTimeFilter()) {
                                case "1h":
                                        endsBefore = now.plusHours(1);
                                        break;
                                case "24h":
                                        endsBefore = now.plusHours(24);
                                        break;
                                case "7d":
                                        endsBefore = now.plusDays(7);
                                        break;
                        }
                }

                // Parse status
                Auction.AuctionStatus status = null;
                if (request.getStatus() != null && !request.getStatus().isEmpty()) {
                        try {
                                status = Auction.AuctionStatus.valueOf(request.getStatus().toUpperCase());
                        } catch (IllegalArgumentException e) {
                                // Invalid status, ignore
                        }
                }

                // Execute search with filters
                auctions = auctionRepository.searchWithFilters(
                                request.getKeyword(),
                                status,
                                request.getMinPrice(),
                                request.getMaxPrice(),
                                endsBefore);

                // Apply sorting
                if (request.getSortBy() != null) {
                        switch (request.getSortBy()) {
                                case "endingSoon":
                                        auctions.sort(Comparator.comparing(Auction::getEndTime));
                                        break;
                                case "newest":
                                        auctions.sort(Comparator.comparing(Auction::getCreatedAt).reversed());
                                        break;
                                case "priceLow":
                                        auctions.sort(Comparator.comparing(Auction::getCurrentPrice));
                                        break;
                                case "priceHigh":
                                        auctions.sort(Comparator.comparing(Auction::getCurrentPrice).reversed());
                                        break;
                                case "mostBids":
                                        auctions.sort(Comparator.comparing(Auction::getTotalBids).reversed());
                                        break;
                        }
                }

                return auctions.stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Get auctions ending soon (within 1 hour)
         */
        public List<AuctionResponse> getEndingSoonAuctions() {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime oneHourLater = now.plusHours(1);

                return auctionRepository.findEndingSoon(now, oneHourLater)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }
}