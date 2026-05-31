package com.myebizz.backend.repository;

import com.myebizz.backend.entity.OrderEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<OrderEntity, String> {
    List<OrderEntity> findByStoreSlug(String storeSlug);
    void deleteByStoreSlug(String storeSlug);
}
