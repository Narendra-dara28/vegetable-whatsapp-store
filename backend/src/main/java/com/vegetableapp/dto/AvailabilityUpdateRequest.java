package com.vegetableapp.dto;

import jakarta.validation.constraints.NotNull;

public class AvailabilityUpdateRequest {

    @NotNull(message = "Available flag is required")
    private Boolean available;

    public AvailabilityUpdateRequest() {
    }

    public AvailabilityUpdateRequest(Boolean available) {
        this.available = available;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }
}
