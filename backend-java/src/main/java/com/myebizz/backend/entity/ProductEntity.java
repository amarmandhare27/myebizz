package com.myebizz.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "products")
public class ProductEntity {

    @Id
    private String id;

    private String storeId;
    private String storeSlug;

    @Column(nullable = false)
    private String name;

    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String shortDescription;
    private Double price;
    private Double discountPrice;
    private Integer discountPercent;

    @Column(columnDefinition = "TEXT")
    private String imagesJson;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String tagsJson;

    @Column(columnDefinition = "TEXT")
    private String variantsJson;

    private Integer stockCount;
    private String sku;
    private Boolean isFeatured;
    private Boolean isPublished;
    private Double rating;
    private Integer reviewCount;
    private Integer soldCount;
    private String createdAt;
    private String updatedAt;
}
