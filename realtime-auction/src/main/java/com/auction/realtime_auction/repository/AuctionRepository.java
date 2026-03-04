package com.auction.realtime_auction.repository;

import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.AuctionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    
    // Find by seller
    List<Auction> findBySellerId(Long sellerId);
    
    // Find by status
    List<Auction> findByStatus(Auction.AuctionStatus status);
    
    // Find by category and status
    List<Auction> findByCategoryAndStatus(AuctionCategory category, Auction.AuctionStatus status);
    
    // Find pending auctions that should start
    List<Auction> findByStatusAndStartTimeBefore(Auction.AuctionStatus status, LocalDateTime time);
    
    // Find active auctions that should end
    List<Auction> findByStatusAndEndTimeBefore(Auction.AuctionStatus status, LocalDateTime time);
    
    // Find expired auctions (alias for findByStatusAndEndTimeBefore)
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' AND a.endTime < :currentTime")
    List<Auction> findExpiredAuctions(@Param("currentTime") LocalDateTime currentTime);
    
    // Search auctions by title or description
    @Query("SELECT a FROM Auction a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Auction> searchAuctions(@Param("query") String query);
}