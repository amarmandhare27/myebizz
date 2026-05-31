package com.myebizz.backend.repository;

import com.myebizz.backend.entity.CouponEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<CouponEntity, String> {
    List<CouponEntity> findByStoreId(String storeId);
    void deleteByStoreId(String storeId);
}
