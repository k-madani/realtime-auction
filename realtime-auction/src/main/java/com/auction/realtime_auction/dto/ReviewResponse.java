package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long auctionId;
    private String auctionTitle;
    private String reviewerUsername;
    private String revieweeUsername;
    private String revieweeRole;  // "SELLER" or "BUYER"
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}