package com.myebizz.backend.service;

import com.google.gson.Gson;
import com.myebizz.backend.dto.*;
import com.myebizz.backend.entity.PaymentEntity;
import com.myebizz.backend.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final Gson gson;

    @Value("${payment.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${payment.stripe.publishable-key}")
    private String stripePublishableKey;

    @Value("${payment.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${payment.razorpay.key-secret}")
    private String razorpayKeySecret;

    public PaymentService(PaymentRepository paymentRepository) throws Exception {
        this.paymentRepository = paymentRepository;
        this.gson = new Gson();
        this.razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }

    // ======================== STRIPE INTEGRATION ========================

    /**
     * Create Stripe Payment Intent
     */
    @Transactional
    public PaymentResponse.StripePaymentIntentResponse createStripePaymentIntent(
            String orderId,
            Long storeId,
            BigDecimal amount,
            String currency,
            Map<String, String> metadata) throws StripeException {

        try {
            Stripe.apiKey = stripeSecretKey;

            Map<String, Object> params = new HashMap<>();
            params.put("amount", amount.multiply(BigDecimal.valueOf(100)).longValue()); // Convert to smallest currency unit
            params.put("currency", currency.toLowerCase());
            params.put("description", "Order: " + orderId);

            if (metadata != null) {
                params.put("metadata", metadata);
            }

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Save payment record
            PaymentEntity payment = PaymentEntity.builder()
                    .orderId(orderId)
                    .storeId(storeId)
                    .paymentProvider("stripe")
                    .providerTransactionId(paymentIntent.getId())
                    .amount(amount)
                    .currency(currency)
                    .status(PaymentEntity.PaymentStatus.PENDING)
                    .metadata(gson.toJson(metadata))
                    .build();

            paymentRepository.save(payment);

            return PaymentResponse.StripePaymentIntentResponse.builder()
                    .clientSecret(paymentIntent.getClientSecret())
                    .publishableKey(stripePublishableKey)
                    .paymentIntentId(paymentIntent.getId())
                    .status(paymentIntent.getStatus())
                    .build();

        } catch (StripeException e) {
            log.error("Error creating Stripe payment intent: ", e);
            throw e;
        }
    }

    /**
     * Verify Stripe Payment
     */
    @Transactional
    public PaymentResponse.PaymentVerificationResponse verifyStripePayment(
            String storeId,
            String paymentIntentId) throws StripeException {

        try {
            Stripe.apiKey = stripeSecretKey;

            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

            // Find existing payment record
            PaymentEntity payment = paymentRepository.findByProviderTransactionId(paymentIntentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            if ("succeeded".equals(paymentIntent.getStatus())) {
                payment.setStatus(PaymentEntity.PaymentStatus.SUCCESSFUL);
                payment.setCompletedAt(LocalDateTime.now());
            } else if ("canceled".equals(paymentIntent.getStatus())) {
                payment.setStatus(PaymentEntity.PaymentStatus.FAILED);
                payment.setErrorMessage("Payment was canceled");
            } else if ("requires_payment_method".equals(paymentIntent.getStatus())) {
                payment.setStatus(PaymentEntity.PaymentStatus.PENDING);
            }

            paymentRepository.save(payment);

            return PaymentResponse.PaymentVerificationResponse.builder()
                    .success("succeeded".equals(paymentIntent.getStatus()))
                    .orderId(payment.getOrderId())
                    .paymentStatus(paymentIntent.getStatus())
                    .paymentId(paymentIntentId)
                    .message("succeeded".equals(paymentIntent.getStatus()) ? "Payment successful" : "Payment not completed")
                    .build();

        } catch (StripeException e) {
            log.error("Error verifying Stripe payment: ", e);
            throw e;
        }
    }

    /**
     * Process Stripe Webhook
     */
    @Transactional
    public void processStripeWebhook(String payload, String signature) throws Exception {
        try {
            // Verify webhook signature (implement based on your webhook secret)
            // For now, we'll process the webhook directly
            
            Gson gson = new Gson();
            Map<String, Object> event = gson.fromJson(payload, Map.class);
            
            String eventType = (String) event.get("type");
            
            if ("payment_intent.succeeded".equals(eventType)) {
                Map<String, Object> data = (Map<String, Object>) event.get("data");
                Map<String, Object> paymentIntent = (Map<String, Object>) data.get("object");
                String paymentIntentId = (String) paymentIntent.get("id");
                
                PaymentEntity payment = paymentRepository.findByProviderTransactionId(paymentIntentId)
                        .orElseThrow(() -> new RuntimeException("Payment not found"));
                
                payment.setStatus(PaymentEntity.PaymentStatus.SUCCESSFUL);
                payment.setCompletedAt(LocalDateTime.now());
                paymentRepository.save(payment);
                
                log.info("Payment {} completed successfully", paymentIntentId);
                
            } else if ("payment_intent.payment_failed".equals(eventType)) {
                Map<String, Object> data = (Map<String, Object>) event.get("data");
                Map<String, Object> paymentIntent = (Map<String, Object>) data.get("object");
                String paymentIntentId = (String) paymentIntent.get("id");
                String errorMessage = (String) ((Map<String, Object>) paymentIntent.get("last_payment_error")).get("message");
                
                PaymentEntity payment = paymentRepository.findByProviderTransactionId(paymentIntentId)
                        .orElseThrow(() -> new RuntimeException("Payment not found"));
                
                payment.setStatus(PaymentEntity.PaymentStatus.FAILED);
                payment.setErrorMessage(errorMessage);
                paymentRepository.save(payment);
                
                log.warn("Payment {} failed: {}", paymentIntentId, errorMessage);
            }
        } catch (Exception e) {
            log.error("Error processing Stripe webhook: ", e);
            throw e;
        }
    }

    // ======================== RAZORPAY INTEGRATION ========================

    /**
     * Create Razorpay Order
     */
    @Transactional
    public PaymentResponse.RazorpayOrderResponse createRazorpayOrder(
            String orderId,
            Long storeId,
            BigDecimal amount,
            String currency,
            Map<String, String> metadata) throws Exception {

        try {
            JSONObject options = new JSONObject();
            options.put("amount", amount.multiply(BigDecimal.valueOf(100)).longValue()); // Convert to paise
            options.put("currency", currency);
            options.put("receipt", orderId);

            if (metadata != null) {
                for (Map.Entry<String, String> entry : metadata.entrySet()) {
                    options.accumulate("notes", new JSONObject().put(entry.getKey(), entry.getValue()));
                }
            }

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(options);

            // Save payment record
            PaymentEntity payment = PaymentEntity.builder()
                    .orderId(orderId)
                    .storeId(storeId)
                    .paymentProvider("razorpay")
                    .providerOrderId(razorpayOrder.get("id"))
                    .amount(amount)
                    .currency(currency)
                    .status(PaymentEntity.PaymentStatus.PENDING)
                    .metadata(gson.toJson(metadata))
                    .build();

            paymentRepository.save(payment);

            Object amountObj = razorpayOrder.get("amount");
            long amountValue = amountObj instanceof Long ? (Long) amountObj : Long.parseLong(amountObj.toString());

            return PaymentResponse.RazorpayOrderResponse.builder()
                    .id(razorpayOrder.get("id").toString())
                    .amount(amountValue)
                    .currency(razorpayOrder.get("currency").toString())
                    .status(razorpayOrder.get("status").toString())
                    .build();

        } catch (Exception e) {
            log.error("Error creating Razorpay order: ", e);
            throw e;
        }
    }

    /**
     * Verify Razorpay Payment
     */
    @Transactional
    public PaymentResponse.PaymentVerificationResponse verifyRazorpayPayment(
            String storeId,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) throws Exception {

        try {
            // Verify signature
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            // Verify signature using Razorpay utility
            boolean isSignatureValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isSignatureValid) {
                log.warn("Invalid Razorpay signature for payment {}", razorpayPaymentId);
                return PaymentResponse.PaymentVerificationResponse.builder()
                        .success(false)
                        .paymentStatus("failed")
                        .paymentId(razorpayPaymentId)
                        .message("Invalid payment signature")
                        .build();
            }

            // Fetch payment details from Razorpay
            com.razorpay.Payment payment = razorpayClient.payments.fetch(razorpayPaymentId);

            // Find and update payment record
            PaymentEntity paymentEntity = paymentRepository.findByProviderOrderId(razorpayOrderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            paymentEntity.setProviderTransactionId(razorpayPaymentId);
            paymentEntity.setSignature(razorpaySignature);

            if ("captured".equals(payment.get("status"))) {
                paymentEntity.setStatus(PaymentEntity.PaymentStatus.SUCCESSFUL);
                paymentEntity.setCompletedAt(LocalDateTime.now());
            } else if ("failed".equals(payment.get("status"))) {
                paymentEntity.setStatus(PaymentEntity.PaymentStatus.FAILED);
                paymentEntity.setErrorMessage((String) payment.get("error_description"));
            } else {
                paymentEntity.setStatus(PaymentEntity.PaymentStatus.PENDING);
            }

            paymentRepository.save(paymentEntity);

            return PaymentResponse.PaymentVerificationResponse.builder()
                    .success("captured".equals(payment.get("status")))
                    .orderId(paymentEntity.getOrderId())
                    .paymentStatus((String) payment.get("status"))
                    .paymentId(razorpayPaymentId)
                    .message("captured".equals(payment.get("status")) ? "Payment successful" : "Payment not captured")
                    .build();

        } catch (Exception e) {
            log.error("Error verifying Razorpay payment: ", e);
            throw e;
        }
    }

    // ======================== UTILITY METHODS ========================

    /**
     * Get payment by order ID
     */
    public PaymentDTO getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .map(PaymentDTO::fromEntity)
                .orElse(null);
    }

    /**
     * Refund payment
     */
    @Transactional
    public boolean refundPayment(String paymentId, String reason) throws Exception {
        PaymentEntity payment = paymentRepository.findByProviderTransactionId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        try {
            if ("stripe".equals(payment.getPaymentProvider())) {
                Stripe.apiKey = stripeSecretKey;
                Map<String, Object> params = new HashMap<>();
                params.put("reason", reason);
                PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentId);
                // Stripe refunds are done on charge level, not payment intent
                // This is a simplified version - implement based on your requirements
            } else if ("razorpay".equals(payment.getPaymentProvider())) {
                // Razorpay refunds through the payments client
                JSONObject refundOptions = new JSONObject();
                refundOptions.put("notes", reason);
                razorpayClient.payments.refund(paymentId, refundOptions);
            }

            payment.setStatus(PaymentEntity.PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
            return true;

        } catch (Exception e) {
            log.error("Error refunding payment {}: ", paymentId, e);
            return false;
        }
    }
}
