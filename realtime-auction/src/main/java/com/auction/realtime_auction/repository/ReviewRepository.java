package com.auction.realtime_auction.repository;

import com.auction.realtime_auction.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Find all reviews received by a user (as seller or buyer)
    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);
    
    // Find reviews given by a user
    List<Review> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId);
    
    // Find reviews for a user in a specific role
    List<Review> findByRevieweeIdAndRevieweeRoleOrderByCreatedAtDesc(
            Long revieweeId, 
            Review.ReviewRole role
    );
    
    // Check if a specific review exists
    Optional<Review> findByAuctionIdAndReviewerIdAndRevieweeId(
            Long auctionId, 
            Long reviewerId, 
            Long revieweeId
    );
    
    // Check if review exists
    boolean existsByAuctionIdAndReviewerIdAndRevieweeId(
            Long auctionId,
            Long reviewerId,
            Long revieweeId
    );
    
    // Get both reviews for an auction (seller → buyer and buyer → seller)
    List<Review> findByAuctionIdOrderByCreatedAtDesc(Long auctionId);
    
    // Calculate average rating for user in specific role
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = ?1 AND r.revieweeRole = ?2")
    Double calculateAverageRatingForRole(Long userId, Review.ReviewRole role);
    
    // Calculate overall average rating
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = ?1")
    Double calculateOverallAverageRating(Long userId);
    
    // Count reviews for user in specific role
    Long countByRevieweeIdAndRevieweeRole(Long userId, Review.ReviewRole role);
}