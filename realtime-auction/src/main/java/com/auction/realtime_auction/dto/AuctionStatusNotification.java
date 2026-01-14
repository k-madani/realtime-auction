package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuctionStatusNotification {
    private Long auctionId;
    private String status;
    private String message;
    private String winnerUsername;
}