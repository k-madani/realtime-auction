package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceInsightsResponse {
    private BigDecimal currentPrice;
    private BigDecimal averagePrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer totalSoldItems;
    private String priceComparison; // "below_average", "average", "above_average"
    private Integer percentageDifference; // e.g., -15 means 15% below average
    private String recommendation;
}