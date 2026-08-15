package com.myebizz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;

public class PaymentRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateStripePaymentIntentRequest {
        @NotNull(message = "Amount is required")
        @DecimalMin("0.01")
        private java.math.BigDecimal amount;

        @NotBlank(message = "Currency is required")
        private String currency; // "INR", "USD", etc.

        private java.util.Map<String, String> metadata;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRazorpayOrderRequest {
        @NotNull(message = "Amount is required")
        @DecimalMin("0.01")
        private java.math.BigDecimal amount;

        @NotBlank(message = "Currency is required")
        private String currency; // "INR"

        private java.util.Map<String, String> metadata;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerifyStripePaymentRequest {
        @NotBlank(message = "Payment Intent ID is required")
        private String paymentIntentId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerifyRazorpayPaymentRequest {
        @NotBlank(message = "Razorpay Order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay Payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Razorpay Signature is required")
        private String razorpaySignature;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WebhookRequest {
        private String type;
        private String id;
        private java.util.Map<String, Object> data;
    }
}
