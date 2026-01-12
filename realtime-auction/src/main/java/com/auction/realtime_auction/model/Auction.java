package com.auction.realtime_auction.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;
    
    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL)
    private List<Bid> bids;
    
    private String imageUrl;
    
    @Column(nullable = false)
    private Integer totalBids = 0;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum AuctionStatus {
        PENDING,    // Not started yet
        ACTIVE,     // Currently running
        ENDED,      // Time expired
        CANCELLED   // Cancelled by seller
    }
}