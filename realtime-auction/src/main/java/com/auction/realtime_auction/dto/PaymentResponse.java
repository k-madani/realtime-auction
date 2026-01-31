package com.auction.realtime_auction.dto;

import com.auction.realtime_auction.model.Payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    
    private Long id;
    private Long auctionId;
    private String auctionTitle;
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;
    private BigDecimal amount;
    private PaymentStatus status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}