package com.auction.realtime_auction.repository;

import com.auction.realtime_auction.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByStripeSessionId(String stripeSessionId);
    
    Optional<Payment> findByAuctionId(Long auctionId);
    
    List<Payment> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    
    List<Payment> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    
    boolean existsByAuctionId(Long auctionId);
}