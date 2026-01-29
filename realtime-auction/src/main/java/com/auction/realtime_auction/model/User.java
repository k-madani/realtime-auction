package com.auction.realtime_auction.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String role = "USER";
    
    // Overall rating (average of all ratings received)
    @Column(nullable = false)
    private Double overallRating = 0.0;
    
    // Rating as seller
    @Column(nullable = false)
    private Double sellerRating = 0.0;
    
    // Rating as buyer
    @Column(nullable = false)
    private Double buyerRating = 0.0;
    
    // Total reviews received
    @Column(nullable = false)
    private Integer totalReviews = 0;
    
    // Reviews received as seller
    @Column(nullable = false)
    private Integer sellerReviews = 0;
    
    // Reviews received as buyer
    @Column(nullable = false)
    private Integer buyerReviews = 0;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}