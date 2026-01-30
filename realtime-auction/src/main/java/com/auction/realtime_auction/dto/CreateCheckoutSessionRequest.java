package com.auction.realtime_auction.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCheckoutSessionRequest {
    
    @NotNull(message = "Auction ID is required")
    private Long auctionId;
}