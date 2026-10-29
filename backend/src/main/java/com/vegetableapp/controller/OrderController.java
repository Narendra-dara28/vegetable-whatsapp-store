package com.vegetableapp.controller;

import com.vegetableapp.dto.CreateOrderRequest;
import com.vegetableapp.dto.OrderResponse;
import com.vegetableapp.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vegetableapp.entity.OrderStatus;
import org.springframework.web.bind.annotation.PatchMapping;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Customer order submission endpoint.
     * Validates input, calculates total strictly on the server from current DB
     * prices,
     * saves the order, and returns the saved order with calculated total and order
     * ID.
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse createdOrder = orderService.createOrder(request);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    /**
     * Public order status and items tracking endpoint via random secure token.
     */
    @GetMapping("/track/{token}")
    public ResponseEntity<OrderResponse> getOrderByTrackingToken(@PathVariable String token) {
        OrderResponse order = orderService.getOrderByTrackingToken(token);
        return ResponseEntity.ok(order);
    }

    /**
     * Customer order cancellation endpoint (e.g. before sending on WhatsApp or from order modal)
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        OrderResponse order = orderService.updateOrderStatus(id, OrderStatus.CANCELLED);
        return ResponseEntity.ok(order);
    }
}
