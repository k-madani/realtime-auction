package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.CreateReviewRequest;
import com.auction.realtime_auction.dto.ReviewResponse;
import com.auction.realtime_auction.dto.UserRatingResponse;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.ResourceNotFoundException;
import com.auction.realtime_auction.exception.UnauthorizedException;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.Review;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.ReviewRepository;
import com.auction.realtime_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    
    /**
     * Create a review for an auction
     * Winner reviews seller OR Seller reviews winner
     */
    @Transactional
    public ReviewResponse createReview(
            Long auctionId,
            CreateReviewRequest request,
            String reviewerUsername
    ) {
        // Get auction
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + auctionId));
        
        // Get reviewer
        User reviewer = userRepository.findByUsername(reviewerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + reviewerUsername));
        
        // Validate auction has ended
        if (auction.getStatus() != Auction.AuctionStatus.ENDED) {
            throw new BadRequestException("Can only review completed auctions");
        }
        
        // Validate auction has a winner
        if (auction.getWinner() == null) {
            throw new BadRequestException("Cannot review auction with no winner");
        }
        
        User seller = auction.getSeller();
        User winner = auction.getWinner();
        
        // Determine who is being reviewed
        User reviewee;
        Review.ReviewRole revieweeRole;
        
        if (reviewer.getId().equals(winner.getId())) {
            // Winner is reviewing the seller
            reviewee = seller;
            revieweeRole = Review.ReviewRole.SELLER;
        } else if (reviewer.getId().equals(seller.getId())) {
            // Seller is reviewing the winner (buyer)
            reviewee = winner;
            revieweeRole = Review.ReviewRole.BUYER;
        } else {
            throw new UnauthorizedException("Only auction participants can leave reviews");
        }
        
        // Check if review already exists
        if (reviewRepository.existsByAuctionIdAndReviewerIdAndRevieweeId(
                auctionId, reviewer.getId(), reviewee.getId())) {
            throw new BadRequestException("You have already reviewed this transaction");
        }
        
        // Create review
        Review review = new Review();
        review.setAuction(auction);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRevieweeRole(revieweeRole);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        review = reviewRepository.save(review);
        
        // Update reviewee's ratings
        updateUserRatings(reviewee.getId());
        
        return mapToResponse(review);
    }
    
    /**
     * Get all reviews for a user
     */
    public UserRatingResponse getUserRatings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        List<ReviewResponse> recentReviews = reviewRepository
                .findByRevieweeIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return new UserRatingResponse(
                user.getId(),
                user.getUsername(),
                user.getOverallRating(),
                user.getTotalReviews(),
                user.getSellerRating(),
                user.getSellerReviews(),
                user.getBuyerRating(),
                user.getBuyerReviews(),
                recentReviews
        );
    }
    
    /**
     * Get reviews for a specific auction
     */
    public List<ReviewResponse> getAuctionReviews(Long auctionId) {
        return reviewRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if user can review an auction
     */
    public boolean canReviewAuction(Long auctionId, String username) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + auctionId));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        // Must be ended
        if (auction.getStatus() != Auction.AuctionStatus.ENDED) {
            return false;
        }
        
        // Must have winner
        if (auction.getWinner() == null) {
            return false;
        }
        
        // Must be seller or winner
        boolean isParticipant = user.getId().equals(auction.getSeller().getId()) ||
                               user.getId().equals(auction.getWinner().getId());
        
        if (!isParticipant) {
            return false;
        }
        
        // Determine who they would review
        Long revieweeId = user.getId().equals(auction.getWinner().getId()) ?
                auction.getSeller().getId() : auction.getWinner().getId();
        
        // Check if already reviewed
        return !reviewRepository.existsByAuctionIdAndReviewerIdAndRevieweeId(
                auctionId, user.getId(), revieweeId);
    }
    
    /**
     * Update user's rating statistics
     */
    @Transactional
    protected void updateUserRatings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        // Calculate overall rating
        Double overallRating = reviewRepository.calculateOverallAverageRating(userId);
        user.setOverallRating(overallRating != null ? overallRating : 0.0);
        
        // Calculate seller rating
        Double sellerRating = reviewRepository.calculateAverageRatingForRole(
                userId, Review.ReviewRole.SELLER);
        user.setSellerRating(sellerRating != null ? sellerRating : 0.0);
        
        Long sellerCount = reviewRepository.countByRevieweeIdAndRevieweeRole(
                userId, Review.ReviewRole.SELLER);
        user.setSellerReviews(sellerCount != null ? sellerCount.intValue() : 0);
        
        // Calculate buyer rating
        Double buyerRating = reviewRepository.calculateAverageRatingForRole(
                userId, Review.ReviewRole.BUYER);
        user.setBuyerRating(buyerRating != null ? buyerRating : 0.0);
        
        Long buyerCount = reviewRepository.countByRevieweeIdAndRevieweeRole(
                userId, Review.ReviewRole.BUYER);
        user.setBuyerReviews(buyerCount != null ? buyerCount.intValue() : 0);
        
        // Total reviews
        user.setTotalReviews(user.getSellerReviews() + user.getBuyerReviews());
        
        userRepository.save(user);
    }
    
    private ReviewResponse mapToResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getAuction().getId(),
                review.getAuction().getTitle(),
                review.getReviewer().getUsername(),
                review.getReviewee().getUsername(),
                review.getRevieweeRole().name(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}