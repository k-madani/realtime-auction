package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidResponse {
    private Long id;
    private Long auctionId;
    private String bidderUsername;
    private BigDecimal amount;
    private LocalDateTime bidTime;
    private Boolean isWinning;
}