package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRatingResponse {
    private Long userId;
    private String username;
    
    // Overall ratings
    private Double overallRating;
    private Integer totalReviews;
    
    // As seller
    private Double sellerRating;
    private Integer sellerReviews;
    
    // As buyer
    private Double buyerRating;
    private Integer buyerReviews;
    
    // Recent reviews (last 10)
    private List<ReviewResponse> recentReviews;
}