package com.vegetableapp.controller;

import com.vegetableapp.dto.ProductResponse;
import com.vegetableapp.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class PublicProductController {

    private final ProductService productService;

    public PublicProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Public catalog endpoint for customer view.
     * Returns only available products sorted by sortOrder and name.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAvailableProducts() {
        return ResponseEntity.ok(productService.getAvailableProducts());
    }

    /**
     * Public endpoint to view a single available product.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getAvailableProductById(id));
    }
}
