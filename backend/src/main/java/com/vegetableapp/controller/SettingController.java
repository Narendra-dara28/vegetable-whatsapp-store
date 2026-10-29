package com.vegetableapp.controller;

import com.vegetableapp.dto.SettingRequest;
import com.vegetableapp.dto.SettingResponse;
import com.vegetableapp.service.SettingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SettingController {

    private final SettingService settingService;

    public SettingController(SettingService settingService) {
        this.settingService = settingService;
    }

    /**
     * Public endpoint to get today's route & timing information for the customer catalog banner.
     */
    @GetMapping("/settings/route")
    public ResponseEntity<SettingResponse> getRouteAndTiming() {
        String routeText = settingService.getRouteAndTiming();
        return ResponseEntity.ok(new SettingResponse(SettingService.KEY_ROUTE_AND_TIMING, routeText));
    }

    /**
     * Admin endpoint to update today's route & delivery timing banner text.
     */
    @PutMapping("/admin/settings/route")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SettingResponse> updateRouteAndTiming(@Valid @RequestBody SettingRequest request) {
        String updated = settingService.updateRouteAndTiming(request.getValue());
        return ResponseEntity.ok(new SettingResponse(SettingService.KEY_ROUTE_AND_TIMING, updated));
    }

    /**
     * Public endpoint to get current vehicle GPS location for customer catalog navigation.
     */
    @GetMapping("/settings/vehicle-location")
    public ResponseEntity<SettingResponse> getVehicleLocation() {
        String locationJson = settingService.getVehicleLocation();
        return ResponseEntity.ok(new SettingResponse(SettingService.KEY_VEHICLE_LOCATION, locationJson));
    }

    /**
     * Admin endpoint to update vehicle GPS location and current spot.
     */
    @PutMapping("/admin/settings/vehicle-location")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SettingResponse> updateVehicleLocation(@RequestBody SettingRequest request) {
        String updated = settingService.updateVehicleLocation(request.getValue());
        return ResponseEntity.ok(new SettingResponse(SettingService.KEY_VEHICLE_LOCATION, updated));
    }
}
