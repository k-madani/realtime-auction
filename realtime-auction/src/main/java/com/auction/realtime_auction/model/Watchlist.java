package com.auction.realtime_auction.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "watchlist", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "auction_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Watchlist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime addedAt;
}