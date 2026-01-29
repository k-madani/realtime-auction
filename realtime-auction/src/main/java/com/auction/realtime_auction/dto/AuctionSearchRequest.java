package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuctionSearchRequest {
    private String keyword;           // Search in title/description
    private String status;            // ACTIVE, PENDING, ENDED
    private String category;          // NEW: Category filter (ELECTRONICS, FASHION, etc.)
    private BigDecimal minPrice;      // Minimum current price
    private BigDecimal maxPrice;      // Maximum current price
    private String endTimeFilter;     // "1h", "24h", "7d" (ending within)
    private String sortBy;            // "endingSoon", "newest", "priceLow", "priceHigh", "mostBids"
}