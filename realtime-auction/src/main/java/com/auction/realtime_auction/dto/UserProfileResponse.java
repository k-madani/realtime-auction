package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;
    
    // Statistics
    private Integer totalAuctionsCreated;
    private Integer activeAuctionsCount;
    private Integer totalBidsPlaced;
    private Integer auctionsWon;
}