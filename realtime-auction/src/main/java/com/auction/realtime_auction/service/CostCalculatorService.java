package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.CostBreakdownResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CostCalculatorService {
    
    @Value("${platform.fee.percentage}")
    private Double platformFeePercentage;
    
    @Value("${platform.shipping.default}")
    private Double defaultShipping;
    
    /**
     * Calculate total cost breakdown for a bid
     */
    public CostBreakdownResponse calculateCost(BigDecimal bidAmount) {
        // Calculate platform fee
        BigDecimal feeDecimal = BigDecimal.valueOf(platformFeePercentage).divide(BigDecimal.valueOf(100));
        BigDecimal platformFee = bidAmount.multiply(feeDecimal).setScale(2, RoundingMode.HALF_UP);
        
        // Shipping estimate
        BigDecimal shippingEstimate = BigDecimal.valueOf(defaultShipping);
        
        // Total cost
        BigDecimal totalCost = bidAmount.add(platformFee).add(shippingEstimate);
        
        return new CostBreakdownResponse(
            bidAmount,
            platformFee,
            shippingEstimate,
            totalCost,
            platformFeePercentage
        );
    }
}