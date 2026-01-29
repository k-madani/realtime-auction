package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistResponse {
    private Long id;
    private AuctionResponse auction;
    private LocalDateTime addedAt;
}