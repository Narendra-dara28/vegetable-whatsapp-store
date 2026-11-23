# 🥦 GreenBasket — Frontend & Cloud Architecture Documentation

Welcome to the **GreenBasket** (Vegetable & Fruit WhatsApp Store) documentation. This document serves as the master operations manual for all live production services, configurations, environment variables, architectures, and troubleshooting steps for future maintenance.

---

## 🚀 Quick Access Links

* **Customer Storefront**: https://vegetable-whatsapp-store.pages.dev
* **Admin Portal**: https://vegetable-whatsapp-store.pages.dev/admin/login
* **Backend API Direct**: https://greenbasket-backend-30sl.onrender.com/api/products

---

## 📌 Master Production Reference

| Service Tier | Provider | Service / Project Name | Production URL / Host |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Cloudflare Pages | `vegetable-whatsapp-store` | [vegetable-whatsapp-store.pages.dev](https://vegetable-whatsapp-store.pages.dev) |
| **Backend REST API** | Render Web Services | `greenbasket-backend` | [greenbasket-backend-30sl.onrender.com](https://greenbasket-backend-30sl.onrender.com) |
| **Cloud PostgreSQL DB** | Supabase | `greenbasket-db` | `aws-0-<REGION>.pooler.supabase.com:5432` |
| **GitHub Source Code** | GitHub | `vegetable-whatsapp-store` | [github.com/Narendra-dara28/vegetable-whatsapp-store](https://github.com/Narendra-dara28/vegetable-whatsapp-store) |
| **Merchant WhatsApp** | WhatsApp API | GreenBasket Direct | `+91 7569479098` |

---

## 🔐 Admin Dashboard Credentials

* **Admin Login Route**: [`/admin/login`](https://vegetable-whatsapp-store.pages.dev/admin/login)
* **Username**: Set via `APP_ADMIN_USERNAME` in Render environment variables
* **Password**: Set via `APP_ADMIN_PASSWORD` in Render environment variables *(Kept private; never hardcoded in repository)*
* **Capabilities**:
  * **Morning Price Update**: Batch-update daily market vegetable/fruit prices with instant storefront sync.
  * **Availability Toggle**: Mark items in-stock or out-of-stock.
  * **Order Management**: Monitor incoming orders, status updates (Pending, Confirmed, Delivered, Cancelled).
  * **Settings Management**: Update store name, announcement banner, and delivery timings.

---

## 🏗️ Cloud Infrastructure & Connection Flow

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
[ Supabase PostgreSQL (Cloud Database) ] ── (aws-0-<REGION>.pooler.supabase.com)
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
  * `frontend/.env.example` (Template for local development):
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
* **Connection Type**: **Session Pooler** (Mandatory for Render IPv4 compatibility)
* **Port**: `5432`
* **Database Name**: `postgres`
* **SSL Mode**: `sslmode=require`

---

## 🔑 Backend Environment Variables (Configured Securely in Render)

These environment variables are set in **Render ➔ greenbasket-backend ➔ Environment** (never stored in public code):

| Variable Key | Value Source | Purpose |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require` | Database JDBC connection string |
| `SPRING_DATASOURCE_USERNAME` | `postgres.<PROJECT_REF>` | Supabase pooled user |
| `SPRING_DATASOURCE_PASSWORD` | *(Secure Supabase DB password)* | Database access credential |
| `APP_JWT_SECRET` | *(64-character Hex secret key)* | 256-bit HS256 JWT encryption key |
| `APP_ADMIN_USERNAME` | *(Admin username, e.g. SIva)* | Merchant admin login ID |
| `APP_ADMIN_PASSWORD` | *(Private admin password)* | Merchant admin login password |
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

---

## 🚨 Troubleshooting & Maintenance Playbook

### 1. Render Free Tier Spin-Down (Cold Start Delay)
* **Symptom**: The first visit after 15+ minutes of inactivity takes 30–50 seconds to respond.
* **Why**: Render free instances enter sleep mode when idle to conserve cloud resources.
* **Built-in Protection**: The frontend includes `frontend/src/utils/fallbackProducts.js`. If the backend is asleep or waking up, customers immediately see all vegetable items from cache and can send their WhatsApp orders without waiting.

### 2. Maven 429 Too Many Requests During Build
* **Symptom**: Render build logs show `status code: 429, reason phrase: Too Many Requests (429)` from `repo.maven.apache.org`.
* **Fix Applied**: `backend/settings.xml` routes dependency downloads through the unthrottled `https://maven.aliyun.com/repository/public` mirror with automatic retry logic.

### 3. Page Refresh Shows 404 on Cloudflare Pages
* **Fix**: Ensure `frontend/public/_redirects` exists with `/* /index.html 200` and commit to Git.

### 4. Updating the Merchant WhatsApp Number
* Open `frontend/.env.production`.
* Update `VITE_WHATSAPP_NUMBER=<country_code_and_number>` (e.g. `917569479098` without spaces or `+`).
* Commit and push to `main`; Cloudflare Pages will redeploy within 60 seconds.

### 5. Manual Backend Redeployment
If you ever need to trigger a fresh rebuild of the backend:
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Select **greenbasket-backend**.
3. In the top right, click **Manual Deploy** ➔ **Clear build cache & deploy**.

---

*Authored for GreenBasket Platform Maintenance & Engineering handoff.*
