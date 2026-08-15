package com.myebizz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.myebizz.backend.entity.PaymentEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private String orderId;
    private Long storeId;
    private String paymentProvider;
    private String providerTransactionId;
    private String providerOrderId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String metadata;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    public static PaymentDTO fromEntity(PaymentEntity entity) {
        return PaymentDTO.builder()
                .id(entity.getId())
                .orderId(entity.getOrderId())
                .storeId(entity.getStoreId())
                .paymentProvider(entity.getPaymentProvider())
                .providerTransactionId(entity.getProviderTransactionId())
                .providerOrderId(entity.getProviderOrderId())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .status(entity.getStatus().name())
                .metadata(entity.getMetadata())
                .errorMessage(entity.getErrorMessage())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .completedAt(entity.getCompletedAt())
                .build();
    }
}
