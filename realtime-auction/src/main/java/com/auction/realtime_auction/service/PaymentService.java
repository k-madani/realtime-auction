package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.CheckoutSessionResponse;
import com.auction.realtime_auction.dto.PaymentResponse;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.ResourceNotFoundException;
import com.auction.realtime_auction.exception.UnauthorizedException;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.Payment;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.PaymentRepository;
import com.auction.realtime_auction.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    
    @Value("${stripe.success.url}")
    private String successUrl;
    
    @Value("${stripe.cancel.url}")
    private String cancelUrl;
    
    /**
     * Create Stripe Checkout Session
     */
    @Transactional
    public CheckoutSessionResponse createCheckoutSession(Long auctionId, String username) throws StripeException {
        User buyer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + auctionId));
        
        // Validate auction status
        if (auction.getStatus() != Auction.AuctionStatus.ENDED) {
            throw new BadRequestException("Cannot pay for an auction that hasn't ended");
        }
        
        // Validate winner
        if (auction.getWinner() == null || !auction.getWinner().getId().equals(buyer.getId())) {
            throw new UnauthorizedException("Only the auction winner can make payment");
        }
        
        // Check if payment already exists
        if (paymentRepository.existsByAuctionId(auctionId)) {
            throw new BadRequestException("Payment already exists for this auction");
        }
        
        // Create payment record
        Payment payment = new Payment();
        payment.setAuction(auction);
        payment.setBuyer(buyer);
        payment.setSeller(auction.getSeller());
        payment.setAmount(auction.getCurrentPrice());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        payment = paymentRepository.save(payment);
        
        // Create Stripe Checkout Session
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount((long) (auction.getCurrentPrice().doubleValue() * 100)) // Convert to cents
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(auction.getTitle())
                                                                .setDescription("Payment for auction: " + auction.getTitle())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("auctionId", auctionId.toString())
                .putMetadata("buyerId", buyer.getId().toString())
                .putMetadata("paymentId", payment.getId().toString())
                .build();
        
        Session session = Session.create(params);
        
        // Update payment with session ID
        payment.setStripeSessionId(session.getId());
        paymentRepository.save(payment);
        
        return new CheckoutSessionResponse(
                session.getId(),
                session.getUrl(),
                payment.getId()
        );
    }
    
    /**
     * Handle successful payment (called by webhook)
     */
    @Transactional
    public void handlePaymentSuccess(String sessionId, String paymentIntentId) {
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for session: " + sessionId));
        
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setStripePaymentIntentId(paymentIntentId);
        payment.setPaidAt(LocalDateTime.now());
        
        paymentRepository.save(payment);
        
        // TODO: Send email notification to buyer and seller
        System.out.println("✅ Payment completed for auction: " + payment.getAuction().getTitle());
    }
    
    /**
     * Get payment by session ID
     */
    public PaymentResponse getPaymentBySessionId(String sessionId) {
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for session: " + sessionId));
        
        return mapToResponse(payment);
    }
    
    /**
     * Get payment by auction ID
     */
    public PaymentResponse getPaymentByAuctionId(Long auctionId) {
        Payment payment = paymentRepository.findByAuctionId(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for auction: " + auctionId));
        
        return mapToResponse(payment);
    }
    
    /**
     * Get user's payments (as buyer)
     */
    public List<PaymentResponse> getMyPayments(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        return paymentRepository.findByBuyerIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get payments received (as seller)
     */
    public List<PaymentResponse> getPaymentsReceived(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        return paymentRepository.findBySellerIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private PaymentResponse mapToResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getAuction().getId(),
                payment.getAuction().getTitle(),
                payment.getBuyer().getId(),
                payment.getBuyer().getUsername(),
                payment.getSeller().getId(),
                payment.getSeller().getUsername(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getPaidAt(),
                payment.getCreatedAt()
        );
    }
}