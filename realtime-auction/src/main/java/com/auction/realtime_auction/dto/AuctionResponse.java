package com.auction.realtime_auction.dto;

import com.auction.realtime_auction.model.Auction.AuctionStatus;
import com.auction.realtime_auction.model.AuctionCategory;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuctionResponse {
    
    private Long id;
    private String title;
    private String description;
    private BigDecimal startingPrice;
    private BigDecimal currentPrice;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AuctionStatus status;
    private AuctionCategory category;
    
    // Image URLs
    private List<String> imageUrls = new ArrayList<>();
    
    // Seller info
    private Long sellerId;
    private String sellerName;
    private String sellerUsername;
    
    // Winner info
    private Long winnerId;
    private String winnerName;
    private String winnerUsername;
    
    // Additional info
    private Integer totalBids;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Display fields
    private String categoryDisplay;
    
    /**
     * Helper method to get primary image for thumbnails
     */
    public String getPrimaryImage() {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            return imageUrls.get(0);
        }
        return null;
    }
    
    /**
     * Check if auction has any images
     */
    public boolean hasImages() {
        return imageUrls != null && !imageUrls.isEmpty();
    }
}