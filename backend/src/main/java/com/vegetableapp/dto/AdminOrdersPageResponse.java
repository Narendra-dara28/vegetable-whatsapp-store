package com.vegetableapp.dto;

import java.util.List;
import java.util.Map;

public class AdminOrdersPageResponse {

    private List<OrderResponse> orders;
    private Map<String, Long> statusCounts;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private java.math.BigDecimal totalAmount;

    public AdminOrdersPageResponse() {
    }

    public AdminOrdersPageResponse(List<OrderResponse> orders, Map<String, Long> statusCounts,
                                   long totalElements, int totalPages, int currentPage) {
        this.orders = orders;
        this.statusCounts = statusCounts;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.totalAmount = java.math.BigDecimal.ZERO;
    }

    public AdminOrdersPageResponse(List<OrderResponse> orders, Map<String, Long> statusCounts,
                                   long totalElements, int totalPages, int currentPage, java.math.BigDecimal totalAmount) {
        this.orders = orders;
        this.statusCounts = statusCounts;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.totalAmount = totalAmount;
    }

    public List<OrderResponse> getOrders() {
        return orders;
    }

    public void setOrders(List<OrderResponse> orders) {
        this.orders = orders;
    }

    public Map<String, Long> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<String, Long> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public java.math.BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(java.math.BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
