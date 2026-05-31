package com.myebizz.backend.repository;

import com.myebizz.backend.entity.StoreEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<StoreEntity, String> {
    Optional<StoreEntity> findBySlug(String slug);
}
