package com.auction.realtime_auction.repository;

import com.auction.realtime_auction.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    
    // Find bids by auction ID, ordered by bid time (newest first)
    List<Bid> findByAuctionIdOrderByBidTimeDesc(Long auctionId);
    
    // Find bids by auction ID, ordered by amount (highest first)
    List<Bid> findByAuctionIdOrderByAmountDesc(Long auctionId);
    
    // Find bids by bidder ID, ordered by bid time (newest first)
    List<Bid> findByBidderIdOrderByBidTimeDesc(Long bidderId);
    
    // Find highest bid for an auction (alternative name)
    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId ORDER BY b.amount DESC")
    Optional<Bid> findHighestBidForAuction(@Param("auctionId") Long auctionId);
    
    // Find highest bid for an auction (Spring Data method)
    Optional<Bid> findFirstByAuctionIdOrderByAmountDesc(Long auctionId);
    
    // Count bids for an auction
    long countByAuctionId(Long auctionId);
    
    // Mark all bids as not winning for an auction
    @Modifying
    @Query("UPDATE Bid b SET b.isWinning = false WHERE b.auction.id = :auctionId")
    void markAllBidsAsNotWinning(@Param("auctionId") Long auctionId);
    
    // Get winning bid for an auction
    Optional<Bid> findByAuctionIdAndIsWinningTrue(Long auctionId);
}