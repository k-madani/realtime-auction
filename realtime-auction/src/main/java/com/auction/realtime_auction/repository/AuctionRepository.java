package com.auction.realtime_auction.repository;

import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.AuctionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    
    // Find all active auctions
    List<Auction> findByStatus(Auction.AuctionStatus status);
    
    // Find auctions by seller
    List<Auction> findBySellerId(Long sellerId);
    
    // NEW: Find by category
    List<Auction> findByCategory(AuctionCategory category);
    
    // NEW: Find by category and status
    List<Auction> findByCategoryAndStatus(AuctionCategory category, Auction.AuctionStatus status);
    
    // Find auctions ending soon (within next hour)
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' AND a.endTime BETWEEN ?1 AND ?2")
    List<Auction> findEndingSoon(LocalDateTime now, LocalDateTime oneHourLater);
    
    // Find expired auctions that need to be closed
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' AND a.endTime < ?1")
    List<Auction> findExpiredAuctions(LocalDateTime now);
    
    /**
     * Search auctions by keyword (title or description)
     */
    @Query("SELECT a FROM Auction a WHERE " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Auction> searchByKeyword(@Param("keyword") String keyword);
    
    /**
     * Advanced search with filters (UPDATED with category)
     */
    @Query("SELECT a FROM Auction a WHERE " +
           "(:keyword IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:minPrice IS NULL OR a.currentPrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR a.currentPrice <= :maxPrice) AND " +
           "(:endsBefore IS NULL OR a.endTime <= :endsBefore)")
    List<Auction> searchWithFilters(
            @Param("keyword") String keyword,
            @Param("status") Auction.AuctionStatus status,
            @Param("category") AuctionCategory category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("endsBefore") LocalDateTime endsBefore
    );
    
    /**
     * Get all auctions ordered by end time (ending soonest first)
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' ORDER BY a.endTime ASC")
    List<Auction> findActiveOrderByEndTimeAsc();
    
    /**
     * Get all auctions ordered by price (low to high)
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' ORDER BY a.currentPrice ASC")
    List<Auction> findActiveOrderByPriceAsc();
    
    /**
     * Get all auctions ordered by price (high to low)
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' ORDER BY a.currentPrice DESC")
    List<Auction> findActiveOrderByPriceDesc();
    
    /**
     * Get all auctions ordered by most bids
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' ORDER BY a.totalBids DESC")
    List<Auction> findActiveOrderByBidsDesc();
    
    /**
     * Get all auctions ordered by newest first
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' ORDER BY a.createdAt DESC")
    List<Auction> findActiveOrderByNewestFirst();
}