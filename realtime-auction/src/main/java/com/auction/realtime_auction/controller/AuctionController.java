package com.auction.realtime_auction.controller;

import com.auction.realtime_auction.dto.*;
import com.auction.realtime_auction.model.AuctionCategory;
import com.auction.realtime_auction.service.AuctionService;
import com.auction.realtime_auction.service.CostCalculatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.auction.realtime_auction.model.User;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuctionController {
    
    private final AuctionService auctionService;
    private final CostCalculatorService costCalculatorService;
    
    /**
     * Get all auctions with optional filters
     */
    @GetMapping
    public ResponseEntity<List<AuctionResponse>> getAllAuctions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        List<AuctionResponse> auctions = auctionService.getAllAuctions(status, category, search);
        return ResponseEntity.ok(auctions);
    }
    
    /**
     * Get auction by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getAuctionById(@PathVariable Long id) {
        AuctionResponse auction = auctionService.getAuctionById(id);
        return ResponseEntity.ok(auction);
    }
    
    /**
     * Create new auction
     */
    @PostMapping
    public ResponseEntity<AuctionResponse> createAuction(
            @Valid @RequestBody CreateAuctionRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        AuctionResponse auction = auctionService.createAuction(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(auction);
    }
    
    /**
     * Update auction
     */
    @PutMapping("/{id}")
    public ResponseEntity<AuctionResponse> updateAuction(
            @PathVariable Long id,
            @Valid @RequestBody CreateAuctionRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        AuctionResponse auction = auctionService.updateAuction(id, request, username);
        return ResponseEntity.ok(auction);
    }

    /**
     * Delete auction
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAuction(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        
        auctionService.deleteAuction(id, user.getUsername());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Auction deleted successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Cancel auction
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelAuction(
            @PathVariable Long id,
            Authentication authentication) {
        
        String username = authentication.getName();
        auctionService.cancelAuction(id, username);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get auctions by seller
     */
    @GetMapping("/seller/{username}")
    public ResponseEntity<List<AuctionResponse>> getAuctionsBySeller(@PathVariable String username) {
        List<AuctionResponse> auctions = auctionService.getAuctionsBySeller(username);
        return ResponseEntity.ok(auctions);
    }
    
    /**
     * Get my auctions (current user)
     */
    @GetMapping("/my-auctions")
    public ResponseEntity<List<AuctionResponse>> getMyAuctions(Authentication authentication) {
        String username = authentication.getName();
        List<AuctionResponse> auctions = auctionService.getAuctionsBySeller(username);
        return ResponseEntity.ok(auctions);
    }
    
    /**
     * Get active auctions
     */
    @GetMapping("/active")
    public ResponseEntity<List<AuctionResponse>> getActiveAuctions() {
        List<AuctionResponse> auctions = auctionService.getActiveAuctions();
        return ResponseEntity.ok(auctions);
    }
    
    /**
     * Get categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        List<CategoryResponse> categories = Arrays.stream(AuctionCategory.values())
                .map(category -> new CategoryResponse(
                        category.name(),
                        category.getDisplayName(),
                        category.getDisplayNameWithEmoji()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Search auctions
     */
    @GetMapping("/search")
    public ResponseEntity<List<AuctionResponse>> searchAuctions(
            @RequestParam String query) {
        List<AuctionResponse> auctions = auctionService.searchAuctions(query);
        return ResponseEntity.ok(auctions);
    }
    
    /**
     * Get cost breakdown for a bid amount
     */
    @GetMapping("/{id}/cost-breakdown")
    public ResponseEntity<CostBreakdownResponse> getCostBreakdown(
            @PathVariable Long id,
            @RequestParam BigDecimal bidAmount) {
        
        CostBreakdownResponse breakdown = costCalculatorService.calculateCost(bidAmount);
        return ResponseEntity.ok(breakdown);
    }
    
    /**
     * Get price insights for an auction
     */
    @GetMapping("/{id}/price-insights")
    public ResponseEntity<PriceInsightsResponse> getPriceInsights(@PathVariable Long id) {
        PriceInsightsResponse insights = auctionService.getPriceInsights(id);
        return ResponseEntity.ok(insights);
    }
}