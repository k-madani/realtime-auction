package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CostBreakdownResponse {
    private BigDecimal bidAmount;
    private BigDecimal platformFee;
    private BigDecimal shippingEstimate;
    private BigDecimal totalCost;
    private Double platformFeePercentage;
}