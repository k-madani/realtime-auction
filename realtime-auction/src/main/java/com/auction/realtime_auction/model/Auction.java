package com.auction.realtime_auction.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "auctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private BigDecimal startingPrice;
    
    @Column(nullable = false)
    private BigDecimal currentPrice;
    
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    @Column(nullable = false)
    private LocalDateTime endTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus status = AuctionStatus.PENDING;
    
    // Category field
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionCategory category = AuctionCategory.OTHER;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;
    
    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL)
    private List<Bid> bids;
    
    // DEPRECATED: Keep for backward compatibility (will be removed later)
    @Deprecated
    private String imageUrl;
    
    // NEW: Multiple image URLs stored in separate table
    @ElementCollection
    @CollectionTable(name = "auction_images", joinColumns = @JoinColumn(name = "auction_id"))
    @Column(name = "image_url", length = 500)
    private List<String> imageUrls = new ArrayList<>();
    
    @Column(nullable = false)
    private Integer totalBids = 0;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // ==================== Helper Methods ====================
    
    /**
     * Add a new image URL to the auction
     */
    public void addImage(String imageUrl) {
        if (this.imageUrls == null) {
            this.imageUrls = new ArrayList<>();
        }
        this.imageUrls.add(imageUrl);
    }
    
    /**
     * Remove an image URL from the auction
     */
    public void removeImage(String imageUrl) {
        if (this.imageUrls != null) {
            this.imageUrls.remove(imageUrl);
        }
    }
    
    /**
     * Get the primary/first image (for thumbnail display)
     * Falls back to old imageUrl if imageUrls is empty
     */
    public String getPrimaryImage() {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            return imageUrls.get(0);
        }
        // Backward compatibility: return old imageUrl if new list is empty
        return imageUrl;
    }
    
    /**
     * Check if auction has any images
     */
    public boolean hasImages() {
        return (imageUrls != null && !imageUrls.isEmpty()) || imageUrl != null;
    }
    
    /**
     * Get total number of images
     */
    public int getImageCount() {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            return imageUrls.size();
        }
        return imageUrl != null ? 1 : 0;
    }
    
    /**
     * Migrate old single imageUrl to new imageUrls list
     * Call this in a migration script or service
     */
    public void migrateImageUrl() {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            if (imageUrls == null) {
                imageUrls = new ArrayList<>();
            }
            if (!imageUrls.contains(imageUrl)) {
                imageUrls.add(imageUrl);
            }
        }
    }
    
    // ==================== Enums ====================
    
    public enum AuctionStatus {
        PENDING,    // Not started yet
        ACTIVE,     // Currently running
        ENDED,      // Time expired
        CANCELLED   // Cancelled by seller
    }
}