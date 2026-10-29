package com.vegetableapp.config;

import com.vegetableapp.entity.Admin;
import com.vegetableapp.entity.Product;
import com.vegetableapp.repository.AdminRepository;
import com.vegetableapp.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import org.springframework.jdbc.core.JdbcTemplate;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminRepository adminRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.admin.username:SIva}")
    private String defaultAdminUsername;

    @Value("${app.admin.password:Siva@8179}")
    private String defaultAdminPassword;

    @Value("${app.seed.sample-data:true}")
    private boolean seedSampleData;

    public DataInitializer(AdminRepository adminRepository,
            ProductRepository productRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {
        this.adminRepository = adminRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        removeOrderStatusCheckConstraint();
        migrateDeliveredAtColumn();
        seedAdminUser();
        if (seedSampleData) {
            seedSampleProducts();
        }
    }

    private void migrateDeliveredAtColumn() {
        try {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP");
            jdbcTemplate.execute(
                    "UPDATE orders SET delivered_at = created_at WHERE status = 'DELIVERED' AND delivered_at IS NULL");
            logger.info("Migrated orders table with delivered_at column and backfilled existing delivered orders");
        } catch (Exception e) {
            logger.debug("delivered_at migration info: {}", e.getMessage());
        }
    }

    private void removeOrderStatusCheckConstraint() {
        try {
            // Ensure orders.status column is plain VARCHAR(30) without enum check
            // constraints
            jdbcTemplate.execute("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(30)");
            logger.info("Successfully verified orders.status column as VARCHAR(30)");
        } catch (Exception e) {
            logger.debug("orders.status column check info: {}", e.getMessage());
        }
    }

    private void seedAdminUser() {
        Optional<Admin> existing = adminRepository.findByUsernameIgnoreCase(defaultAdminUsername);
        if (existing.isEmpty()) {
            Admin admin = new Admin(
                    defaultAdminUsername,
                    passwordEncoder.encode(defaultAdminPassword),
                    "ROLE_ADMIN");
            adminRepository.save(admin);
            logger.info("Admin user created: '{}'", defaultAdminUsername);
        } else {
            Admin admin = existing.get();
            admin.setUsername(defaultAdminUsername);
            admin.setPasswordHash(passwordEncoder.encode(defaultAdminPassword));
            adminRepository.save(admin);
            logger.info("Admin user '{}' credentials updated.", defaultAdminUsername);
        }
    }

    private void seedSampleProducts() {
        if (productRepository.count() == 0) {
            List<Product> sampleProducts = List.of(
                    new Product("Tomato (Local)", "నాటు టమాటా (Naatu Tomato)", "Vegetables",
                            new BigDecimal("35.00"), "1 kg",
                            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80",
                            true, 1),

                    new Product("Potato (Jyoti)", "బంగాళాదుంప (Aloo / Bangaladumpa)", "Vegetables",
                            new BigDecimal("40.00"), "1 kg",
                            "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80",
                            true, 2),

                    new Product("Red Onion", "ఉల్లిపాయ (Ullipaya)", "Vegetables",
                            new BigDecimal("45.00"), "1 kg",
                            "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80",
                            true, 3),

                    new Product("Green Chillies", "పచ్చిమిర్చి (Pachi Mirchi)", "Vegetables",
                            new BigDecimal("15.00"), "250g",
                            "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80",
                            true, 4),

                    new Product("Fresh Coriander", "కొత్తిమీర (Kothimeera)", "Leafy Greens",
                            new BigDecimal("10.00"), "bunch",
                            "https://images.unsplash.com/photo-1599818816933-4f9e1a8cf8ce?w=500&auto=format&fit=crop&q=80",
                            true, 5),

                    new Product("Palak (Spinach)", "పాలకూర (Paala Koora)", "Leafy Greens",
                            new BigDecimal("15.00"), "bunch",
                            "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80",
                            true, 6),

                    new Product("Ladies Finger (Bhindi)", "బెండకాయ (Bendakaya)", "Vegetables",
                            new BigDecimal("48.00"), "1 kg",
                            "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=500&auto=format&fit=crop&q=80",
                            true, 7),

                    new Product("Banana (Robusta)", "అరటిపండు (Aratipandu)", "Fruits",
                            new BigDecimal("50.00"), "dozen",
                            "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80",
                            true, 8),

                    new Product("Fresh Apples (Shimla)", "యాపిల్ (Apple)", "Fruits",
                            new BigDecimal("160.00"), "1 kg",
                            "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80",
                            true, 9),

                    new Product("Papaya (Sweet)", "బొప్పాయి (Boppayi)", "Fruits",
                            new BigDecimal("40.00"), "1 piece",
                            "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500&auto=format&fit=crop&q=80",
                            true, 10));

            productRepository.saveAll(sampleProducts);
            logger.info("Successfully seeded {} sample vegetables and fruits with Telugu labels.",
                    sampleProducts.size());
        }
    }
}
