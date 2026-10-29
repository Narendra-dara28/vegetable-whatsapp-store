package com.vegetableapp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BulkPriceUpdateRequest {

    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    private List<ProductPriceItem> items;

    public BulkPriceUpdateRequest() {
    }

    public BulkPriceUpdateRequest(List<ProductPriceItem> items) {
        this.items = items;
    }

    public List<ProductPriceItem> getItems() {
        return items;
    }

    public void setItems(List<ProductPriceItem> items) {
        this.items = items;
    }
}
