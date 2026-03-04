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
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    /**
     * Create Stripe Checkout Session
     * StripeException propagates → GlobalExceptionHandler → 500
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<CheckoutSessionResponse> createCheckoutSession(
            @Valid @RequestBody CreateCheckoutSessionRequest request,
            Authentication authentication) throws StripeException {

        CheckoutSessionResponse response = paymentService.createCheckoutSession(
                request.getAuctionId(),
                authentication.getName()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Stripe Webhook — signature verified, then delegates to service
     * SignatureVerificationException → 400 via BadRequestException
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new com.auction.realtime_auction.exception.BadRequestException(
                    "Invalid Stripe webhook signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow(() -> new com.auction.realtime_auction.exception.BadRequestException(
                            "Failed to deserialize Stripe event payload"));

            paymentService.handlePaymentSuccess(session.getId(), session.getPaymentIntent());
        }

        return ResponseEntity.ok("Webhook received");
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<PaymentResponse> getPaymentBySessionId(@PathVariable String sessionId) {
        return ResponseEntity.ok(paymentService.getPaymentBySessionId(sessionId));
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<PaymentResponse> getPaymentByAuctionId(@PathVariable Long auctionId) {
        return ResponseEntity.ok(paymentService.getPaymentByAuctionId(auctionId));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getMyPayments(authentication.getName()));
    }

    @GetMapping("/payments-received")
    public ResponseEntity<List<PaymentResponse>> getPaymentsReceived(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getPaymentsReceived(authentication.getName()));
    }
}