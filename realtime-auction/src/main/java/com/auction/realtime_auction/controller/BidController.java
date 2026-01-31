package com.auction.realtime_auction.controller;

import com.auction.realtime_auction.dto.BidResponse;
import com.auction.realtime_auction.dto.PlaceBidRequest;
import com.auction.realtime_auction.service.BidService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BidController {
    
    private final BidService bidService;
    
    /**
     * Place a bid
     */
    @PostMapping
    public ResponseEntity<BidResponse> placeBid(
            @Valid @RequestBody PlaceBidRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        BidResponse bid = bidService.placeBid(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(bid);
    }
    
    /**
     * Get all bids for an auction
     */
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<BidResponse>> getAuctionBids(@PathVariable Long auctionId) {
        List<BidResponse> bids = bidService.getAuctionBids(auctionId);
        return ResponseEntity.ok(bids);
    }
    
    /**
     * Get highest bid for an auction
     */
    @GetMapping("/auction/{auctionId}/highest")
    public ResponseEntity<BidResponse> getHighestBid(@PathVariable Long auctionId) {
        BidResponse bid = bidService.getHighestBid(auctionId);
        return ResponseEntity.ok(bid);
    }
    
    /**
     * Get my bids (current user's bids)
     */
    @GetMapping("/my-bids")
    public ResponseEntity<List<BidResponse>> getMyBids(Authentication authentication) {
        String username = authentication.getName();
        List<BidResponse> bids = bidService.getMyBids(username);
        return ResponseEntity.ok(bids);
    }
}