package com.myebizz.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "coupons")
public class CouponEntity {

    @Id
    private String id;

    private String storeId;
    private String code;
    private String discountType;
    private Double discountValue;
    private Double minOrderAmount;
    private Integer maxUses;
    private Integer usedCount;
    private Boolean isActive;
    private String expiresAt;
    private String createdAt;
}
