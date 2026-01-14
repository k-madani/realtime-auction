package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidNotification {
    private Long auctionId;
    private String bidderUsername;
    private BigDecimal amount;
    private BigDecimal currentPrice;
    private Integer totalBids;
    private LocalDateTime bidTime;
    private String message;
}