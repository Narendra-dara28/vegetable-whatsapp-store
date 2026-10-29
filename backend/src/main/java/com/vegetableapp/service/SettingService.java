package com.vegetableapp.service;

import com.vegetableapp.entity.Setting;
import com.vegetableapp.repository.SettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SettingService {

    public static final String KEY_ROUTE_AND_TIMING = "ROUTE_AND_TIMING";
    public static final String KEY_VEHICLE_LOCATION = "VEHICLE_LOCATION";
    private static final String DEFAULT_ROUTE_TEXT = "Today's Route: Kondapur, Gachibowli & Madhapur. Morning deliveries 7:00 AM - 11:30 AM.";

    private final SettingRepository settingRepository;

    public SettingService(SettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @Transactional(readOnly = true)
    public String getRouteAndTiming() {
        return settingRepository.findBySettingKey(KEY_ROUTE_AND_TIMING)
                .map(Setting::getSettingValue)
                .orElse(DEFAULT_ROUTE_TEXT);
    }

    public String updateRouteAndTiming(String newValue) {
        Setting setting = settingRepository.findBySettingKey(KEY_ROUTE_AND_TIMING)
                .orElseGet(() -> new Setting(KEY_ROUTE_AND_TIMING, ""));

        setting.setSettingValue(newValue != null ? newValue.trim() : "");
        settingRepository.save(setting);
        return setting.getSettingValue();
    }

    @Transactional(readOnly = true)
    public String getVehicleLocation() {
        return settingRepository.findBySettingKey(KEY_VEHICLE_LOCATION)
                .map(Setting::getSettingValue)
                .orElse(null);
    }

    public String updateVehicleLocation(String newValue) {
        Setting setting = settingRepository.findBySettingKey(KEY_VEHICLE_LOCATION)
                .orElseGet(() -> new Setting(KEY_VEHICLE_LOCATION, ""));

        setting.setSettingValue(newValue != null ? newValue.trim() : "");
        settingRepository.save(setting);
        return setting.getSettingValue();
    }
}
