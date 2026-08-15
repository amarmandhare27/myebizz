package com.myebizz.backend.controller;

import com.myebizz.backend.dto.*;
import com.myebizz.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/stores")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // ======================== STRIPE ENDPOINTS ========================

    /**
     * Create Stripe Payment Intent
     * POST /api/stores/{storeSlug}/payments/stripe/intent
     */
    @PostMapping("/{storeSlug}/payments/stripe/intent")
    public ResponseEntity<ApiResponse<PaymentResponse.StripePaymentIntentResponse>> createStripePaymentIntent(
            @PathVariable String storeSlug,
            @Valid @RequestBody PaymentRequest.CreateStripePaymentIntentRequest request) {

        try {
            log.info("Creating Stripe payment intent for store: {}, amount: {}", storeSlug, request.getAmount());

            // In a real scenario, you would fetch storeId from storeSlug
            Long storeId = 1L; // Replace with actual store lookup

            // Generate order ID (in real app, this would be from the cart/order)
            String orderId = "order_" + System.currentTimeMillis();

            PaymentResponse.StripePaymentIntentResponse response = paymentService.createStripePaymentIntent(
                    orderId,
                    storeId,
                    request.getAmount(),
                    request.getCurrency(),
                    request.getMetadata()
            );

            return ResponseEntity.ok(ApiResponse.success(response, "Payment intent created successfully"));

        } catch (Exception e) {
            log.error("Error creating Stripe payment intent: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create payment intent: " + e.getMessage()));
        }
    }

    /**
     * Verify Stripe Payment
     * POST /api/stores/{storeSlug}/payments/stripe/verify
     */
    @PostMapping("/{storeSlug}/payments/stripe/verify")
    public ResponseEntity<ApiResponse<PaymentResponse.PaymentVerificationResponse>> verifyStripePayment(
            @PathVariable String storeSlug,
            @Valid @RequestBody PaymentRequest.VerifyStripePaymentRequest request) {

        try {
            log.info("Verifying Stripe payment for store: {}, paymentIntentId: {}", storeSlug, request.getPaymentIntentId());

            Long storeId = 1L; // Replace with actual store lookup

            PaymentResponse.PaymentVerificationResponse response = paymentService.verifyStripePayment(
                    storeId.toString(),
                    request.getPaymentIntentId()
            );

            return ResponseEntity.ok(ApiResponse.success(response,
                    response.isSuccess() ? "Payment verified successfully" : "Payment verification failed"));

        } catch (Exception e) {
            log.error("Error verifying Stripe payment: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to verify payment: " + e.getMessage()));
        }
    }

    /**
     * Stripe Webhook
     * POST /api/stores/{storeSlug}/payments/stripe/webhook
     */
    @PostMapping("/{storeSlug}/payments/stripe/webhook")
    public ResponseEntity<String> stripeWebhook(
            @PathVariable String storeSlug,
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        try {
            log.info("Processing Stripe webhook for store: {}", storeSlug);

            paymentService.processStripeWebhook(payload, signature);

            return ResponseEntity.ok("Webhook processed");

        } catch (Exception e) {
            log.error("Error processing Stripe webhook: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Webhook processing failed: " + e.getMessage());
        }
    }

    // ======================== RAZORPAY ENDPOINTS ========================

    /**
     * Create Razorpay Order
     * POST /api/stores/{storeSlug}/payments/razorpay/order
     */
    @PostMapping("/{storeSlug}/payments/razorpay/order")
    public ResponseEntity<ApiResponse<PaymentResponse.RazorpayOrderResponse>> createRazorpayOrder(
            @PathVariable String storeSlug,
            @Valid @RequestBody PaymentRequest.CreateRazorpayOrderRequest request) {

        try {
            log.info("Creating Razorpay order for store: {}, amount: {}", storeSlug, request.getAmount());

            // In a real scenario, you would fetch storeId from storeSlug
            Long storeId = 1L; // Replace with actual store lookup

            // Generate order ID (in real app, this would be from the cart/order)
            String orderId = "order_" + System.currentTimeMillis();

            PaymentResponse.RazorpayOrderResponse response = paymentService.createRazorpayOrder(
                    orderId,
                    storeId,
                    request.getAmount(),
                    request.getCurrency(),
                    request.getMetadata()
            );

            return ResponseEntity.ok(ApiResponse.success(response, "Razorpay order created successfully"));

        } catch (Exception e) {
            log.error("Error creating Razorpay order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create Razorpay order: " + e.getMessage()));
        }
    }

    /**
     * Verify Razorpay Payment
     * POST /api/stores/{storeSlug}/payments/razorpay/verify
     */
    @PostMapping("/{storeSlug}/payments/razorpay/verify")
    public ResponseEntity<ApiResponse<PaymentResponse.PaymentVerificationResponse>> verifyRazorpayPayment(
            @PathVariable String storeSlug,
            @Valid @RequestBody PaymentRequest.VerifyRazorpayPaymentRequest request) {

        try {
            log.info("Verifying Razorpay payment for store: {}, orderId: {}", storeSlug, request.getRazorpayOrderId());

            Long storeId = 1L; // Replace with actual store lookup

            PaymentResponse.PaymentVerificationResponse response = paymentService.verifyRazorpayPayment(
                    storeId.toString(),
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );

            return ResponseEntity.ok(ApiResponse.success(response,
                    response.isSuccess() ? "Payment verified successfully" : "Payment verification failed"));

        } catch (Exception e) {
            log.error("Error verifying Razorpay payment: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to verify payment: " + e.getMessage()));
        }
    }

    /**
     * Razorpay Webhook
     * POST /api/stores/{storeSlug}/payments/razorpay/webhook
     */
    @PostMapping("/{storeSlug}/payments/razorpay/webhook")
    public ResponseEntity<String> razorpayWebhook(
            @PathVariable String storeSlug,
            @RequestBody String payload) {

        try {
            log.info("Processing Razorpay webhook for store: {}", storeSlug);

            // Parse and process webhook
            // In a real scenario, verify webhook signature from Razorpay

            return ResponseEntity.ok("Webhook processed");

        } catch (Exception e) {
            log.error("Error processing Razorpay webhook: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Webhook processing failed: " + e.getMessage());
        }
    }

    // ======================== REFUND ENDPOINTS ========================

    /**
     * Refund Payment
     * POST /api/payments/{paymentId}/refund
     */
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<ApiResponse<String>> refundPayment(
            @PathVariable String paymentId,
            @RequestParam(required = false) String reason) {

        try {
            log.info("Processing refund for payment: {}", paymentId);

            boolean refunded = paymentService.refundPayment(paymentId, reason != null ? reason : "Refund requested");

            if (refunded) {
                return ResponseEntity.ok(ApiResponse.success("Payment refunded successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Failed to refund payment"));
            }

        } catch (Exception e) {
            log.error("Error refunding payment: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Refund processing failed: " + e.getMessage()));
        }
    }
}
