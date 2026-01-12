package com.auction.realtime_auction.repository;

import com.auction.realtime_auction.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    
    // Find all bids for an auction
    List<Bid> findByAuctionIdOrderByBidTimeDesc(Long auctionId);
    
    // Find user's bids for an auction
    List<Bid> findByAuctionIdAndBidderIdOrderByBidTimeDesc(Long auctionId, Long bidderId);
    
    // Get highest bid for an auction
    @Query("SELECT b FROM Bid b WHERE b.auction.id = ?1 ORDER BY b.amount DESC LIMIT 1")
    Optional<Bid> findHighestBidForAuction(Long auctionId);
    
    // Count bids for an auction
    Long countByAuctionId(Long auctionId);
    
    // Find all bids by a user
    List<Bid> findByBidderIdOrderByBidTimeDesc(Long bidderId);
}