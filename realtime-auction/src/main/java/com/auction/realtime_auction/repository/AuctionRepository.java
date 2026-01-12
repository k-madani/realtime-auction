package com.auction.realtime_auction.repository;

import com.auction.realtime_auction.model.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    
    // Find all active auctions
    List<Auction> findByStatus(Auction.AuctionStatus status);
    
    // Find auctions by seller
    List<Auction> findBySellerId(Long sellerId);
    
    // Find auctions ending soon (within next hour)
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' AND a.endTime BETWEEN ?1 AND ?2")
    List<Auction> findEndingSoon(LocalDateTime now, LocalDateTime oneHourLater);
    
    // Find expired auctions that need to be closed
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' AND a.endTime < ?1")
    List<Auction> findExpiredAuctions(LocalDateTime now);
}