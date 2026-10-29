package com.vegetableapp.repository;

import com.vegetableapp.entity.Order;
import com.vegetableapp.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.trackingToken = :token")
    java.util.Optional<Order> findByTrackingTokenWithItems(
            @org.springframework.data.repository.query.Param("token") String token);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    java.util.Optional<Order> findByIdWithItems(@org.springframework.data.repository.query.Param("id") Long id);

    long countByStatus(OrderStatus status);
}
