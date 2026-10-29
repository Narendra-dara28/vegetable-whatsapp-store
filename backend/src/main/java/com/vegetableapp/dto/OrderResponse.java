package com.vegetableapp.dto;

import com.vegetableapp.entity.Order;
import com.vegetableapp.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public class OrderResponse {

    private Long id;
    private String customerName;
    private String phone;
    private String address;
    private String locationUrl;
    private BigDecimal estimatedTotal;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private String trackingToken;
    private LocalDateTime deliveredAt;

    public OrderResponse() {
    }

    public OrderResponse(Long id, String customerName, String phone, String address, String locationUrl,
                         BigDecimal estimatedTotal, OrderStatus status,
                         LocalDateTime createdAt, List<OrderItemResponse> items,
                         String trackingToken, LocalDateTime deliveredAt) {
        this.id = id;
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.locationUrl = locationUrl;
        this.estimatedTotal = estimatedTotal;
        this.status = status;
        this.createdAt = createdAt;
        this.items = items;
        this.trackingToken = trackingToken;
        this.deliveredAt = deliveredAt;
    }

    public static OrderResponse fromEntity(Order order) {
        if (order == null) return null;

        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(OrderItemResponse::fromEntity).toList()
                : Collections.emptyList();

        return new OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getPhone(),
                order.getAddress(),
                order.getLocationUrl(),
                order.getEstimatedTotal(),
                order.getStatus(),
                order.getCreatedAt(),
                itemResponses,
                order.getTrackingToken(),
                order.getDeliveredAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLocationUrl() {
        return locationUrl;
    }

    public void setLocationUrl(String locationUrl) {
        this.locationUrl = locationUrl;
    }

    public BigDecimal getEstimatedTotal() {
        return estimatedTotal;
    }

    public void setEstimatedTotal(BigDecimal estimatedTotal) {
        this.estimatedTotal = estimatedTotal;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }

    public String getTrackingToken() {
        return trackingToken;
    }

    public void setTrackingToken(String trackingToken) {
        this.trackingToken = trackingToken;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
}
