package com.myebizz.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "stores")
public class StoreEntity {

    @Id
    private String id;

    @Column(unique = true, nullable = false)
    private String slug;

    private String name;
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String logoUrl;
    private String bannerUrl;
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String ownerId;
    private String ownerName;
    private String ownerAvatar;
    private String instagramHandle;
    private String twitterHandle;
    private String facebookHandle;
    private String youtubeHandle;
    private String status;
    private String plan;
    private String currency;
    private String country;
    private Integer orders;
    private String createdAt;
    private String updatedAt;
}
