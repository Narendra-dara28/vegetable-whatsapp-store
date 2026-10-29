package com.vegetableapp.controller;

import com.vegetableapp.dto.AvailabilityUpdateRequest;
import com.vegetableapp.dto.BulkPriceUpdateRequest;
import com.vegetableapp.dto.ProductRequest;
import com.vegetableapp.dto.ProductResponse;
import com.vegetableapp.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Retrieve all products (available + unavailable) for the admin inventory
     * dashboard.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProductsForAdmin());
    }

    /**
     * Retrieve any product by ID for admin editing.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductByIdForAdmin(id));
    }

    /**
     * Add a new product (e.g. today's new fruit/vegetable).
     */
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = productService.createProduct(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Update product details.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    /**
     * Toggle product availability (e.g. mark sold-out or back in stock).
     */
    @PatchMapping("/{id}/availability")
    public ResponseEntity<ProductResponse> updateAvailability(@PathVariable Long id,
            @Valid @RequestBody AvailabilityUpdateRequest request) {
        return ResponseEntity.ok(productService.updateAvailability(id, request.getAvailable()));
    }

    /**
     * Soft delete product by setting available = false.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.softDeleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Morning routine bulk price update:
     * Vendor can edit prices of multiple products in the UI and save all in a
     * single click.
     */
    @PutMapping("/bulk-price")
    public ResponseEntity<List<ProductResponse>> bulkUpdatePrices(@Valid @RequestBody BulkPriceUpdateRequest request) {
        return ResponseEntity.ok(productService.bulkUpdatePrices(request));
    }
}
