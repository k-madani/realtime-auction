package com.auction.realtime_auction.scheduler;

import com.auction.realtime_auction.dto.AuctionStatusNotification;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {
    
    private final AuctionRepository auctionRepository;
    private final WebSocketNotificationService notificationService;
    
    /**
     * Auto-start auctions that have reached their start time
     * Runs every 30 seconds
     */
    @Scheduled(fixedRate = 30000) // 30 seconds
    @Transactional
    public void startPendingAuctions() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find auctions that are PENDING and startTime has passed
        List<Auction> auctionsToStart = auctionRepository.findAll().stream()
                .filter(a -> a.getStatus() == Auction.AuctionStatus.PENDING)
                .filter(a -> a.getStartTime().isBefore(now) || a.getStartTime().isEqual(now))
                .toList();
        
        for (Auction auction : auctionsToStart) {
            auction.setStatus(Auction.AuctionStatus.ACTIVE);
            auctionRepository.save(auction);
            
            log.info("✅ Auto-started auction: '{}' (ID: {})", auction.getTitle(), auction.getId());
            
            // Send WebSocket notification
            AuctionStatusNotification notification = new AuctionStatusNotification(
                    auction.getId(),
                    "ACTIVE",
                    "Auction has started automatically!",
                    null
            );
            notificationService.sendAuctionStatusNotification(notification);
        }
    }
    
    /**
     * Auto-end auctions that have passed their end time
     * Runs every 30 seconds
     */
    @Scheduled(fixedRate = 30000) // 30 seconds
    @Transactional
    public void endExpiredAuctions() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find auctions that are ACTIVE and endTime has passed
        List<Auction> auctionsToEnd = auctionRepository.findExpiredAuctions(now);
        
        for (Auction auction : auctionsToEnd) {
            auction.setStatus(Auction.AuctionStatus.ENDED);
            auctionRepository.save(auction);
            
            String winnerUsername = auction.getWinner() != null 
                    ? auction.getWinner().getUsername() 
                    : "No winner";
            
            log.info("🏁 Auto-ended auction: '{}' (ID: {}), Winner: {}", 
                    auction.getTitle(), auction.getId(), winnerUsername);
            
            // Send WebSocket notification
            AuctionStatusNotification notification = new AuctionStatusNotification(
                    auction.getId(),
                    "ENDED",
                    "Auction has ended!",
                    auction.getWinner() != null ? auction.getWinner().getUsername() : null
            );
            notificationService.sendAuctionStatusNotification(notification);
        }
    }
    
    /**
     * Log auction statistics every 5 minutes for monitoring
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void logAuctionStats() {
        long activeCount = auctionRepository.findByStatus(Auction.AuctionStatus.ACTIVE).size();
        long pendingCount = auctionRepository.findByStatus(Auction.AuctionStatus.PENDING).size();
        long endedCount = auctionRepository.findByStatus(Auction.AuctionStatus.ENDED).size();
        
        log.info("📊 Auction Stats - Active: {}, Pending: {}, Ended: {}", 
                activeCount, pendingCount, endedCount);
    }
}