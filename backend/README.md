# 🥦 Vegetable & Fruit Catalog Backend (Phase 1 & Phase 3)

Clean, secure, production-ready Spring Boot 3 REST API for the Vegetable and Fruit Catalog application with WhatsApp ordering.

---

## 🏗️ Architecture & Features

- **Framework**: Spring Boot 3.4.3 (Java 17+)
- **Security**: Spring Security 6 with stateless HMAC-SHA256 **JWT (JSON Web Tokens)**
- **Persistence**: Spring Data JPA with PostgreSQL (and in-memory H2 profile for zero-friction local testing)
- **Data Integrity**: `BigDecimal(10,2)` for exact currency calculations (never floating point)
- **Validation**: Jakarta Validation (`@NotNull`, `@NotBlank`, `@DecimalMin`, `@Valid`, `@Pattern`)
- **Error Handling**: Uniform `@RestControllerAdvice` returning standard JSON error payloads
- **Key Morning Workflow**: `PUT /api/admin/products/bulk-price` allows the vendor to update all item prices in a single click and transaction.
- **Server-Side Order Calculation**: `POST /api/orders` looks up prices from the DB and calculates totals securely on the backend before order persistence.
- **Route & Timing Setting**: Key-value settings API for dynamic delivery banner display.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/vegetableapp/
│   │   │   ├── VegetableApplication.java
│   │   │   ├── config/
│   │   │   │   └── DataInitializer.java        # Seeds admin user & 10 sample items
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java          # POST /api/auth/login
│   │   │   │   ├── PublicProductController.java # GET /api/products (public)
│   │   │   │   └── AdminProductController.java  # /api/admin/products (JWT required)
│   │   │   ├── dto/
│   │   │   │   ├── AuthResponse.java
│   │   │   │   ├── AvailabilityUpdateRequest.java
│   │   │   │   ├── BulkPriceUpdateRequest.java
│   │   │   │   ├── ErrorResponse.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── ProductPriceItem.java
│   │   │   │   ├── ProductRequest.java
│   │   │   │   └── ProductResponse.java
│   │   │   ├── entity/
│   │   │   │   ├── Admin.java
│   │   │   │   └── Product.java
│   │   │   ├── exception/
│   │   │   │   ├── BadRequestException.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── repository/
│   │   │   │   ├── AdminRepository.java
│   │   │   │   └── ProductRepository.java
│   │   │   ├── security/
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   └── SecurityConfig.java
│   │   │   └── service/
│   │   │       ├── AuthService.java
│   │   │       └── ProductService.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-local.yml
│   └── test/
│       ├── java/com/vegetableapp/
│       │   ├── AdminProductControllerTests.java
│       │   ├── AuthControllerTests.java
│       │   ├── PublicProductControllerTests.java
│       │   └── VegetableApplicationTests.java
│       └── resources/
│           └── application.yml
├── mvnw
├── mvnw.cmd
└── pom.xml
```

---

## ⚙️ Environment Variables & Configuration

All settings have safe defaults and can be configured through environment variables:

| Variable | Description | Default |
|---|---|---|
| `SERVER_PORT` | HTTP port | `8080` |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/vegetable_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `postgres` |
| `APP_JWT_SECRET` | 256-bit secret key for JWT signing | 64-char Hex default |
| `APP_JWT_EXPIRATION_MS` | JWT expiry time in milliseconds | `86400000` (24h) |
| `FRONTEND_URL` / `APP_CORS_ALLOWED_ORIGINS` | Allowed frontend CORS origins (comma-separated) | `http://localhost:5173,http://localhost:3000` |
| `ADMIN_USERNAME` | Default seeded admin username | `admin` |
| `ADMIN_PASSWORD` | Default seeded admin password | `admin123` |
| `APP_SEED_SAMPLE_DATA` | Auto-seed 10 vegetables & fruits on startup | `true` |

---

## 🚀 How to Run

### Option 1: Quick Test (In-Memory Database, zero setup needed)
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```
*(On Windows PowerShell: `.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"`)*

### Option 2: Production / Local PostgreSQL
1. Create database:
   ```sql
   CREATE DATABASE vegetable_db;
   ```
2. Run the application:
   ```bash
   # Linux/macOS
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/vegetable_db \
   SPRING_DATASOURCE_USERNAME=postgres \
   SPRING_DATASOURCE_PASSWORD=your_password \
   ./mvnw spring-boot:run

   # Windows PowerShell
   $env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/vegetable_db"
   $env:SPRING_DATASOURCE_USERNAME="postgres"
   $env:SPRING_DATASOURCE_PASSWORD="your_password"
   .\mvnw.cmd spring-boot:run
   ```

### Running Automated Tests
```bash
.\mvnw.cmd test
```

---

## 📬 Postman & cURL Testing Guide

### 1. Admin Login (Generate JWT Token)
- **URL**: `POST http://localhost:8080/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- **Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "username": "admin",
  "role": "ROLE_ADMIN",
  "expiresInMs": 86400000
}
```
> 💡 *Copy the `token` string for use in all `/api/admin/**` requests as `Authorization: Bearer <token>`.*

---

### 2. Public Catalog (Customer view)
- **URL**: `GET http://localhost:8080/api/products`
- **Security**: None (Public)
- **Response**: List of all available vegetables/fruits with Telugu local names, units, and rupee prices.

---

### 3. Public Single Item View
- **URL**: `GET http://localhost:8080/api/products/1`
- **Security**: None (Public)

---

### 4. Admin - View All Inventory (Available & Out of Stock)
- **URL**: `GET http://localhost:8080/api/admin/products`
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`

---

### 5. Admin - Morning Routine Bulk Price Update ⚡
Update today's market rates for all items in a single click:
- **URL**: `PUT http://localhost:8080/api/admin/products/bulk-price`
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "items": [
    { "id": 1, "price": 40.00 },
    { "id": 2, "price": 42.00 },
    { "id": 3, "price": 50.00 }
  ]
}
```

---

### 6. Admin - Add New Product (with local Telugu name & photo)
- **URL**: `POST http://localhost:8080/api/admin/products`
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "name": "Fresh Mango (Banganapalli)",
  "nameLocal": "బంగినపల్లి మామిడి (Banganapalli Mamidi)",
  "category": "Fruits",
  "price": 120.00,
  "unit": "1 kg",
  "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80",
  "available": true,
  "sortOrder": 11
}
```

---

### 7. Admin - Toggle Availability (Sold-Out / In-Stock)
- **URL**: `PATCH http://localhost:8080/api/admin/products/1/availability`
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "available": false
}
```

---

### 8. Admin - Soft Delete Item
- **URL**: `DELETE http://localhost:8080/api/admin/products/1`
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
- **Response**: `204 No Content` (item is marked `available: false`, preserving historical integrity)
