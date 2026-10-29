package com.vegetableapp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class AdminProductControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

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
        this.jwtToken = responseNode.get("token").asText();
    }

    @Test
    void testAccessDeniedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetAllAdminProductsWithToken() throws Exception {
        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testCreateProduct() throws Exception {
        String createJson = """
                {
                    "name": "Fresh Carrot",
                    "nameLocal": "క్యారెట్ (Carrot)",
                    "category": "Vegetables",
                    "price": 60.00,
                    "unit": "1 kg",
                    "imageUrl": "https://example.com/carrot.jpg",
                    "available": true,
                    "sortOrder": 11
                }
                """;

        mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Fresh Carrot"))
                .andExpect(jsonPath("$.price").value(60.00));
    }

    @Test
    void testBulkPriceUpdate() throws Exception {
        String bulkJson = """
                {
                    "items": [
                        { "id": 1, "price": 42.50 },
                        { "id": 2, "price": 38.00 }
                    ]
                }
                """;

        mockMvc.perform(put("/api/admin/products/bulk-price")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bulkJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].price").value(42.50))
                .andExpect(jsonPath("$[1].price").value(38.00));
    }

    @Test
    void testUpdateAvailability() throws Exception {
        String patchJson = """
                {
                    "available": false
                }
                """;

        mockMvc.perform(patch("/api/admin/products/1/availability")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void testSoftDelete() throws Exception {
        mockMvc.perform(delete("/api/admin/products/3")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        // Verify product 3 is now unavailable
        mockMvc.perform(get("/api/admin/products/3")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }
}
