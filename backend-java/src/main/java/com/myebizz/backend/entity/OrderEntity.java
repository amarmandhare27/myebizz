package com.myebizz.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "orders")
public class OrderEntity {

    @Id
    private String id;

    private String storeId;
    private String storeSlug;
    private String customer;
    private Double amount;
    private String status;
    private Integer items;
    private String date;
    private String createdAt;
    private String updatedAt;
    private String trackingNumber;
    private String paymentMethod;

    @Column(columnDefinition = "TEXT")
    private String shippingAddressJson;
}
