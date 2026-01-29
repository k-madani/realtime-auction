package com.auction.realtime_auction.controller;

import com.auction.realtime_auction.dto.WatchlistResponse;
import com.auction.realtime_auction.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {
    
    private final WatchlistService watchlistService;
    
    /**
     * Add auction to watchlist
     */
    @PostMapping("/auction/{auctionId}")
    public ResponseEntity<WatchlistResponse> addToWatchlist(
            @PathVariable Long auctionId,
            Authentication authentication) {
        WatchlistResponse response = watchlistService.addToWatchlist(
                auctionId, 
                authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Remove auction from watchlist
     */
    @DeleteMapping("/auction/{auctionId}")
    public ResponseEntity<Map<String, String>> removeFromWatchlist(
            @PathVariable Long auctionId,
            Authentication authentication) {
        watchlistService.removeFromWatchlist(auctionId, authentication.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Removed from watchlist");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user's watchlist
     */
    @GetMapping
    public ResponseEntity<List<WatchlistResponse>> getMyWatchlist(Authentication authentication) {
        List<WatchlistResponse> watchlist = watchlistService.getMyWatchlist(authentication.getName());
        return ResponseEntity.ok(watchlist);
    }
    
    /**
     * Check if auction is in watchlist
     */
    @GetMapping("/check/{auctionId}")
    public ResponseEntity<Map<String, Boolean>> checkWatchlist(
            @PathVariable Long auctionId,
            Authentication authentication) {
        boolean isInWatchlist = watchlistService.isInWatchlist(auctionId, authentication.getName());
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("isInWatchlist", isInWatchlist);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all watchlist auction IDs (for bulk check)
     */
    @GetMapping("/auction-ids")
    public ResponseEntity<List<Long>> getWatchlistAuctionIds(Authentication authentication) {
        List<Long> auctionIds = watchlistService.getWatchlistAuctionIds(authentication.getName());
        return ResponseEntity.ok(auctionIds);
    }
}