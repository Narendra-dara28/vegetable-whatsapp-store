package com.vegetableapp.service;

import com.vegetableapp.dto.BulkPriceUpdateRequest;
import com.vegetableapp.dto.ProductPriceItem;
import com.vegetableapp.dto.ProductRequest;
import com.vegetableapp.dto.ProductResponse;
import com.vegetableapp.entity.Product;
import com.vegetableapp.exception.ResourceNotFoundException;
import com.vegetableapp.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ==========================================
    // Public Catalog Methods
    // ==========================================

    @Transactional(readOnly = true)
    public List<ProductResponse> getAvailableProducts() {
        return productRepository.findAllByAvailableTrueOrderBySortOrderAscNameAsc()
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getAvailableProductById(Long id) {
        Product product = productRepository.findByIdAndAvailableTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Available product not found with ID: " + id));
        return ProductResponse.fromEntity(product);
    }

    // ==========================================
    // Admin Operations
    // ==========================================

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProductsForAdmin() {
        return productRepository.findAllByOrderBySortOrderAscNameAsc()
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductByIdForAdmin(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return ProductResponse.fromEntity(product);
    }

    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product(
                request.getName().trim(),
                request.getNameLocal() != null ? request.getNameLocal().trim() : null,
                request.getCategory().trim(),
                request.getPrice(),
                request.getUnit().trim(),
                request.getImageUrl() != null ? request.getImageUrl().trim() : null,
                request.getAvailable() != null ? request.getAvailable() : true,
                request.getSortOrder() != null ? request.getSortOrder() : 0);

        Product saved = productRepository.save(product);
        return ProductResponse.fromEntity(saved);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        product.setName(request.getName().trim());
        product.setNameLocal(request.getNameLocal() != null ? request.getNameLocal().trim() : null);
        product.setCategory(request.getCategory().trim());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit().trim());
        product.setImageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null);
        if (request.getAvailable() != null) {
            product.setAvailable(request.getAvailable());
        }
        if (request.getSortOrder() != null) {
            product.setSortOrder(request.getSortOrder());
        }

        Product updated = productRepository.save(product);
        return ProductResponse.fromEntity(updated);
    }

    public ProductResponse updateAvailability(Long id, boolean available) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        product.setAvailable(available);
        Product updated = productRepository.save(product);
        return ProductResponse.fromEntity(updated);
    }

    public void softDeleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Soft delete by marking unavailable
        product.setAvailable(false);
        productRepository.save(product);
    }

    /**
     * Bulk updates multiple product prices in a single atomic transaction.
     * Essential for the owner's morning workflow.
     */
    public List<ProductResponse> bulkUpdatePrices(BulkPriceUpdateRequest request) {
        List<ProductResponse> updatedList = new ArrayList<>();

        for (ProductPriceItem item : request.getItems()) {
            Product product = productRepository.findById(item.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + item.getId()));

            product.setPrice(item.getPrice());
            Product saved = productRepository.save(product);
            updatedList.add(ProductResponse.fromEntity(saved));
        }

        return updatedList;
    }
}
