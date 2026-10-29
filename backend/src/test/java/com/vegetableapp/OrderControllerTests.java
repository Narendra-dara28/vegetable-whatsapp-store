package com.vegetableapp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vegetableapp.entity.Product;
import com.vegetableapp.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class OrderControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        String loginJson = """
                {
                    "username": "testadmin",
                    "password": "testpassword123"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        this.adminToken = responseNode.get("token").asText();
    }

    @Test
    void testCreateOrderComputesServerTotal() throws Exception {
        List<Product> products = productRepository.findAllByAvailableTrueOrderBySortOrderAscNameAsc();
        Product p1 = products.get(0);
        Product p2 = products.get(1);

        BigDecimal expectedTotal = p1.getPrice().multiply(BigDecimal.valueOf(2))
                .add(p2.getPrice().multiply(BigDecimal.valueOf(1)));

        String orderJson = String.format("""
                {
                    "customerName": "Ramesh Kumar",
                    "phone": "9876543210",
                    "address": "Flat 301, Sunrise Heights, Kondapur",
                    "items": [
                        { "productId": %d, "quantity": 2 },
                        { "productId": %d, "quantity": 1 }
                    ]
                }
                """, p1.getId(), p2.getId());

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.customerName").value("Ramesh Kumar"))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.estimatedTotal").value(expectedTotal.doubleValue()))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(2));
    }

    @Test
    void testCreateOrderRejectsSoldOutItem() throws Exception {
        Product product = productRepository.findAll().get(0);
        product.setAvailable(false);
        productRepository.save(product);

        String orderJson = String.format("""
                {
                    "customerName": "Suresh",
                    "phone": "9876543210",
                    "address": "Madhapur",
                    "items": [
                        { "productId": %d, "quantity": 1 }
                    ]
                }
                """, product.getId());

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("sold out")));
    }

    @Test
    void testCreateOrderRejectsInvalidPhone() throws Exception {
        Product product = productRepository.findAllByAvailableTrueOrderBySortOrderAscNameAsc().get(0);

        String orderJson = String.format("""
                {
                    "customerName": "Test Customer",
                    "phone": "12345",
                    "address": "Kondapur",
                    "items": [
                        { "productId": %d, "quantity": 1 }
                    ]
                }
                """, product.getId());

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAdminOrdersEndpointProtected() throws Exception {
        mockMvc.perform(get("/api/admin/orders"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/orders")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders").isArray())
                .andExpect(jsonPath("$.statusCounts").isMap());
    }

    @Test
    void testPublicRouteAndTimingSettings() throws Exception {
        mockMvc.perform(get("/api/settings/route"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.key").value("ROUTE_AND_TIMING"))
                .andExpect(jsonPath("$.value").exists());
    }
}
