package com.myebizz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PaymentResponse {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StripePaymentIntentResponse {
        private String clientSecret;
        private String publishableKey;
        private String paymentIntentId;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RazorpayOrderResponse {
        private String id; // Razorpay Order ID
        private long amount;
        private String currency;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentVerificationResponse {
        private boolean success;
        private String orderId;
        private String paymentStatus; // "paid", "failed", "pending"
        private String paymentId;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentErrorResponse {
        private String error;
        private String message;
        private String code;
    }
}
