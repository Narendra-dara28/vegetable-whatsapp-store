package com.vegetableapp.service;

import com.vegetableapp.dto.AdminOrdersPageResponse;
import com.vegetableapp.dto.CreateOrderRequest;
import com.vegetableapp.dto.OrderItemRequest;
import com.vegetableapp.dto.OrderResponse;
import com.vegetableapp.entity.Order;
import com.vegetableapp.entity.OrderItem;
import com.vegetableapp.entity.OrderStatus;
import com.vegetableapp.entity.Product;
import com.vegetableapp.exception.BadRequestException;
import com.vegetableapp.exception.ResourceNotFoundException;
import com.vegetableapp.repository.OrderRepository;
import com.vegetableapp.repository.ProductRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    /**
     * Customer order placement.
     * Looks up each product in the database, validates availability, and computes
     * the estimated total
     * entirely on the server. Never trusts prices or totals sent by the client.
     */
    public OrderResponse createOrder(CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }

        Order order = new Order();
        order.setCustomerName(request.getCustomerName().trim());
        order.setPhone(request.getPhone().trim());
        order.setAddress(request.getAddress().trim());
        if (request.getLocationUrl() != null && !request.getLocationUrl().isBlank()) {
            order.setLocationUrl(request.getLocationUrl().trim());
        }
        order.setStatus(OrderStatus.NEW);

        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException(
                        "Quantity for product ID " + itemReq.getProductId() + " must be greater than zero");
            }
            if (itemReq.getQuantity() > 100) {
                throw new BadRequestException(
                        "Quantity for product ID " + itemReq.getProductId() + " cannot exceed 100");
            }

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new BadRequestException("Product not found with ID: " + itemReq.getProductId()));

            if (!product.isAvailable()) {
                throw new BadRequestException(
                        "Item '" + product.getName() + "' is currently sold out. Please update your cart.");
            }

            BigDecimal currentPrice = product.getPrice();
            OrderItem orderItem = new OrderItem(product, itemReq.getQuantity(), currentPrice);
            order.addItem(orderItem);

            calculatedTotal = calculatedTotal.add(orderItem.getSubtotal());
        }

        order.setEstimatedTotal(calculatedTotal);
        Order savedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(savedOrder);
    }

    /**
     * Advanced Admin Orders query with status counts, search, date range, and
     * pagination.
     */
    public AdminOrdersPageResponse getOrdersForAdmin(String status, String search,
            LocalDate fromDate, LocalDate toDate,
            Integer page, Integer size) {
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        if (search != null && !search.trim().isBlank()) {
            long countNew = orderRepository.count(buildAdminOrdersSpec("NEW", search, fromDate, toDate));
            long countConfirmed = orderRepository.count(buildAdminOrdersSpec("CONFIRMED", search, fromDate, toDate));
            long countOutForDelivery = orderRepository
                    .count(buildAdminOrdersSpec("OUT_FOR_DELIVERY", search, fromDate, toDate));
            long countCancelled = orderRepository.count(buildAdminOrdersSpec("CANCELLED", search, fromDate, toDate));
            long countCompleted = orderRepository.count(buildAdminOrdersSpec("DELIVERED", search, fromDate, toDate));
            long countAll = countNew + countConfirmed + countOutForDelivery + countCancelled + countCompleted;

            statusCounts.put("ALL", countAll);
            statusCounts.put("NEW", countNew);
            statusCounts.put("CONFIRMED", countConfirmed);
            statusCounts.put("OUT_FOR_DELIVERY", countOutForDelivery);
            statusCounts.put("CANCELLED", countCancelled);
            statusCounts.put("COMPLETED", countCompleted);
        } else {
            long countNew = orderRepository.countByStatus(OrderStatus.NEW);
            long countConfirmed = orderRepository.countByStatus(OrderStatus.CONFIRMED);
            long countOutForDelivery = orderRepository.countByStatus(OrderStatus.OUT_FOR_DELIVERY);
            long countCancelled = orderRepository.countByStatus(OrderStatus.CANCELLED);
            long countCompleted = orderRepository.countByStatus(OrderStatus.DELIVERED);
            long countAll = countNew + countConfirmed + countOutForDelivery + countCancelled + countCompleted;

            statusCounts.put("ALL", countAll);
            statusCounts.put("NEW", countNew);
            statusCounts.put("CONFIRMED", countConfirmed);
            statusCounts.put("OUT_FOR_DELIVERY", countOutForDelivery);
            statusCounts.put("CANCELLED", countCancelled);
            statusCounts.put("COMPLETED", countCompleted);
        }

        Specification<Order> spec = buildAdminOrdersSpec(status, search, fromDate, toDate);

        Sort sort;
        if ("COMPLETED".equalsIgnoreCase(status) || "DELIVERED".equalsIgnoreCase(status)) {
            sort = Sort.by(Sort.Direction.DESC, "deliveredAt", "createdAt");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        int pageSize = (size != null && size > 0) ? size : 20;
        int pageNum = (page != null && page >= 0) ? page : 0;
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);
        List<OrderResponse> responseList = orderPage.getContent().stream()
                .map(OrderResponse::fromEntity)
                .toList();

        BigDecimal totalAmount = BigDecimal.ZERO;
        try {
            List<Order> allMatched = orderRepository.findAll(spec);
            totalAmount = allMatched.stream()
                    .map(Order::getEstimatedTotal)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (Exception ignored) {
        }

        return new AdminOrdersPageResponse(
                responseList,
                statusCounts,
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                pageNum,
                totalAmount);
    }

    private Specification<Order> buildAdminOrdersSpec(String status, String search, LocalDate fromDate,
            LocalDate toDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Status Filter
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                if (status.equalsIgnoreCase("COMPLETED") || status.equalsIgnoreCase("DELIVERED")) {
                    predicates.add(cb.equal(root.get("status"), OrderStatus.DELIVERED));
                } else {
                    try {
                        OrderStatus os = OrderStatus.valueOf(status.toUpperCase().trim());
                        predicates.add(cb.equal(root.get("status"), os));
                    } catch (Exception ignored) {
                    }
                }
            }

            // 2. Comprehensive Multi-Field Search Filter
            if (search != null && !search.trim().isBlank()) {
                String cleanSearch = search.trim();
                String numericCandidate = cleanSearch.replaceAll("(?i)^order\\s*#?", "").replace("#", "").trim();
                String term = "%" + cleanSearch.toLowerCase() + "%";
                Predicate namePredicate = cb.like(cb.lower(root.get("customerName")), term);
                Predicate phonePredicate = cb.like(root.get("phone"), term);
                Predicate addressPredicate = cb.like(cb.lower(root.get("address")), term);

                List<Predicate> orList = new ArrayList<>();
                orList.add(namePredicate);
                orList.add(phonePredicate);
                orList.add(addressPredicate);

                // Phone with clean digits (e.g. +91 7569479098 or 7569)
                String digitsOnly = cleanSearch.replaceAll("[^0-9]", "");
                if (!digitsOnly.isEmpty()) {
                    orList.add(cb.like(root.get("phone"), "%" + digitsOnly + "%"));
                }

                // Match Status (e.g. "cancelled", "delivered", "new", "out for delivery",
                // "confirmed", etc.)
                String sLower = cleanSearch.toLowerCase().replace("_", " ").trim();
                List<OrderStatus> matchedStatuses = new ArrayList<>();

                if (sLower.equals("all")) {
                    orList.add(cb.conjunction());
                } else {
                    // Check OUT_FOR_DELIVERY specifically to avoid "delivery" overlapping with
                    // "delivered"
                    if (sLower.contains("out for") || sLower.equals("out for delivery") || sLower.equals("out")
                            || sLower.equals("out_for_delivery")) {
                        matchedStatuses.add(OrderStatus.OUT_FOR_DELIVERY);
                    }
                    if (sLower.startsWith("con") || sLower.contains("confirm")) {
                        matchedStatuses.add(OrderStatus.CONFIRMED);
                    }
                    if ((sLower.startsWith("del") || sLower.contains("deliver") || sLower.equals("completed"))
                            && !sLower.contains("out")) {
                        matchedStatuses.add(OrderStatus.DELIVERED);
                    }
                    if (sLower.startsWith("can") || sLower.contains("cancel")) {
                        matchedStatuses.add(OrderStatus.CANCELLED);
                    }
                    if (sLower.equals("new") || sLower.startsWith("new")) {
                        matchedStatuses.add(OrderStatus.NEW);
                    }

                    for (OrderStatus os : matchedStatuses) {
                        orList.add(cb.equal(root.get("status"), os));
                    }
                }

                // Match Total amount if numeric
                try {
                    BigDecimal totalAmt = new BigDecimal(cleanSearch);
                    orList.add(cb.equal(root.get("estimatedTotal"), totalAmt));
                } catch (Exception ignored) {
                }

                // Match Order ID (325, #325, order 325)
                try {
                    Long searchId = Long.parseLong(numericCandidate);
                    orList.add(cb.equal(root.get("id"), searchId));
                } catch (NumberFormatException ignored) {
                }

                // Match Item names (product name or Telugu nameLocal) via EXISTS subquery to
                // prevent multiplying row counts
                if (query != null) {
                    Subquery<Integer> itemSub = query.subquery(Integer.class);
                    Root<OrderItem> itemRoot = itemSub.from(OrderItem.class);
                    Join<OrderItem, Product> productJoin = itemRoot.join("product", JoinType.LEFT);
                    Predicate itemNameMatch = cb.or(
                            cb.like(cb.lower(itemRoot.get("productName")), term),
                            cb.like(cb.lower(productJoin.get("nameLocal")), term));
                    itemSub.select(cb.literal(1))
                            .where(
                                    cb.equal(itemRoot.get("order"), root),
                                    itemNameMatch);
                    orList.add(cb.exists(itemSub));
                }

                predicates.add(cb.or(orList.toArray(new Predicate[0])));
            }

            // 3. Date Range Filter
            if (fromDate != null) {
                LocalDateTime start = fromDate.atStartOfDay();
                predicates.add(cb.or(
                        cb.greaterThanOrEqualTo(root.get("deliveredAt"), start),
                        cb.and(cb.isNull(root.get("deliveredAt")),
                                cb.greaterThanOrEqualTo(root.get("createdAt"), start))));
            }
            if (toDate != null) {
                LocalDateTime end = toDate.atTime(LocalTime.MAX);
                predicates.add(cb.or(
                        cb.lessThanOrEqualTo(root.get("deliveredAt"), end),
                        cb.and(cb.isNull(root.get("deliveredAt")), cb.lessThanOrEqualTo(root.get("createdAt"), end))));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Update order progress status (NEW, CONFIRMED, OUT_FOR_DELIVERY, DELIVERED,
     * CANCELLED).
     */
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED && order.getDeliveredAt() == null) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        if (order.getTrackingToken() == null || order.getTrackingToken().isBlank()) {
            order.setTrackingToken(java.util.UUID.randomUUID().toString());
        }
        Order updated = orderRepository.save(order);
        return OrderResponse.fromEntity(updated);
    }

    /**
     * Public order tracking by unique token or order ID.
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByTrackingToken(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Tracking token or order ID cannot be empty");
        }
        String clean = token.trim();
        if (clean.contains("/order/")) {
            clean = clean.substring(clean.lastIndexOf("/order/") + 7).trim();
        }
        if (clean.startsWith("#")) {
            clean = clean.substring(1).trim();
        }

        // 1. Try finding by tracking token
        Optional<Order> orderOpt = orderRepository.findByTrackingTokenWithItems(clean);

        // 2. If not found and input is numeric, try finding by order ID
        if (orderOpt.isEmpty() && clean.matches("\\d+")) {
            try {
                Long orderId = Long.parseLong(clean);
                orderOpt = orderRepository.findByIdWithItems(orderId);
            } catch (NumberFormatException ignored) {
            }
        }

        Order order = orderOpt.orElseThrow(() -> new ResourceNotFoundException("Order not found with: " + token));
        return OrderResponse.fromEntity(order);
    }
}
