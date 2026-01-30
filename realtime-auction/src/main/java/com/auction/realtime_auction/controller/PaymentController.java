package com.auction.realtime_auction.controller;

import com.auction.realtime_auction.dto.CheckoutSessionResponse;
import com.auction.realtime_auction.dto.CreateCheckoutSessionRequest;
import com.auction.realtime_auction.dto.PaymentResponse;
import com.auction.realtime_auction.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @Value("${stripe.webhook.secret}")
    private String webhookSecret;
    
    /**
     * Create Stripe Checkout Session
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<CheckoutSessionResponse> createCheckoutSession(
            @Valid @RequestBody CreateCheckoutSessionRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            CheckoutSessionResponse response = paymentService.createCheckoutSession(
                    request.getAuctionId(),
                    username
            );
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create checkout session: " + e.getMessage());
        }
    }
    
    /**
     * Stripe Webhook Endpoint
     * This receives payment confirmation from Stripe
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        Event event;
        
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }
        
        // Handle the event
        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow(() -> new RuntimeException("Failed to deserialize event"));
            
            paymentService.handlePaymentSuccess(
                    session.getId(),
                    session.getPaymentIntent()
            );
        }
        
        return ResponseEntity.ok("Webhook received");
    }
    
    /**
     * Get payment by session ID (for success page)
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<PaymentResponse> getPaymentBySessionId(@PathVariable String sessionId) {
        PaymentResponse payment = paymentService.getPaymentBySessionId(sessionId);
        return ResponseEntity.ok(payment);
    }
    
    /**
     * Get payment by auction ID
     */
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<PaymentResponse> getPaymentByAuctionId(@PathVariable Long auctionId) {
        PaymentResponse payment = paymentService.getPaymentByAuctionId(auctionId);
        return ResponseEntity.ok(payment);
    }
    
    /**
     * Get my payments (as buyer)
     */
    @GetMapping("/my-payments")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(Authentication authentication) {
        String username = authentication.getName();
        List<PaymentResponse> payments = paymentService.getMyPayments(username);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Get payments received (as seller)
     */
    @GetMapping("/payments-received")
    public ResponseEntity<List<PaymentResponse>> getPaymentsReceived(Authentication authentication) {
        String username = authentication.getName();
        List<PaymentResponse> payments = paymentService.getPaymentsReceived(username);
        return ResponseEntity.ok(payments);
    }
}