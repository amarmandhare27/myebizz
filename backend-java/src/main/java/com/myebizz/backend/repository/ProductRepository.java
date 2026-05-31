package com.myebizz.backend.repository;

import com.myebizz.backend.entity.ProductEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<ProductEntity, String> {
    List<ProductEntity> findByStoreSlug(String storeSlug);
    void deleteByStoreSlug(String storeSlug);
}
