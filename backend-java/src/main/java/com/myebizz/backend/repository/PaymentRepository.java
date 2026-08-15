package com.myebizz.backend.repository;

import com.myebizz.backend.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    Optional<PaymentEntity> findByProviderTransactionId(String providerTransactionId);

    Optional<PaymentEntity> findByOrderId(String orderId);

    Optional<PaymentEntity> findByProviderOrderId(String providerOrderId);

    @Query("SELECT p FROM PaymentEntity p WHERE p.storeId = :storeId ORDER BY p.createdAt DESC")
    List<PaymentEntity> findByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT p FROM PaymentEntity p WHERE p.orderId = :orderId AND p.status = 'SUCCESSFUL'")
    Optional<PaymentEntity> findSuccessfulPaymentByOrderId(@Param("orderId") String orderId);

    @Query("SELECT COUNT(p) FROM PaymentEntity p WHERE p.storeId = :storeId AND p.status = 'SUCCESSFUL'")
    long countSuccessfulPaymentsByStore(@Param("storeId") Long storeId);
}
