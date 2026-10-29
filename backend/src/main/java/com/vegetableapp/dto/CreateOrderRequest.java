package com.vegetableapp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public class CreateOrderRequest {

    @NotBlank(message = "Customer name is required")
    @Size(max = 150, message = "Customer name cannot exceed 150 characters")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+91)?[6-9][0-9]{9}$", message = "Please enter a valid 10-digit Indian mobile number")
    private String phone;

    @NotBlank(message = "Delivery address is required")
    @Size(max = 500, message = "Delivery address cannot exceed 500 characters")
    private String address;

    @Size(max = 500, message = "Location URL cannot exceed 500 characters")
    private String locationUrl;

    @NotEmpty(message = "Order must contain at least one item")
    @Size(max = 50, message = "Order cannot exceed 50 items")
    @Valid
    private List<OrderItemRequest> items;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(String customerName, String phone, String address, List<OrderItemRequest> items) {
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.items = items;
    }

    public CreateOrderRequest(String customerName, String phone, String address, String locationUrl, List<OrderItemRequest> items) {
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.locationUrl = locationUrl;
        this.items = items;
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

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
