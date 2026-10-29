package com.vegetableapp.dto;

import jakarta.validation.constraints.Size;

public class SettingRequest {

    @Size(max = 1000, message = "Setting value cannot exceed 1000 characters")
    private String value;

    public SettingRequest() {
    }

    public SettingRequest(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
