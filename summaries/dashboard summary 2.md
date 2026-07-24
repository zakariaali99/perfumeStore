# Dashboard Summary 2 — Old System (`old-sys`)

> Scope: This document is a detailed, dashboard-only summary of the legacy system found in
> `old-sys/perfumeStore`. It covers the admin dashboard's **UI**, its **data**, the **frontend
> pages**, the **API layer**, and the **Django backend** that powers it. It is intended as a
> reference for re-implementing or migrating the dashboard.

---

## 1. Overview

The old system is a monorepo for **"Mostafa's Store"**, a luxury perfume e-commerce platform:

- **Backend:** Django + Django REST Framework, SQLite (`db.sqlite3`), organized into apps under
  `backend/apps/` (`accounts`, `analytics`, `cart`, `cms`, `crm`, `marketing`, `orders`,
  `products`, `recommendations`).
- **Primary frontend:** `frontend/` (React + Vite), which contains **both** the public storefront
  **and** the admin dashboard (under `/dashboard/*` routes).
- **Secondary/legacy dashboard:** `admin-dashboard/` (a separate, minimal React+Vite app with only
  `Dashboard.jsx` and `Categories.jsx`) — largely superseded by the dashboard inside `frontend/`.

The **active dashboard** is the one inside `frontend/src/pages/dashboard/` + `frontend/src/components/dashboard/`.

- **Language / direction:** RTL, Arabic UI (`font-tajawal`).
- **Styling:** Tailwind CSS with a gold/cream luxury theme.
- **Icons:** `lucide-react`. **Notifications:** `react-hot-toast`.

---

## 2. Routing (frontend `App.jsx`)

Dashboard routes are all under `/dashboard`:

| Path | Component | Purpose |
|------|-----------|---------|
| `/dashboard/login` | `DashboardLogin` | Admin login (public) |
| `/dashboard` (index) | `DashboardHome` | Overview / KPIs |
| `/dashboard/categories` | `DashboardCategories` | Category CRUD |
| `/dashboard/brands` | `DashboardBrands` | Brand CRUD |
| `/dashboard/products` | `DashboardProducts` | Product list |
| `/dashboard/product/new` & `/dashboard/product/:id` | `ProductEdit` | Product create/edit |
| `/dashboard/orders` | `DashboardOrders` | Order management |
| `/dashboard/customers` | `DashboardCustomers` | Customer/CRM management |
| `/dashboard/analytics` | `DashboardAnalytics` | Analytics & charts |
| `/dashboard/cms` | `DashboardCMS` | Content management (homepage, slides, etc.) |
| `/dashboard/coupons` | `DashboardCoupons` | Coupon CRUD |
| `/dashboard/settings` | `DashboardSettings` | Store settings |

All dashboard routes (except `/dashboard/login`) are wrapped in a protected route that redirects
to `/dashboard/login` when no auth token is present, and render inside `DashboardLayout`.

---

## 3. The API Layer (`frontend/src/services/api.js`)

Single shared Axios instance used across the whole dashboard.

```js
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});
```

- **Base URL:** `VITE_API_URL` env var, falling back to `/api/`. All endpoint paths below are
  relative to this base (full path = `/api/` + path).
- **withCredentials:** `true` (cookies sent).

**Request interceptor (auth):**
- Reads `localStorage.getItem('access_token')`; if present, sets
  `Authorization: Bearer <token>`.
- If the payload is `FormData`, it deletes the JSON `Content-Type` header so Axios sets the
  multipart boundary (used for image uploads in Products/CMS).

**Response interceptor (token refresh / errors):**
- On `401` (and not already retried): marks `_retry`, reads `refresh_token`, and POSTs to
  `accounts/token/refresh/` (→ `/api/accounts/token/refresh/`) with `{ refresh }`. On success it
  stores the new `access_token` and retries the original request.
- On refresh failure it clears tokens and — for dashboard-scoped requests (URL includes
  `accounts/`, `analytics/`, `cms/`, `crm/`, or `admin/`) — redirects to `/dashboard/login`.

**Key API groups & exact endpoints:**

| API object / method | HTTP | Endpoint |
|---------------------|------|----------|
| `accountsApi.login(data)` | POST | `/api/accounts/login/` |
| (token refresh) | POST | `/api/accounts/token/refresh/` |
| `analyticsApi.getStats(params)` | GET | `/api/analytics/stats/` (`?days=`) |
| `analyticsApi.getInventory()` | GET | `/api/analytics/inventory/` |
| `adminProductsApi` | GET/POST/PUT/DELETE | admin product CRUD |
| `productsApi` | GET | public products/categories (used for filters) |
| `cmsApi` | GET/POST/PUT/DELETE | CMS content, settings, slides |
| `crmApi` | GET/etc. | customer profiles/segments |
| orders API | GET/PATCH | orders list + status updates |

---

## 4. Dashboard Layout (`components/dashboard/DashboardLayout.jsx`)

- **Structure:** `flex` root, RTL. A fixed **desktop sidebar** (`w-72`, `hidden lg:flex`, sticky
  full-height) plus a scrollable main content area (`<Outlet />`). On mobile the sidebar becomes a
  toggle-able drawer.
- **Sidebar navigation** maps to the routes in §2 (Home, Categories, Brands, Products, Orders,
  Customers, Analytics, CMS, Coupons, Settings), each with a `lucide-react` icon and active-state
  highlight.
- **Auth / logout:** logout clears `access_token` / `refresh_token` from `localStorage` and
  redirects to `/dashboard/login`.
- **State:** local UI state for the mobile drawer open/close and active-link detection via router.

---

## 5. Login (`pages/dashboard/DashboardLogin.jsx`)

- **Fields:** email/username + password.
- **Endpoint:** POST `accountsApi.login` → `/api/accounts/login/`.
- **Token storage:** stores `access_token` and `refresh_token` in `localStorage`.
- **Redirect:** on success → `/dashboard` (home). Shows toast on error.

---

## 6. Dashboard Home (`pages/dashboard/DashboardHome.jsx`)

- **Data source:** `analyticsApi.getStats()` → `GET /api/analytics/stats/`.
- **UI:** KPI stat cards (revenue, orders, products, customers) with trend indicators, plus
  recent orders and highlight sections.
- Uses the `summary`, `recent_orders`, etc. keys of the stats response (see §9 for full shape).

---

## 7. Analytics (`pages/dashboard/DashboardAnalytics.jsx`)

- **Endpoint:** `analyticsApi.getStats({ days })` → `GET /api/analytics/stats/?days=<30|90>`
  (called on mount and whenever the time-range toggle changes; `days` = 30 for `'30d'`, else 90).
- **State:** `data` (response object, initially `null`), `loading` (bool), `timeRange`
  (`'30d'` default, toggled to `'90d'`). Fetch is a `useCallback` keyed on `timeRange`; error shows
  toast `'تعذر تحميل البيانات التحليلية'`.
- **UI:**
  - Summary KPI cards: total revenue, monthly revenue, total orders, total customers, average
    order value (AOV), with trend percentages.
  - **Monthly revenue chart** (from `monthly_sales`, up to last 12 months).
  - **Top products** list (from `top_products`).
  - **City sales** breakdown (from `city_sales`).
  - **Customer segments** breakdown (from `customer_segments`).
  - Time-range toggle (30d / 90d).

---

## 8. CRUD & Management Pages

### 8.1 Products (`DashboardProducts.jsx`)
- Uses `adminProductsApi` (list/delete) + `productsApi` (category filter options).
- **UI:** header with "إضافة منتج جديد" → `<Link to="/dashboard/product/new">`; filter bar (text
  search over name/brand/SKU + category `<select>` built from categories, options keyed by `slug`,
  labeled `name_ar`); a **table** (not a modal).
- **Table columns:** المنتج (main_image + `name_ar` + `slug`), التصنيف (`category.name_ar`),
  الماركة (`brand.name_ar`), الجنس (`gender`: men=رجالي / women=نسائي / else للجنسين), price,
  actions (edit → `ProductEdit` route, delete via `adminProductsApi`).
- Create/Edit is on the separate `ProductEdit.jsx` page (route pages, not inline modal).

### 8.2 Categories (`DashboardCategories.jsx`)
- Full CRUD via modal forms. Fields include Arabic/English name, slug, image, ordering.

### 8.3 Brands (`DashboardBrands.jsx`)
- Full CRUD via modal forms. Fields include Arabic/English name, slug, logo/image.

### 8.4 Coupons (`DashboardCoupons.jsx`)
- Full CRUD. Fields: code, discount type/value, usage limits/`used_count`, validity dates,
  active flag.

### 8.5 Orders (`DashboardOrders.jsx`)
- Lists orders with details (customer, city, total, status). Supports **status changes**
  (e.g., pending → processing → delivered) via PATCH. Filtering by status.

### 8.6 Customers (`DashboardCustomers.jsx`)
- CRM view: lists `CustomerProfile` records with segments, contact info, and order history.
  Supports viewing/editing customer data and segment.

### 8.7 CMS (`DashboardCMS.jsx`) — largest page (~946 lines)
- Manages homepage content: hero slides, banners, sections, and store content blocks via `cmsApi`.
- Uses `FormData` for image uploads (interceptor strips JSON `Content-Type`).

### 8.8 Settings (`DashboardSettings.jsx`)
- Store-level settings managed through `cmsApi` (store info, shipping, contact, etc.).

---

## 9. Backend — Analytics App (`backend/apps/analytics/`)

### 9.1 Models
**None.** `analytics/models.py` contains only the default import and a comment — the analytics app
defines **no** database models. All metrics are **computed on-the-fly** by aggregating data from
the `orders`, `products`, and `crm` apps.

### 9.2 URL routing
Mounted in `config/urls.py`:
```python
path("api/analytics/", include("analytics.urls")),
# other dashboard-relevant mounts:
path("api/accounts/", include("accounts.urls")),
path("api/products/", include("products.urls")),
path("api/orders/",   include("orders.urls")),
path("api/crm/",      include("crm.urls")),
# admin template + SPA catch-all:
path("dashboard/", TemplateView.as_view(template_name="admin/index.html")),
re_path(r'^.*$', TemplateView.as_view(template_name="frontend/index.html")),
```

`analytics/urls.py`:
```python
urlpatterns = [
    path('stats/',     DashboardStatsView.as_view(),  name='dashboard-stats'),
    path('inventory/', InventoryReportView.as_view(), name='inventory-report'),
]
```
Full URLs: `GET /api/analytics/stats/`, `GET /api/analytics/inventory/`.

### 9.3 `DashboardStatsView` (`GET /api/analytics/stats/`)
- **Permission:** `IsAdminUser`.
- **Query param:** `days` (default `30`) — defines the "current period" window
  (`this_month_start = now - days`); the prior period is one month before that (via
  `relativedelta`), used for trend calculation.
- **Computations:**
  - **Totals:** `total_revenue` (Sum of `Order.total` where `status='delivered'`), `total_orders`
    (Order count), `total_products` (Product count), `total_customers` (CustomerProfile count).
  - **Current period:** revenue (delivered, `created_at >= this_month_start`), order count,
    customer count.
  - **Previous period:** revenue/orders/customers within the prior window (for trends).
  - **Trends:** `calc_trend(cur, prev) = round((cur-prev)/prev*100, 1)` (0 if `prev == 0`).
  - **Monthly sales:** last 12 months, delivered orders, grouped by `TruncMonth('created_at')`,
    annotated with `revenue=Sum('total')` and `orders=Count('id')`.
  - **Top products:** `OrderItem` grouped by `product_name`, annotated
    `total_sold=Sum('quantity')`, `revenue=Sum('total_price')`, top 5.
  - **City sales:** `Order` grouped by `city`, annotated `revenue=Sum('total')`, `count=Count('id')`.
  - **Customer segments:** `CustomerProfile` grouped by `segment`, annotated `count`.
  - **Recent orders:** latest 10 orders serialized with `OrderSerializer`.
- **Response shape:**
```json
{
  "summary": {
    "total_revenue": 0,
    "total_orders": 0,
    "total_products": 0,
    "total_customers": 0,
    "aov": 0,
    "monthly_revenue": 0,
    "revenue_trend": 0.0,
    "orders_trend": 0.0,
    "customers_trend": 0.0,
    "mrr": 0
  },
  "monthly_sales": [{ "month": "...", "revenue": 0, "orders": 0 }],
  "top_products": [{ "product_name": "...", "total_sold": 0, "revenue": 0 }],
  "city_sales": [{ "city": "...", "revenue": 0, "count": 0 }],
  "customer_segments": [{ "segment": "...", "count": 0 }],
  "recent_orders": [ /* OrderSerializer output */ ]
}
```
- `aov` = `total_revenue / total_orders` (0 if no orders). `mrr` is set equal to current-month
  revenue for this store.

### 9.4 `InventoryReportView` (`GET /api/analytics/inventory/`)
- **Permission:** `IsAdminUser`.
- **Logic:** finds `ProductVariant` rows with `stock_quantity <= 5` (`select_related('product')`).
- **Response:**
```json
{
  "low_stock": [
    { "product": "<product.name_ar>", "size": "<size_ml>", "stock": 0 }
  ]
}
```
- Note: This endpoint is exposed in `api.js` (`analyticsApi.getInventory`) but is **not** actually
  called by `DashboardAnalytics.jsx`.

---

## 10. Data Sources Behind the Dashboard

| Dashboard area | Backend app / model | Notes |
|----------------|--------------------|-------|
| Revenue, orders, AOV, monthly sales, city sales, recent orders | `orders` (`Order`, `OrderItem`) | Revenue counts only `status='delivered'` orders |
| Top products, product list, inventory | `products` (`Product`, `ProductVariant`) | Low-stock threshold = 5 |
| Customers, segments | `crm` (`CustomerProfile`) | Segment grouping for analytics |
| Auth / login / token refresh | `accounts` | JWT: `access_token` + `refresh_token` |
| CMS content, settings, slides | `cms` | FormData uploads |
| Coupons | `marketing` / coupons | `used_count`, validity, active flag |

---

## 11. Key Observations & Notes

- **Analytics has no persistence layer** — all KPIs are recomputed per request from live
  order/product/CRM data. No caching; heavier as data grows.
- **Revenue is delivered-only** — pending/processing orders are excluded from revenue totals,
  which affects displayed KPIs vs. raw order totals.
- **`mrr` ≡ current-month revenue** by design (not a true subscription MRR).
- **Inventory endpoint is unused by the analytics page** despite being wired in the API client.
- **Two dashboards exist** — the maintained one is inside `frontend/`; `admin-dashboard/` is a
  minimal legacy app.
- **Auth relies on `localStorage`** tokens with an automatic refresh-and-retry interceptor and
  redirect-to-login on failure for dashboard-scoped requests.
- All admin analytics endpoints require `IsAdminUser` permission.
