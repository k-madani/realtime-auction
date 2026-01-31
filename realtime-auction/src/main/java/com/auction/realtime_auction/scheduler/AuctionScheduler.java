package com.auction.realtime_auction.scheduler;

import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.Bid;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuctionScheduler {
    
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Auto-start pending auctions
     * Runs every 30 seconds
     */
    @Scheduled(fixedRate = 30000) // 30 seconds
    @Transactional
    public void autoStartAuctions() {
        LocalDateTime now = LocalDateTime.now();
        
        List<Auction> pendingAuctions = auctionRepository.findByStatusAndStartTimeBefore(
            Auction.AuctionStatus.PENDING,
            now
        );
        
        for (Auction auction : pendingAuctions) {
            auction.setStatus(Auction.AuctionStatus.ACTIVE);
            auctionRepository.save(auction);
            
            // Send WebSocket notification
            Map<String, Object> notification = new HashMap<>();
            notification.put("auctionId", auction.getId());
            notification.put("status", "ACTIVE");
            notification.put("message", "Auction has started!");
            
            // Fix: Cast to specific types to resolve ambiguity
            messagingTemplate.convertAndSend(
                (String) ("/topic/auction/" + auction.getId() + "/status"),
                (Object) notification
            );
            
            System.out.println("✅ Auto-started auction: " + auction.getTitle());
        }
    }
    
    /**
     * Auto-end expired auctions
     * Runs every 30 seconds
     */
    @Scheduled(fixedRate = 30000) // 30 seconds
    @Transactional
    public void autoEndAuctions() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find expired auctions
        List<Auction> expiredAuctions = auctionRepository.findExpiredAuctions(now);
        
        for (Auction auction : expiredAuctions) {
            auction.setStatus(Auction.AuctionStatus.ENDED);
            
            // Determine winner from highest bid
            List<Bid> bids = bidRepository.findByAuctionIdOrderByAmountDesc(auction.getId());
            if (!bids.isEmpty()) {
                Bid winningBid = bids.get(0);
                auction.setWinner(winningBid.getBidder());
                
                // Mark winning bid
                winningBid.setIsWinning(true);
                bidRepository.save(winningBid);
            }
            
            auctionRepository.save(auction);
            
            // Send WebSocket notification
            Map<String, Object> notification = new HashMap<>();
            notification.put("auctionId", auction.getId());
            notification.put("status", "ENDED");
            notification.put("message", "Auction has ended!");
            if (auction.getWinner() != null) {
                notification.put("winner", auction.getWinner().getUsername());
            }
            
            // Fix: Cast to specific types to resolve ambiguity
            messagingTemplate.convertAndSend(
                (String) ("/topic/auction/" + auction.getId() + "/status"),
                (Object) notification
            );
            
            System.out.println("✅ Auto-ended auction: " + auction.getTitle());
        }
    }
    
    /**
     * Log auction statistics
     * Runs every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void logAuctionStats() {
        long total = auctionRepository.count();
        long pending = auctionRepository.findByStatus(Auction.AuctionStatus.PENDING).size();
        long active = auctionRepository.findByStatus(Auction.AuctionStatus.ACTIVE).size();
        long ended = auctionRepository.findByStatus(Auction.AuctionStatus.ENDED).size();
        
        System.out.println("📊 Auction Statistics:");
        System.out.println("   Total: " + total);
        System.out.println("   Pending: " + pending);
        System.out.println("   Active: " + active);
        System.out.println("   Ended: " + ended);
    }
}