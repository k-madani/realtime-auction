package com.auction.realtime_auction.controller;

import com.auction.realtime_auction.dto.AuctionResponse;
import com.auction.realtime_auction.dto.CreateAuctionRequest;
import com.auction.realtime_auction.service.AuctionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {
    
    private final AuctionService auctionService;
    
    @PostMapping
    public ResponseEntity<AuctionResponse> createAuction(
            @Valid @RequestBody CreateAuctionRequest request,
            Authentication authentication) {
        AuctionResponse response = auctionService.createAuction(
                request, 
                authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getAuction(@PathVariable Long id) {
        AuctionResponse response = auctionService.getAuctionById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<AuctionResponse>> getActiveAuctions() {
        List<AuctionResponse> auctions = auctionService.getAllActiveAuctions();
        return ResponseEntity.ok(auctions);
    }
    
    @GetMapping("/my-auctions")
    public ResponseEntity<List<AuctionResponse>> getMyAuctions(Authentication authentication) {
        List<AuctionResponse> auctions = auctionService.getMyAuctions(authentication.getName());
        return ResponseEntity.ok(auctions);
    }
    
    @PutMapping("/{id}/start")
    public ResponseEntity<Void> startAuction(@PathVariable Long id) {
        auctionService.startAuction(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/end")
    public ResponseEntity<Void> endAuction(@PathVariable Long id) {
        auctionService.endAuction(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelAuction(
            @PathVariable Long id,
            Authentication authentication) {
        auctionService.cancelAuction(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}