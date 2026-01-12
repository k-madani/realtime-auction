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
public class BidController {
    
    private final BidService bidService;
    
    @PostMapping("/auction/{auctionId}")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable Long auctionId,
            @Valid @RequestBody PlaceBidRequest request,
            Authentication authentication) {
        try {
            BidResponse response = bidService.placeBid(
                    auctionId,
                    request,
                    authentication.getName()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<BidResponse>> getAuctionBids(@PathVariable Long auctionId) {
        List<BidResponse> bids = bidService.getAuctionBids(auctionId);
        return ResponseEntity.ok(bids);
    }
    
    @GetMapping("/auction/{auctionId}/highest")
    public ResponseEntity<BidResponse> getHighestBid(@PathVariable Long auctionId) {
        BidResponse bid = bidService.getHighestBid(auctionId);
        if (bid != null) {
            return ResponseEntity.ok(bid);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/my-bids")
    public ResponseEntity<List<BidResponse>> getMyBids(Authentication authentication) {
        List<BidResponse> bids = bidService.getMyBids(authentication.getName());
        return ResponseEntity.ok(bids);
    }
}