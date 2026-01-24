package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.AuctionStatusNotification;
import com.auction.realtime_auction.dto.BidNotification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send bid notification to all users subscribed to the auction
     * Topic: /topic/auction/{auctionId}
     */
    public void sendBidNotification(BidNotification notification) {
        String destination = "/topic/auction/" + notification.getAuctionId();
        messagingTemplate.convertAndSend(destination, notification);
        log.info("Sent bid notification to {}: ${}", destination, notification.getAmount());
    }
    
    /**
     * Send auction status change notification (started, ended, cancelled)
     * Topic: /topic/auction/{auctionId}/status
     */
    public void sendAuctionStatusNotification(AuctionStatusNotification notification) {
        String destination = "/topic/auction/" + notification.getAuctionId() + "/status";
        messagingTemplate.convertAndSend(destination, notification);
        log.info("Sent status notification to {}: {}", destination, notification.getStatus());
    }
}