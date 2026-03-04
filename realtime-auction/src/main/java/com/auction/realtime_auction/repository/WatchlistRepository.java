package com.auction.realtime_auction.repository;

import com.auction.realtime_auction.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    
    // Find all watchlist items for a user
    List<Watchlist> findByUserIdOrderByAddedAtDesc(Long userId);
    
    // Check if user has auction in watchlist
    boolean existsByUserIdAndAuctionId(Long userId, Long auctionId);
    
    // Find specific watchlist item
    Optional<Watchlist> findByUserIdAndAuctionId(Long userId, Long auctionId);
    
    // Count watchlist items for a user
    Long countByUserId(Long userId);
    
    // Get all auction IDs in user's watchlist
    @Query("SELECT w.auction.id FROM Watchlist w WHERE w.user.id = ?1")
    List<Long> findAuctionIdsByUserId(Long userId);
}