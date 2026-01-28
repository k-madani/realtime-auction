package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {
    // Seller stats
    private Integer totalAuctionsCreated;
    private Integer activeAuctions;
    private Integer endedAuctions;
    private BigDecimal totalRevenue;  // Sum of winning bids on your auctions
    
    // Bidder stats
    private Integer totalBidsPlaced;
    private Integer auctionsWon;
    private Integer currentlyWinning;  // Active auctions where you're winning
    private BigDecimal totalSpent;  // Sum of won auctions
    
    // Recent activity
    private List<AuctionResponse> recentAuctions;  // Your 5 most recent auctions
    private List<BidResponse> recentBids;  // Your 5 most recent bids
}