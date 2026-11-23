# 🥦 GreenBasket — Full-Stack Vegetable & Fruit WhatsApp Store

GreenBasket is a production-grade, bilingual (Telugu & English) e-commerce and merchant management platform designed for fresh vegetable and fruit vendors. It allows customers to browse live morning produce prices, build orders with custom metric quantities (kg, grams, bunches), and instantly transmit structured orders to the merchant via WhatsApp.

---

## 📌 Master Production Reference

| Service Tier | Provider | Service / Project Name | Production URL / Host |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Cloudflare Pages | `vegetable-whatsapp-store` | [vegetable-whatsapp-store.pages.dev](https://vegetable-whatsapp-store.pages.dev) |
| **Backend REST API** | Render Web Services | `greenbasket-backend` | [greenbasket-backend-30sl.onrender.com](https://greenbasket-backend-30sl.onrender.com) |
| **Cloud PostgreSQL DB** | Supabase | `greenbasket-db` | `aws-0-ap-southeast-2.pooler.supabase.com:5432` |
| **GitHub Source Code** | GitHub | `vegetable-whatsapp-store` | [github.com/Narendra-dara28/vegetable-whatsapp-store](https://github.com/Narendra-dara28/vegetable-whatsapp-store) |
| **Merchant WhatsApp** | WhatsApp API | GreenBasket Direct | `+91 7569479098` |

---

## 🔐 Admin Dashboard Credentials

* **Admin Login Route**: [`/admin/login`](https://vegetable-whatsapp-store.pages.dev/admin/login)
* **Default Username**: `SIva`
* **Default Password**: `Siva@8179`
* **Features**:
  * **Morning Price Update**: Batch-update daily market vegetable/fruit prices with instant storefront sync.
  * **Availability Toggle**: Mark items in-stock or out-of-stock.
  * **Order Management**: Monitor incoming orders, status updates (Pending, Confirmed, Delivered, Cancelled).
  * **Settings Management**: Update store name, announcement banner, and delivery timings.

---

## 🏗️ Architecture & Connection Flow

```
[ Customer Browser ]
       │
       ▼
[ Cloudflare Pages (Frontend CDN) ] ── (https://vegetable-whatsapp-store.pages.dev)
       │
       ├──► WhatsApp Order Dispatch ──► [ Merchant WhatsApp: +91 7569479098 ]
       │
       ▼ (REST API / CORS)
[ Render Web Service (Spring Boot 3 Docker) ] ── (https://greenbasket-backend-30sl.onrender.com)
       │
       ▼ (JDBC / IPv4 Session Pooler with SSL)
[ Supabase PostgreSQL (Cloud Database) ] ── (aws-0-ap-southeast-2.pooler.supabase.com)
```

---

## ⚙️ Service Configurations

### 1. Frontend (Cloudflare Pages)
* **Project Name**: `vegetable-whatsapp-store`
* **Connected Repository**: `Narendra-dara28/vegetable-whatsapp-store`
* **Production Branch**: `main`
* **Framework**: `Vite` (React 18 + Tailwind CSS + Lucide Icons)
* **Build Command**: `npm run build`
* **Build Output Directory**: `dist`
* **Root Directory**: `frontend`
* **Single Page Application Routing**: Configured in `frontend/public/_redirects`:
  ```text
  /* /index.html 200
  ```
* **Environment Files**:
  * `frontend/.env.production` (Baked into Cloudflare build):
    ```env
    VITE_API_URL=https://greenbasket-backend-30sl.onrender.com
    VITE_WHATSAPP_NUMBER=917569479098
    ```
  * `frontend/.env` (Used for Localhost development with Vite proxy):
    ```env
    VITE_API_URL=
    VITE_WHATSAPP_NUMBER=917569479098
    ```

### 2. Backend (Render Web Service)
* **Service Name**: `greenbasket-backend` (Service ID: `srv-dc23qrt9fdbs73cbfk00`)
* **Runtime**: `Docker`
* **Root Directory**: `backend` (or repository root with `backend/Dockerfile`)
* **Dockerfile Path**: `backend/Dockerfile`
* **Docker Build Context Directory**: `backend`
* **Instance Type**: `Free ($0 / month)` (512 MB RAM, 0.1 CPU)
* **Health Check Path**: `/healthz` (Returns `{"status":"UP"}` with HTTP 200)
* **Auto-Deploy**: Enabled on Git push to branch `main`
* **Container Entrypoint**:
  ```dockerfile
  ENTRYPOINT ["java", "-Xms256m", "-Xmx450m", "-jar", "app.jar"]
  ```

### 3. Database (Supabase PostgreSQL)
* **Project Name**: `greenbasket-db`
* **Region**: `ap-southeast-2` (Sydney / AWS)
* **Connection Type**: **Session Pooler** (Mandatory for Render IPv4 compatibility)
* **Host**: `aws-0-ap-southeast-2.pooler.supabase.com`
* **Port**: `5432`
* **Database Name**: `postgres`
* **User**: `postgres.sikughvzthzlbtoyjnoh`
* **SSL Mode**: `sslmode=require`

---

## 🔑 Backend Environment Variables (Render Dashboard)

| Variable Key | Production Value | Purpose |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require` | Database JDBC connection string |
| `SPRING_DATASOURCE_USERNAME` | `postgres.sikughvzthzlbtoyjnoh` | Supabase pooled user |
| `SPRING_DATASOURCE_PASSWORD` | *(Configured Supabase DB password)* | Database access credential |
| `APP_JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit HS256 JWT encryption key |
| `PORT` | `8080` | Container HTTP listener port |

---

## 💻 Local Development Guide

### Running Frontend Locally
```powershell
cd d:\MyProject\vegetable-whatsapp-app\frontend
npm install
npm run dev
```
* Opens on **`http://localhost:5173`**.
* In local mode, `frontend/vite.config.js` reverse-proxies `/api` requests to `http://localhost:8080`.

### Running Backend Locally
```powershell
cd d:\MyProject\vegetable-whatsapp-app\backend
.\mvnw.cmd spring-boot:run
```
* Opens on **`http://localhost:8080`**.
* Connects to local PostgreSQL by default (`jdbc:postgresql://localhost:5432/vegetable_db`).
* To run locally connected to Supabase:
  ```powershell
  $env:SPRING_DATASOURCE_URL="jdbc:postgresql://aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require"
  $env:SPRING_DATASOURCE_USERNAME="postgres.sikughvzthzlbtoyjnoh"
  $env:SPRING_DATASOURCE_PASSWORD="YourPasswordHere"
  .\mvnw.cmd spring-boot:run
  ```

---

## 🚨 Troubleshooting & Maintenance Playbook

1. **Cold Start (Render Free Tier Sleep Mode)**:
   * First request after 15 min of inactivity can take ~30–50s.
   * The frontend uses `fallbackProducts.js` cache, so customers never see a broken or blank page.
2. **Maven 429 Too Many Requests**:
   * Solved using the unthrottled public mirror in `backend/settings.xml`.
3. **Cloudflare 404 on Page Refresh**:
   * Solved with `frontend/public/_redirects` (`/* /index.html 200`).
4. **Changing Merchant WhatsApp Phone**:
   * Update `VITE_WHATSAPP_NUMBER` in `frontend/.env.production` and push to GitHub.
5. **Triggering Manual Deploy on Render**:
   * Go to Render ➔ `greenbasket-backend` ➔ **Manual Deploy** ➔ **Clear build cache & deploy**.

