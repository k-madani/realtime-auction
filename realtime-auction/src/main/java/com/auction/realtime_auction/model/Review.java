package com.auction.realtime_auction.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"auction_id", "reviewer_id", "reviewee_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;  // Person who is rating
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee;  // Person being rated
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewRole revieweeRole;  // Was reviewee a SELLER or BUYER in this transaction?
    
    @Column(nullable = false)
    private Integer rating;  // 1-5 stars
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    public enum ReviewRole {
        SELLER,  // Reviewee was the seller
        BUYER    // Reviewee was the buyer/winner
    }
}