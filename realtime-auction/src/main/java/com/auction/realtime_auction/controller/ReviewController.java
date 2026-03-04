package com.auction.realtime_auction.controller;

import com.auction.realtime_auction.dto.CreateReviewRequest;
import com.auction.realtime_auction.dto.ReviewResponse;
import com.auction.realtime_auction.dto.UserRatingResponse;
import com.auction.realtime_auction.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    /**
     * Create a review for an auction
     */
    @PostMapping("/auction/{auctionId}")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long auctionId,
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {
        ReviewResponse response = reviewService.createReview(
                auctionId,
                request,
                authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get all reviews for a user
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<UserRatingResponse> getUserRatings(@PathVariable String username) {
        UserRatingResponse ratings = reviewService.getUserRatings(username);
        return ResponseEntity.ok(ratings);
    }
    
    /**
     * Get reviews for a specific auction
     */
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<ReviewResponse>> getAuctionReviews(@PathVariable Long auctionId) {
        List<ReviewResponse> reviews = reviewService.getAuctionReviews(auctionId);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Check if user can review an auction
     */
    @GetMapping("/auction/{auctionId}/can-review")
    public ResponseEntity<Map<String, Boolean>> canReviewAuction(
            @PathVariable Long auctionId,
            Authentication authentication) {
        boolean canReview = reviewService.canReviewAuction(auctionId, authentication.getName());
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("canReview", canReview);
        return ResponseEntity.ok(response);
    }
}