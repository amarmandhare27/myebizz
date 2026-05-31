# MYEBIZZ - COMPREHENSIVE ARCHITECTURE ANALYSIS

**Date**: May 31, 2026  
**Project**: MyEbizz Multi-Tenant E-Commerce Platform  
**Scope**: Complete system architecture, payment integration, and user flows

---

## TABLE OF CONTENTS

1. [Phase 1: Project Understanding](#phase-1-project-understanding)
2. [Phase 2: User Journey & Flow Diagrams](#phase-2-user-journey--flow-diagrams)
3. [Phase 3: Payment Integration Analysis](#phase-3-payment-integration-analysis)
4. [Key Findings & Recommendations](#key-findings--recommendations)

---

# PHASE 1: PROJECT UNDERSTANDING

## Executive Summary

**Application**: MyEbizz is a **multi-tenant, SaaS-based e-commerce platform** that empowers creators and entrepreneurs to launch their own branded online storefronts without technical expertise.

**Business Problem Solved**:
- Eliminates barriers for small business owners to establish online presence
- Provides ready-made e-commerce infrastructure with payment processing
- Enables platform monetization through tiered subscription plans (Free, Pro, Enterprise)
- Supports creators in maintaining brand identity (custom colors, logos, branding)

**Target Users**:
1. **Store Owners/Creators** - Small businesses, influencers, boutique owners launching their stores
2. **Customers** - End consumers shopping on individual storefronts
3. **Platform Administrators** - System operators managing all stores and users

**Core Features**:

| Category | Features |
|----------|----------|
| **Multi-Tenancy** | Isolated storefronts per seller with custom domains/slugs |
| **Product Management** | Featured products, categories, variants, inventory tracking, images |
| **Commerce** | Shopping cart, coupons, order management, tracking numbers |
| **Payments** | Stripe & Razorpay integration with real-time verification |
| **Admin Dashboard** | Store analytics, order management, coupon creation, product CRUD |
| **Super-Admin** | Platform-wide store management, client management, KPIs |
| **Authentication** | JWT-based auth with role management (admin/super_admin/user) |
| **Branding** | Customizable colors, logos, banners, social media links |

---

## Technical Stack

### Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.2.6 |
| Runtime | React | 18.3 |
| Language | TypeScript | 5 |
| UI Components | Radix UI | Latest |
| Styling | Tailwind CSS | 3.4 |
| State Management | Zustand | 5.0 |
| Form Handling | React Hook Form | 7.53 |
| Validation | Zod | Latest |
| Authentication | NextAuth | 4.24.10 |
| Payments | Stripe SDK + Razorpay SDK | Latest |
| Animations | Framer Motion | Latest |
| Notifications | Sonner | Latest |
| Icons | Lucide React | Latest |

### Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Spring Boot | 3.3.5 |
| Language | Java | 17 |
| Web Framework | Spring Web MVC | 3.3.5 |
| ORM | Spring Data JPA + Hibernate | Latest |
| Database | H2 (dev) / PostgreSQL (prod) | - |
| Build Tool | Maven | 3.9.9 |
| Server Port | 8000 | - |
| Context Path | `/api` | - |

---

## Data Model (Entity Relationships)

```
┌──────────────┐
│    User      │
│ - id, name   │
│ - email, pwd │
│ - role       │
└──────┬───────┘
       │ owns
       ▼
┌──────────────────────┐      ┌─────────────────┐
│      Store           │◄────┤  Products       │
│ - id, slug, name     │ has  │ - id, storeId   │
│ - plan, status       │      │ - price, stock  │
│ - colors, social     │      │ - category, img │
│ - logo, banner       │      └────────┬────────┘
└──────┬───────────────┘               │
       │ has                           │ in
       ▼                               ▼
┌──────────────────────┐       ┌──────────────┐
│      Orders          │       │ Order Items  │
│ - id, storeId        │       │ - orderId,   │
│ - customer, amount   │       │   productId  │
│ - status, date       │       │ - qty, price │
│ - trackingNumber     │       └──────────────┘
│ - shippingAddress    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│    Payments          │
│ - id, orderId        │
│ - provider, amount   │
│ - status, signature  │
└──────────────────────┘

┌──────────────────────┐
│     Coupons          │
│ - id, storeId        │
│ - code, discountType │
│ - discountValue, exp │
│ - minOrderAmount     │
└──────────────────────┘
```

---

## Route Architecture

### Public Routes
- `/` - Home page
- `/store/[storeSlug]` - Public storefront
- `/auth/login`, `/auth/signup` - Customer authentication
- `/auth/admin-login` - Admin login

### Protected Routes (Authentication Required)

**Admin Routes** (`/admin/*`) - Require "admin" or "super_admin" role:
- `/admin/products` - Product management (CRUD)
- `/admin/orders` - Order management and tracking
- `/admin/coupons` - Coupon creation and management
- `/admin/settings` - Store configuration
- `/admin/store-settings` - Analytics and branding

**Super-Admin Routes** (`/super-admin/*`) - Require "super_admin" role only:
- `/super-admin/stores` - Platform-wide store management
- `/super-admin/clients` - Store owner management and monitoring

### API Routes
**Base URL**: `http://localhost:8000/api`

#### Authentication Endpoints
```
POST   /auth/login
POST   /auth/signup
POST   /auth/admin/login
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
```

#### Product Endpoints
```
# Public
GET    /stores/{storeSlug}/products              (paginated, filterable)
GET    /stores/{storeSlug}/products/{productSlug}
GET    /stores/{storeSlug}/products/{id}/related
GET    /stores/{storeSlug}/products/featured

# Admin
GET    /admin/stores/{storeId}/products
POST   /admin/stores/{storeId}/products          (multipart form-data)
PUT    /admin/stores/{storeId}/products/{id}
DELETE /admin/stores/{storeId}/products/{id}
```

#### Store Endpoints
```
# Public
GET    /stores/{slug}

# Admin
GET    /admin/store
PUT    /admin/store/settings
PUT    /admin/store/logo                         (multipart)
PUT    /admin/store/banner                       (multipart)

# Analytics & Coupons
GET    /admin/store/analytics?period={7d|30d|90d|1y}
GET    /admin/store/coupons
POST   /admin/store/coupons
PUT    /admin/store/coupons/{couponId}
DELETE /admin/store/coupons/{couponId}
```

#### Order Endpoints
```
# Public
POST   /stores/{storeSlug}/orders
GET    /orders/{orderId}
GET    /orders/my?page={page}&limit={limit}
POST   /stores/{storeSlug}/coupons/verify

# Admin
GET    /admin/stores/{storeId}/orders
PUT    /admin/stores/{storeId}/orders/{id}/status
```

#### Payment Endpoints
```
# Stripe
POST   /stores/{storeSlug}/payments/stripe/intent
POST   /stores/{storeSlug}/payments/stripe/verify

# Razorpay
POST   /stores/{storeSlug}/payments/razorpay/order
POST   /stores/{storeSlug}/payments/razorpay/verify
  ├─ Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
  └─ Returns: { success, orderId, paymentStatus }
```

---

## Key Business Entities

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **User** | Platform user account | `email` (unique), `role` (admin/super_admin/user), `password`, `name`, `avatar` |
| **Store** | Seller's storefront | `slug` (unique), `plan` (free/pro/enterprise), `status`, `ownerId`, `colors`, `logo`, `banner` |
| **Product** | Sellable item | `storeId`, `price`, `discountPrice`, `stock`, `category`, `variants`, `images` |
| **Order** | Customer purchase | `storeId`, `customerId`, `totalAmount`, `status`, `items`, `shippingAddress` |
| **OrderItem** | Line item in order | `orderId`, `productId`, `quantity`, `price` |
| **Coupon** | Discount code | `storeId`, `code`, `discountType` (% or $), `minOrderAmount`, `expiry` |
| **Payment** | Transaction record | `orderId`, `provider` (stripe/razorpay), `amount`, `status`, `signature` |

---

## Authentication & Authorization

### JWT Token Flow

1. **Login**: User provides email/password
2. **Verification**: Backend validates credentials
3. **Token Generation**: Returns `accessToken` (15 min) + `refreshToken` (7 days)
4. **Storage**: Tokens stored in `localStorage` and Zustand store
5. **Request Attachment**: All API calls include `Authorization: Bearer {accessToken}`
6. **Expiry Handling**: Auto-refresh on 401, retry request
7. **Logout**: Clear tokens and redirect to `/auth/login`

### Role-Based Access Control

| Role | Capabilities | Routes |
|------|---|---|
| **user** | Browse stores, create orders, view own orders | `/store/*`, `/orders/my` |
| **admin** | Manage own store (products, orders, coupons, analytics) | `/admin/*` |
| **super_admin** | Manage all stores, clients, platform settings | `/super-admin/*` |

---

## Frontend State Management Architecture

### Zustand Stores

**AuthStore** (`authStore.ts`):
- `user`: Current authenticated user
- `isAuthenticated`: Boolean flag
- `accessToken`, `refreshToken`: JWT tokens
- Methods: `setUser()`, `logout()`
- Persistence: localStorage key `"myebizz-auth"`

**CartStore** (`cartStore.ts`):
- `carts`: Separate cart per storeSlug (Record<storeSlug, CartItem[]>)
- `couponCode`: Applied coupon per store
- `couponDiscount`: Calculated discount
- Methods: `addItem()`, `removeItem()`, `updateQuantity()`, `applyCoupon()`
- Persistence: localStorage

**ProductFilterStore** (`productFilterStore.ts`):
- `selectedCategory`: Active filter
- `searchTerm`: Search query
- Methods: `setCategory()`, `setSearchTerm()`

**StoreSettingsStore** (`storeSettingsStore.ts`):
- Store configuration cache
- Admin store settings

---

## Demo Credentials

```
Admin Account:
  Email: admin@demo.com
  Password: admin123
  Role: admin

Super Admin Account:
  Email: superadmin@demo.com
  Password: super123
  Role: super_admin

Customer Account:
  Email: user@demo.com
  Password: user123
  Role: user

Demo Stores:
  1. Demo Store (slug: "demo")
  2. JohnFit Store (slug: "johnfit")
  3. FashionQueen (slug: "fashionqueen")
```

---

# PHASE 2: USER JOURNEY & FLOW DIAGRAMS

## 1. Customer Purchase Journey

```
START: Customer Arrives at Platform
  │
  ├─→ Browse Store Storefront
  │   └─ GET /stores/{storeSlug}
  │   └─ Display products, categories
  │
  ├─→ Search & Filter Products
  │   └─ Search by name/category
  │   └─ Zustand: productFilterStore
  │
  ├─→ View Product Details
  │   └─ GET /stores/{storeSlug}/products/{productSlug}
  │   └─ Images, variants, reviews
  │
  ├─→ Add to Cart?
  │   ├─ YES: Add Item to Cart
  │   │   └─ Zustand: cartStore.addItem()
  │   │   └─ Stored in localStorage
  │   │
  │   └─ NO: Continue Shopping
  │       └─ Return to browsing
  │
  ├─→ View Cart
  │   └─ GET Cart from Zustand
  │   └─ Display items, total, coupon input
  │
  ├─→ Apply Coupon Code?
  │   ├─ YES: POST /coupons/verify
  │   │   ├─ Validate code, amount, expiry
  │   │   ├─ Calculate discount (% or $)
  │   │   └─ Update Zustand: cartStore.couponDiscount
  │   │
  │   └─ NO: Proceed with full price
  │
  ├─→ Proceed to Checkout?
  │   ├─ YES: Continue
  │   └─ NO: Keep shopping
  │
  ├─→ Enter Shipping Address
  │   └─ Form validation
  │   └─ Save to checkout state
  │
  ├─→ Select Payment Method
  │   ├─ Stripe
  │   │   └─ POST /payments/stripe/intent
  │   │   └─ Get clientSecret
  │   │   └─ Render Stripe Payment Element
  │   │   └─ User enters card
  │   │   └─ stripe.confirmPayment()
  │   │
  │   └─ Razorpay
  │       └─ POST /payments/razorpay/order
  │       └─ Get razorpay_order_id
  │       └─ Load Razorpay SDK
  │       └─ Open checkout modal
  │       └─ User selects payment method (Card/UPI/Wallet)
  │
  ├─→ Payment Processing
  │   └─ Payment gateway processes transaction
  │   └─ Return payment confirmation
  │
  ├─→ Verify Payment Signature
  │   ├─ Stripe: POST /payments/stripe/verify
  │   └─ Razorpay: POST /payments/razorpay/verify
  │   └─ Backend validates HMAC signature
  │
  ├─→ Payment Valid?
  │   ├─ YES: Create Order
  │   │   └─ POST /stores/{storeSlug}/orders
  │   │   ├─ Insert OrderEntity
  │   │   ├─ Insert PaymentEntity
  │   │   ├─ Update ProductEntity stock
  │   │   ├─ Send confirmation email
  │   │   └─ Clear cart (Zustand)
  │   │
  │   └─ NO: Display error
  │       └─ Allow retry payment
  │
  ├─→ Order Confirmation Page
  │   └─ Display order ID, total, delivery estimate
  │   └─ Provide tracking link
  │
  └─→ Track Order
      └─ GET /orders/{orderId}
      └─ Display status, tracking number
      └─ Email notifications for status changes
      
END: Order Complete
```

---

## 2. Admin Store Management Journey

```
START: Admin Logs In
  │
  ├─→ POST /auth/admin/login
  │   └─ Email: admin@demo.com, Password: admin123
  │   └─ Backend validates, returns accessToken + refreshToken
  │
  ├─→ Zustand: setUser() + setAccessToken()
  │   └─ Store tokens in localStorage
  │   └─ Redirect to /admin dashboard
  │
  ├─→ ADMIN DASHBOARD (/admin)
  │   │
  │   ├─→ 1. PRODUCT MANAGEMENT (/admin/products)
  │   │   ├─ View Products List
  │   │   │  └─ GET /admin/stores/{storeId}/products
  │   │   │  └─ Paginated, searchable results
  │   │   │
  │   │   ├─ Create New Product (/admin/products/new)
  │   │   │  └─ Form fields:
  │   │   │     ├─ Name, Description
  │   │   │     ├─ Price, Discount Price
  │   │   │     ├─ Stock Count, SKU
  │   │   │     ├─ Category, Tags
  │   │   │     ├─ Variants (JSON)
  │   │   │     ├─ Images (multipart upload)
  │   │   │     └─ Featured toggle
  │   │   │
  │   │   ├─ POST /admin/stores/{storeId}/products
  │   │   │  └─ Multipart form-data with images
  │   │   │  └─ Max 10MB per file, 20MB total
  │   │   │  └─ Generate slug from name
  │   │   │  └─ Store images URLs in DB
  │   │   │
  │   │   ├─ Edit Product
  │   │   │  └─ PUT /admin/stores/{storeId}/products/{id}
  │   │   │  └─ Update all fields
  │   │   │
  │   │   └─ Delete Product
  │   │      └─ DELETE /admin/stores/{storeId}/products/{id}
  │   │      └─ Soft delete recommended
  │   │
  │   ├─→ 2. ORDER MANAGEMENT (/admin/orders)
  │   │   ├─ View Orders List
  │   │   │  └─ GET /admin/stores/{storeId}/orders
  │   │   │  └─ Paginated, sortable results
  │   │   │
  │   │   ├─ View Order Details
  │   │   │  └─ Order ID, customer name, items, total
  │   │   │  └─ Shipping address, payment method
  │   │   │  └─ Current status: pending/paid/shipped/delivered
  │   │   │
  │   │   ├─ Update Order Status
  │   │   │  └─ PUT /admin/stores/{storeId}/orders/{id}/status
  │   │   │  └─ Status flow: pending → paid → shipped → delivered
  │   │   │
  │   │   └─ Add Tracking Number
  │   │      └─ Update order with courier tracking info
  │   │      └─ Notify customer via email
  │   │
  │   ├─→ 3. COUPON MANAGEMENT (/admin/coupons)
  │   │   ├─ View Coupons List
  │   │   │  └─ GET /admin/store/coupons
  │   │   │  └─ Show code, discount, expiry, used count
  │   │   │
  │   │   ├─ Create Coupon
  │   │   │  └─ POST /admin/store/coupons
  │   │   │  └─ Form fields:
  │   │   │     ├─ Code (e.g., "SAVE10")
  │   │   │     ├─ Discount Type (percentage/fixed)
  │   │   │     ├─ Discount Value
  │   │   │     ├─ Min Order Amount
  │   │   │     ├─ Max Uses
  │   │   │     └─ Expiry Date
  │   │   │
  │   │   ├─ Edit Coupon
  │   │   │  └─ PUT /admin/store/coupons/{couponId}
  │   │   │
  │   │   └─ Delete Coupon
  │   │      └─ DELETE /admin/store/coupons/{couponId}
  │   │
  │   ├─→ 4. STORE SETTINGS (/admin/settings)
  │   │   ├─ Update Store Name/Tagline
  │   │   │  └─ PUT /admin/store/settings
  │   │   │
  │   │   ├─ Update Store Logo
  │   │   │  └─ PUT /admin/store/logo
  │   │   │  └─ Multipart form-data
  │   │   │  └─ Store URL in DB
  │   │   │
  │   │   ├─ Update Store Banner
  │   │   │  └─ PUT /admin/store/banner
  │   │   │  └─ Multipart form-data
  │   │   │
  │   │   └─ Customize Colors & Social Links
  │   │      └─ Primary, Secondary, Accent colors
  │   │      └─ Instagram, Twitter, Facebook, YouTube URLs
  │   │
  │   └─→ 5. ANALYTICS & DASHBOARD (/admin/store-settings)
  │       ├─ View Revenue Metrics
  │       │  └─ GET /admin/store/analytics?period=7d|30d|90d|1y
  │       │  └─ Line chart: Revenue over time
  │       │  └─ Total revenue, order count
  │       │
  │       ├─ Analytics Cards (KPIs)
  │       │  ├─ Total Revenue
  │       │  ├─ Total Orders
  │       │  ├─ Average Order Value
  │       │  └─ Conversion Rate
  │       │
  │       └─ Dashboard Summary
  │           └─ Recent orders
  │           └─ Best sellers
  │           └─ Upcoming expiries (coupons)
  │
  └─→ Logout
      └─ Clear localStorage
      └─ Redirect to /auth/login
      
END: Admin Session Complete
```

---

## 3. Super-Admin Platform Management Journey

```
START: Super-Admin Logs In
  │
  ├─→ POST /auth/admin/login
  │   └─ Email: superadmin@demo.com, Password: super123
  │   └─ Backend validates, detects super_admin role
  │   └─ Returns accessToken + refreshToken
  │
  ├─→ SUPER-ADMIN DASHBOARD (/super-admin)
  │   │
  │   ├─→ 1. STORE MANAGEMENT (/super-admin/stores)
  │   │   ├─ View All Stores List
  │   │   │  └─ GET /super-admin/stores
  │   │   │  └─ Paginated, filterable by status/plan
  │   │   │  └─ Show: name, owner, plan, status, revenue
  │   │   │
  │   │   ├─ Filter Stores
  │   │   │  ├─ By Status: active, suspended, pending
  │   │   │  └─ By Plan: free, pro, enterprise
  │   │   │
  │   │   ├─ View Store Details
  │   │   │  └─ Owner name/email
  │   │   │  └─ Store configuration
  │   │   │  └─ Revenue, order count
  │   │   │  └─ List of products & customers
  │   │   │
  │   │   ├─ Create New Store
  │   │   │  └─ POST /super-admin/stores
  │   │   │  └─ Form: name, slug, owner email, plan
  │   │   │  └─ Assign owner by email or create new user
  │   │   │
  │   │   ├─ Update Store Status
  │   │   │  └─ PUT /super-admin/stores/{id}
  │   │   │  └─ Status transitions:
  │   │   │     ├─ pending → active (approve new store)
  │   │   │     ├─ active → suspended (block store)
  │   │   │     └─ suspended → active (reinstate)
  │   │   │
  │   │   ├─ Upgrade/Downgrade Plan
  │   │   │  └─ PUT /super-admin/stores/{id}/plan
  │   │   │  └─ Plan: free → pro → enterprise
  │   │   │  └─ Update features based on plan
  │   │   │
  │   │   └─ Delete Store
  │   │      └─ DELETE /super-admin/stores/{id}
  │   │      └─ Archive or hard delete (with confirmation)
  │   │
  │   ├─→ 2. CLIENT MANAGEMENT (/super-admin/clients)
  │   │   ├─ View All Store Owners
  │   │   │  └─ GET /super-admin/clients
  │   │   │  └─ Paginated list
  │   │   │  └─ Show: name, email, stores owned, total revenue
  │   │   │
  │   │   ├─ View Client Details
  │   │   │  └─ Email, phone, profile
  │   │   │  └─ Stores owned by this client
  │   │   │  └─ Revenue generated
  │   │   │  └─ Support tickets/messages
  │   │   │
  │   │   ├─ Search & Filter Clients
  │   │   │  └─ By name, email, revenue range
  │   │   │  └─ By join date, activity
  │   │   │
  │   │   └─ Contact Client
  │   │      └─ Send email or in-app message
  │   │      └─ View communication history
  │   │
  │   └─→ 3. PLATFORM ANALYTICS (/super-admin/stats)
  │       ├─ Platform-Wide KPIs
  │       │  └─ GET /super-admin/stats
  │       │  └─ Total revenue (all stores)
  │       │  └─ Total orders (platform-wide)
  │       │  └─ Total users (customers)
  │       │  └─ Total stores (active/all)
  │       │  └─ Payment success rate
  │       │
  │       ├─ Revenue by Provider
  │       │  └─ Stripe vs Razorpay earnings
  │       │  └─ Volume of transactions
  │       │  └─ Fees paid to providers
  │       │
  │       ├─ Store Performance
  │       │  └─ Top 10 stores by revenue
  │       │  └─ New stores this month
  │       │  └─ Stores at risk (low activity)
  │       │
  │       ├─ User Activity
  │       │  └─ New customers per day/week
  │       │  └─ Customer churn rate
  │       │  └─ Repeat customer rate
  │       │
  │       └─ Financial Reports
  │           └─ Revenue by period (monthly)
  │           └─ Commission breakdown
  │           └─ Plan distribution (% free/pro/enterprise)
  │
  └─→ Logout
      └─ Clear tokens
      └─ Redirect to /auth/login
      
END: Super-Admin Session Complete
```

---

## 4. Authentication & Token Refresh Flow

```
User Login Request
  │
  ├─→ POST /auth/login
  │   ├─ Body: { email: "user@example.com", password: "pass123" }
  │   │
  │   └─→ Backend Processing:
  │       ├─ Find user by email in database
  │       ├─ Compare password hash
  │       ├─ Generate accessToken (JWT, 15 min expiry)
  │       ├─ Generate refreshToken (JWT, 7 days expiry)
  │       └─ Return { user, accessToken, refreshToken }
  │
  ├─→ Frontend (Zustand authStore):
  │   ├─ Store accessToken in memory
  │   ├─ Store refreshToken in memory
  │   ├─ Save both to localStorage["myebizz-auth"]
  │   ├─ Set isAuthenticated = true
  │   └─ Save user object
  │
  ├─→ API Client Interceptor:
  │   └─ Attach "Authorization: Bearer {accessToken}" to all requests
  │
  └─→ User Makes API Request
      │
      ├─→ GET /admin/products
      │   ├─ Request includes: Authorization: Bearer {accessToken}
      │   │
      │   └─→ Backend Middleware:
      │       ├─ Extract token from header
      │       ├─ Verify JWT signature
      │       ├─ Check expiry timestamp
      │       │
      │       ├─ Token Valid?
      │       │   ├─ YES: Process request, return 200
      │       │   │
      │       │   └─ NO: Expired or Invalid
      │       │       └─ Return 401 Unauthorized
      │
      ├─→ IF 401 Received:
      │   ├─ API Client catches 401
      │   ├─ Attempt token refresh:
      │   │   └─ POST /auth/refresh
      │   │      └─ Body: { refreshToken }
      │   │
      │   └─→ Refresh Token Processing:
      │       ├─ Validate refreshToken signature
      │       ├─ Check expiry (7 days)
      │       │
      │       ├─ Valid?
      │       │   ├─ YES: 
      │       │   │   ├─ Generate new accessToken
      │       │   │   ├─ Return { accessToken: new }
      │       │   │   ├─ Frontend updates localStorage
      │       │   │   └─ Retry original request with new token
      │       │   │
      │       │   └─ INVALID or EXPIRED:
      │       │       ├─ Clear localStorage
      │       │       ├─ Set isAuthenticated = false
      │       │       ├─ Redirect to /auth/login
      │       │       └─ Force re-login
      │
      └─→ Logout:
          ├─ POST /auth/logout (optional, for server-side cleanup)
          ├─ Frontend clears localStorage
          ├─ Zustand: setUser(null), isAuthenticated = false
          └─ Redirect to /auth/login
```

---

## 5. Payment Processing Flow - Stripe

```
Customer Checkout (Stripe)
  │
  ├─→ Customer clicks "Pay with Stripe"
  │
  ├─→ POST /stores/{storeSlug}/payments/stripe/intent
  │   ├─ Body: { amount: 5999, currency: "USD", orderId: "ORD-123" }
  │   │
  │   └─→ Backend:
  │       ├─ Validate amount & orderId
  │       ├─ Call Stripe API:
  │       │  └─ stripe.paymentIntents.create({
  │       │       amount: 5999,
  │       │       currency: "usd",
  │       │       metadata: { orderId: "ORD-123" }
  │       │     })
  │       │
  │       ├─ Stripe returns: { id, clientSecret, status: "requires_payment_method" }
  │       ├─ Store reference in database
  │       └─ Return { clientSecret, intentId } to frontend
  │
  ├─→ Frontend (Stripe SDK):
  │   ├─ Load @stripe/react-stripe-js
  │   ├─ Initialize Stripe.js with public key
  │   ├─ Create Elements instance
  │   ├─ Mount Payment Element to DOM
  │   └─ Display card input form
  │
  ├─→ User Action:
  │   ├─ Enters card details
  │   ├─ Clicks "Pay Now"
  │   │
  │   └─→ Frontend calls:
  │       └─ stripe.confirmPayment({
  │          elements,
  │          clientSecret,
  │          confirmParams: { return_url: "https://..." }
  │        })
  │
  ├─→ Stripe Processing:
  │   ├─ Tokenize card
  │   ├─ Process transaction with card network
  │   ├─ Return payment status
  │   │
  │   └─→ Response: { status: "succeeded" | "requires_action" | "error" }
  │
  ├─→ Payment Successful?
  │   │
  │   ├─ YES (status: succeeded):
  │   │   └─→ Frontend calls:
  │   │       └─ POST /stores/{storeSlug}/payments/stripe/verify
  │   │          ├─ Body: { intentId, paymentId }
  │   │          │
  │   │          └─→ Backend:
  │   │              ├─ Retrieve PaymentIntent from Stripe
  │   │              ├─ Verify amount matches
  │   │              ├─ Verify status = succeeded
  │   │              ├─ Create PaymentEntity in DB
  │   │              ├─ Update OrderEntity: status = "paid"
  │   │              ├─ Update ProductEntity: stock -= qty
  │   │              ├─ Send confirmation email
  │   │              └─ Return { success: true, orderId }
  │   │
  │   │   └─→ Frontend:
  │   │       ├─ Clear cart from Zustand
  │   │       ├─ Display success message
  │   │       └─ Redirect to /order-confirmation/{orderId}
  │   │
  │   └─ NO (status: failed/error):
  │       └─→ Frontend:
  │           ├─ Display error message
  │           ├─ Suggest retry or different payment method
  │           └─ Stay on payment page
  │
  └─→ Order Status Page:
      └─ GET /orders/{orderId}
      └─ Display confirmation, tracking, receipt
```

---

## 6. Payment Processing Flow - Razorpay

```
Customer Checkout (Razorpay)
  │
  ├─→ Customer clicks "Pay with Razorpay"
  │
  ├─→ POST /stores/{storeSlug}/payments/razorpay/order
  │   ├─ Body: { amount: 599900, orderId: "ORD-123" }
  │   │ Note: Amount in paise (₹5999 = 599900 paise)
  │   │
  │   └─→ Backend:
  │       ├─ Validate amount & orderId
  │       ├─ Call Razorpay API:
  │       │  └─ razorpay.orders.create({
  │       │       amount: 599900,
  │       │       currency: "INR",
  │       │       receipt: "ordId",
  │       │       notes: { orderId: "ORD-123" }
  │       │     })
  │       │
  │       ├─ Razorpay returns: { id, entity, amount, ... }
  │       ├─ Store razorpay_order_id in database
  │       └─ Return { razorpay_order_id } to frontend
  │
  ├─→ Frontend:
  │   ├─ Load Razorpay SDK from CDN
  │   ├─ Prepare Razorpay options:
  │   │   ├─ key: "{RAZORPAY_KEY_ID}"
  │   │   ├─ amount: 599900 (paise)
  │   │   ├─ order_id: "{razorpay_order_id}"
  │   │   ├─ handler: callback function
  │   │   ├─ prefill: { name, email, contact }
  │   │   └─ theme: { color: "#3399cc" }
  │   │
  │   └─ Call: new Razorpay(options).open()
  │
  ├─→ Razorpay Checkout Modal Opens:
  │   ├─ Display payment methods:
  │   │   ├─ Credit/Debit Card
  │   │   ├─ UPI (Google Pay, PhonePe, Paytm, etc.)
  │   │   ├─ Net Banking
  │   │   └─ Wallet
  │   │
  │   └─ User selects method & enters details
  │
  ├─→ Razorpay Processes Payment:
  │   ├─ Contact payment network
  │   ├─ Process transaction
  │   ├─ Return status to modal
  │   └─ Modal triggers callback with response
  │
  ├─→ Modal Callback Triggered:
  │   ├─ Response: {
  │   │   razorpay_order_id: "...",
  │   │   razorpay_payment_id: "...",
  │   │   razorpay_signature: "..."
  │   │ }
  │   │
  │   └─→ POST /stores/{storeSlug}/payments/razorpay/verify
  │       ├─ Body: {
  │       │   razorpayOrderId,
  │       │   razorpayPaymentId,
  │       │   razorpaySignature
  │       │ }
  │       │
  │       └─→ Backend:
  │           ├─ Create signature verification string:
  │           │  └─ "{orderId}|{paymentId}"
  │           │
  │           ├─ Generate HMAC-SHA256 hash:
  │           │  └─ HMAC(key: secret, msg: signature_string)
  │           │
  │           ├─ Compare with received signature
  │           │
  │           ├─ Signature Valid?
  │           │   ├─ YES: Payment genuine
  │           │   │   ├─ Create PaymentEntity in DB
  │           │   │   ├─ Update OrderEntity: status = "paid"
  │           │   │   ├─ Update ProductEntity: stock -= qty
  │           │   │   ├─ Send confirmation email
  │           │   │   └─ Return { success: true, orderId }
  │           │   │
  │           │   └─ NO: Potential fraud attempt
  │           │       └─ Return 400 error
  │           │       └─ Alert admin
  │           │
  │
  ├─→ Frontend (Success):
  │   ├─ Clear cart from Zustand
  │   ├─ Display success message
  │   └─ Redirect to /order-confirmation/{orderId}
  │
  └─→ Order Status Page:
      └─ GET /orders/{orderId}
      └─ Display confirmation, tracking, receipt
```

---

## 7. Coupon Redemption Flow

```
Customer in Cart
  │
  ├─→ Enter Coupon Code
  │   └─ User types code (e.g., "SAVE10")
  │
  ├─→ Click "Apply Coupon"
  │   │
  │   └─→ POST /stores/{storeSlug}/coupons/verify
  │       ├─ Body: { code: "SAVE10", storeSlug: "demo" }
  │       │
  │       └─→ Backend Processing:
  │           ├─ Query CouponEntity where:
  │           │   ├─ code == "SAVE10"
  │           │   ├─ storeId == store_id
  │           │   ├─ isActive == true
  │           │   ├─ expiresAt > now
  │           │   ├─ usedCount < maxUses
  │           │   └─ minOrderAmount <= cartTotal
  │           │
  │           ├─ Coupon Found & Valid?
  │           │   │
  │           │   ├─ YES: Calculate Discount
  │           │   │   ├─ if discountType == "percentage"
  │           │   │   │   └─ discount = cartTotal × (discountValue / 100)
  │           │   │   │
  │           │   │   ├─ else if discountType == "fixed"
  │           │   │   │   └─ discount = discountValue
  │           │   │   │
  │           │   │   └─ Return {
  │           │   │       valid: true,
  │           │   │       code: "SAVE10",
  │           │   │       discount: 999,
  │           │   │       discountType: "percentage",
  │           │   │       finalAmount: cartTotal - discount
  │           │   │     }
  │           │   │
  │           │   └─ NO: Return error
  │           │       ├─ "Coupon not found"
  │           │       ├─ "Coupon expired"
  │           │       ├─ "Max uses reached"
  │           │       ├─ "Minimum order amount not met"
  │           │       └─ HTTP 400
  │           │
  │
  ├─→ Coupon Applied Successfully?
  │   │
  │   ├─ YES:
  │   │   ├─ Zustand cartStore:
  │   │   │   ├─ couponCode = "SAVE10"
  │   │   │   └─ couponDiscount = 999
  │   │   │
  │   │   ├─ Update Cart UI:
  │   │   │   ├─ Show "✓ Coupon Applied"
  │   │   │   ├─ Display discount amount
  │   │   │   └─ Show final total
  │   │   │
  │   │   └─ Allow Checkout with discount
  │   │       └─ Coupon sent in POST /orders
  │   │
  │   └─ NO:
  │       ├─ Display error message to user
  │       └─ Allow retry with different code
  │
  ├─→ Proceed to Checkout
  │   │
  │   └─→ POST /stores/{storeSlug}/orders
  │       ├─ Body: {
  │       │   items: [...],
  │       │   shippingAddress: {...},
  │       │   couponCode: "SAVE10",     ← Included
  │       │   amount: finalAmount
  │       │ }
  │       │
  │       └─→ Backend:
  │           ├─ Create OrderEntity
  │           ├─ Increment CouponEntity.usedCount += 1
  │           ├─ Store coupon info in OrderEntity
  │           └─ Proceed to payment
  │
  └─→ Order Complete
      └─ Confirmation sent with discount details
```

---

# PHASE 3: PAYMENT INTEGRATION ANALYSIS

## Current Payment Architecture Overview

Your application supports **two major payment gateways**:

```
┌──────────────────────────────────────────────────┐
│       Payment Gateway Integration                │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐              ┌──────────────┐ │
│  │   Stripe     │              │  Razorpay    │ │
│  │              │              │              │ │
│  │ Supported:   │              │ Supported:   │ │
│  │ • Cards      │              │ • Cards      │ │
│  │ • 3D Secure  │              │ • UPI        │ │
│  │ • ACH        │              │ • Net Banking│ │
│  │ • Apple Pay  │              │ • Wallet     │ │
│  │ • Google Pay │              │ • Bank Trans │ │
│  └──────────────┘              └──────────────┘ │
│         │                            │           │
│         └────────────┬───────────────┘           │
│                      │                           │
│      ┌───────────────▼────────────────┐          │
│      │  Order Creation & Fulfillment  │          │
│      │   (Payment Complete)           │          │
│      └────────────────────────────────┘          │
│                                                  │
└──────────────────────────────────────────────────┘
```

## 1. Purchase Flow Analysis

### Simple One-Time Purchase

```
┌──────────────────┐
│  Create Order    │
│  - Items: [{...}]│
│  - Shipping Addr │
│  - Total: $59.99 │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│  Process Payment     │
│  - Select gateway    │
│  - Tokenize card     │
│  - Send to processor │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Verify Signature    │
│  - HMAC validation   │
│  - Amount check      │
│  - Status check      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Store Order         │
│  - Status: PAID      │
│  - Payment ID stored │
│  - Stock updated     │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Customer Notified   │
│  - Confirmation mail │
│  - Order tracking    │
└──────────────────────┘
```

### Backend Endpoints

```
POST /stores/{storeSlug}/payments/stripe/intent
  Description: Create Stripe Payment Intent
  Request: {
    amount: 5999,           // Amount in cents/paise
    currency: "USD",        // Currency code
    orderId: "ORD-123"      // Reference
  }
  Response: {
    clientSecret: "pi_123..._secret_456...",
    intentId: "pi_123"
  }

POST /stores/{storeSlug}/payments/stripe/verify
  Description: Verify Stripe Payment
  Request: {
    intentId: "pi_123",
    paymentId: "pay_456"
  }
  Response: {
    success: true,
    orderId: "ORD-123",
    paymentStatus: "completed"
  }

POST /stores/{storeSlug}/payments/razorpay/order
  Description: Create Razorpay Order
  Request: {
    amount: 599900,         // Amount in paise
    orderId: "ORD-123"
  }
  Response: {
    razorpay_order_id: "order_123"
  }

POST /stores/{storeSlug}/payments/razorpay/verify
  Description: Verify Razorpay Payment
  Request: {
    razorpayOrderId: "order_123",
    razorpayPaymentId: "pay_456",
    razorpaySignature: "hash_789"
  }
  Response: {
    success: true,
    orderId: "ORD-123",
    paymentStatus: "completed"
  }
```

### Payment Entity Structure

```java
@Entity
@Table(name = "payments")
public class PaymentEntity {
    @Id
    private String id;
    
    // References
    private String orderId;
    private String storeId;
    
    // Payment Details
    private String provider;        // "stripe" | "razorpay"
    private BigDecimal amount;
    private String currency;        // "USD", "INR", etc.
    
    // Status & Identification
    private String status;          // "pending", "completed", "failed"
    private String paymentId;       // Provider's payment ID
    private String signature;       // Verification signature
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## 2. Subscription Flow (Planned Enhancement)

Currently store plans are **static** ("free", "pro", "enterprise"). Recommended enhancement for recurring billing:

```
Store Owner Selects Upgrade
    │
    ├─→ Choose Plan (Pro/Enterprise)
    │
    ├─→ POST /subscriptions (Create Subscription)
    │   ├─ Body: { storeId, plan: "pro", paymentMethod: "stripe" }
    │
    ├─→ Charge First Month
    │   ├─ Create Payment via Stripe/Razorpay
    │   ├─ Amount based on plan tier
    │
    ├─→ Payment Successful?
    │   ├─ YES: Activate Subscription
    │   │   ├─ Set store.plan = "pro"
    │   │   ├─ Set store.status = "active"
    │   │   ├─ Enable pro features
    │   │   └─ Send activation email
    │   │
    │   └─ NO: Show error, retry payment
    │
    ├─→ Setup Recurring Billing
    │   ├─ Stripe: Create recurring charge
    │   ├─ Razorpay: Setup token for recurring
    │   ├─ Schedule monthly renewal
    │
    └─→ Dashboard Shows Subscription Status
        ├─ Current plan: Pro
        ├─ Renewal date: June 30
        ├─ Amount: $29/month
        └─ Cancel/Upgrade options
```

### Recommended Subscription Entity

```java
@Entity
@Table(name = "subscriptions")
public class SubscriptionEntity {
    @Id
    private String id;
    
    // Store Reference
    private String storeId;
    
    // Plan Details
    private String plan;              // "free" | "pro" | "enterprise"
    private BigDecimal monthlyPrice;
    private String currency;          // "USD", "INR"
    
    // Provider Reference
    private String provider;          // "stripe" | "razorpay"
    private String subscriptionId;    // Provider's subscription ID
    
    // Status & Dates
    private String status;            // "active", "paused", "cancelled"
    private LocalDateTime startDate;
    private LocalDateTime renewalDate;
    private LocalDateTime cancelledAt;
    
    // Billing Info
    private Integer cycleNumber;      // Which billing cycle
    private BigDecimal paidAmount;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## 3. Order Flow Architecture

```
ORDER LIFECYCLE
┌─────────────────────────────────────────┐
│         PENDING                         │
│   (Order created, awaiting payment)    │
└──────────────┬──────────────────────────┘
               │
               │ Payment Verified
               │
        ┌──────▼──────┐
        │    PAID     │
        │ (Payment OK)│
        └──────┬──────┘
               │
               │ Admin Ships
               │
        ┌──────▼─────────┐
        │    SHIPPED     │
        │ (Tracking added)
        └──────┬─────────┘
               │
               │ Delivery Confirmed
               │
        ┌──────▼──────────┐
        │   DELIVERED    │
        │ (Order complete)│
        └────────────────┘

ALTERNATIVE PATHS:
┌──────────┐
│ CANCELLED│ ← Payment failed, user cancelled
└──────────┘

┌────────────┐
│  REFUNDED  │ ← Payment refunded to customer
└────────────┘
```

### Order Entity Details

```java
@Entity
@Table(name = "orders")
public class OrderEntity {
    @Id
    private String id;              // "ORD-20260531-001"
    
    // References
    private String storeId;
    private String storeSlug;
    
    // Customer Information
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    // Order Details
    private BigDecimal amount;
    private BigDecimal discountAmount;  // If coupon applied
    private BigDecimal finalAmount;
    private String currency;           // "USD", "INR"
    
    // Status
    private String status;             // "pending", "paid", "shipped",
                                       // "delivered", "cancelled"
    
    // Items (stored as JSON)
    private String itemsJson;          // [{productId, qty, price}...]
    
    // Coupon Information
    private String couponCode;         // If applied
    private BigDecimal couponDiscount;
    
    // Shipping Details
    private String shippingAddressJson;// {fullName, email, phone, ...}
    private String trackingNumber;     // Courier tracking
    private String paymentMethod;      // "stripe" | "razorpay"
    
    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
}
```

### Order Creation Request

```typescript
POST /stores/{storeSlug}/orders

Request Body: {
  items: [
    {
      productId: "prod_123",
      quantity: 2,
      price: 29.99
    },
    {
      productId: "prod_456",
      quantity: 1,
      price: 49.99
    }
  ],
  
  shippingAddress: {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States"
  },
  
  couponCode: "SAVE10",     // Optional
  paymentMethod: "stripe",  // "stripe" | "razorpay"
  amount: 109.97,
  currency: "USD"
}

Response: {
  orderId: "ORD-20260531-001",
  status: "pending",
  totalAmount: 109.97,
  discountApplied: 11,
  finalAmount: 98.97
}
```

## 4. Transaction & Invoice Entities

### Invoice Entity (Recommended)

```java
@Entity
@Table(name = "invoices")
public class InvoiceEntity {
    @Id
    private String id;              // "INV-2026-0001"
    
    // Links
    private String orderId;         // FK: orders.id
    private String storeId;
    
    // Amounts
    private BigDecimal subtotal;    // Before discount/tax
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;   // If applicable
    private BigDecimal totalAmount;
    
    // Status
    private String status;          // "draft", "sent", "paid", "overdue"
    
    // Dates
    private LocalDateTime issuedAt;
    private LocalDateTime dueDate;
    private LocalDateTime paidAt;
    
    // Document Storage
    private String invoicePdfUrl;   // S3/Cloudinary URL
    
    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Transaction Entity (Recommended)

```java
@Entity
@Table(name = "transactions")
public class TransactionEntity {
    @Id
    private String id;
    
    // Linking
    private String orderId;
    private String paymentId;      // FK: payments.id
    private String storeId;
    
    // Transaction Data
    private String type;           // "payment", "refund", "reversal"
    private BigDecimal amount;
    private String currency;
    
    // Status
    private String status;         // "completed", "pending", "failed"
    
    // Provider Info
    private String provider;       // "stripe", "razorpay"
    private String providerTransactionId;
    
    // Details
    private String description;
    
    // Audit
    private LocalDateTime createdAt;
}
```

## 5. Refund Flow

```
Customer Requests Refund
  │
  ├─→ Go to Order Details
  │   └─ Click "Request Refund"
  │
  ├─→ Submit Refund Request
  │   └─ POST /orders/{orderId}/refunds
  │   └─ Reason: "damaged" | "lost" | "changed_mind"
  │
  ├─→ Admin Reviews Request
  │   ├─ Email notification
  │   └─ Approve/Reject in dashboard
  │
  ├─→ Admin Approves?
  │   │
  │   ├─ YES: Process Refund
  │   │   ├─ POST /refunds
  │   │   ├─ Call Payment Provider API
  │   │   │  ├─ Stripe: stripe.refunds.create({paymentIntentId})
  │   │   │  └─ Razorpay: razorpay.refunds.create({paymentId})
  │   │   │
  │   │   ├─ Create RefundEntity
  │   │   ├─ Update OrderEntity: status = "refunded"
  │   │   ├─ Update PaymentEntity: refund_status = "completed"
  │   │   └─ Send confirmation email
  │   │
  │   └─ NO: Reject Refund
  │       └─ Notify customer with reason
  │
  └─→ Refund Processed
      ├─ Customer receives refund in 3-5 business days
      └─ Order marked as refunded
```

### Refund Entity (Recommended)

```java
@Entity
@Table(name = "refunds")
public class RefundEntity {
    @Id
    private String id;
    
    // References
    private String orderId;
    private String paymentId;
    
    // Refund Details
    private BigDecimal refundAmount;
    private String currency;
    
    // Reason & Status
    private String reason;         // "damaged", "lost", "changed_mind"
    private String status;         // "pending", "completed", "failed"
    
    // Provider
    private String provider;       // "stripe", "razorpay"
    private String providerRefundId;
    
    // Dates
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private LocalDateTime refundedAt;
}
```

## 6. Payment Reconciliation & Webhooks

### Current Limitation
Your application **does not currently implement webhook handling**. Payment verification is done synchronously after customer completes payment.

### Recommended Webhook Events

**Stripe Webhooks to Implement**:
```
✓ payment_intent.succeeded
  └─ Action: Mark order as paid, update inventory

✓ payment_intent.payment_failed
  └─ Action: Mark order as failed, notify customer

✓ charge.refunded
  └─ Action: Process refund, update refund entity

✓ charge.dispute.created
  └─ Action: Alert admin of chargeback
```

**Razorpay Webhooks to Implement**:
```
✓ payment.authorized
  └─ Action: Capture payment

✓ payment.failed
  └─ Action: Mark payment as failed

✓ payment.captured
  └─ Action: Mark order as paid

✓ refund.processed
  └─ Action: Update refund status
```

### Webhook Handler Entity (Recommended)

```java
@Entity
@Table(name = "webhook_logs")
public class WebhookLogEntity {
    @Id
    private String id;
    
    private String provider;       // "stripe", "razorpay"
    private String event;          // "payment.succeeded", etc.
    
    private String payloadJson;    // Full webhook payload
    private String signature;      // For verification
    
    private Boolean isProcessed;
    private String processingStatus; // "success", "failed", "pending"
    private String errorMessage;
    
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
```

### Webhook Verification Example

```java
// Stripe Webhook Verification
public boolean verifyStripeWebhook(String payload, String signature) {
    String computedSignature = Hmac.computeHmacSha256(
        payload,
        stripeWebhookSecret
    );
    return signature.equals(computedSignature);
}

// Razorpay Webhook Verification
public boolean verifyRazorpayWebhook(
    String orderId,
    String paymentId,
    String signature
) {
    String verificationString = orderId + "|" + paymentId;
    String computedSignature = Hmac.computeHmacSha256(
        verificationString,
        razorpaySecret
    );
    return signature.equals(computedSignature);
}
```

## 7. Analytics & Reporting

### Current Implementation
- `GET /admin/store/analytics?period=7d|30d|90d|1y`
- Basic revenue metrics only

### Recommended Enhancements

**Revenue by Payment Gateway**:
```
GET /admin/stores/{storeId}/analytics/payments

Response: {
  byProvider: {
    stripe: {
      count: 125,
      amount: 12500.00,
      currency: "USD",
      successRate: 98.5%,
      averageAmount: 100.00
    },
    razorpay: {
      count: 342,
      amount: 34200.00,
      currency: "INR",
      successRate: 96.2%,
      averageAmount: 100.00
    }
  },
  totalTransactions: 467,
  totalAmount: 46700.00
}
```

**Conversion Funnel**:
```
GET /admin/stores/{storeId}/analytics/funnel

Response: {
  visitorsCount: 10000,
  addToCartCount: 1250,        // 12.5%
  checkoutStartedCount: 850,    // 8.5%
  checkoutCompletedCount: 500,  // 5.0%
  paymentAttemptedCount: 490,   // 4.9%
  paymentCompletedCount: 467,   // 4.67% = Conversion Rate
  
  dropoffAnalysis: {
    cartToCheckout: "32%",
    checkoutToPayment: "8%",
    paymentFailure: "4.7%"
  }
}
```

**Payment Failure Analysis**:
```
GET /admin/stores/{storeId}/analytics/payment-failures

Response: {
  periodStartDate: "2026-05-01",
  periodEndDate: "2026-05-31",
  totalAttempts: 490,
  failedAttempts: 23,
  failureRate: "4.7%",
  
  topFailureReasons: [
    { reason: "insufficient_funds", count: 8, percentage: "34.8%" },
    { reason: "lost_card", count: 6, percentage: "26.1%" },
    { reason: "expired_card", count: 4, percentage: "17.4%" },
    { reason: "network_error", count: 3, percentage: "13.0%" },
    { reason: "fraudulent", count: 2, percentage: "8.7%" }
  ]
}
```

**Customer Metrics**:
```
GET /admin/stores/{storeId}/analytics/customers

Response: {
  totalCustomers: 4500,
  newCustomersThisMonth: 850,
  repeatCustomers: 1250,
  repeatCustomerRate: "27.8%",
  
  orderMetrics: {
    totalOrders: 5200,
    averageOrderValue: 89.50,
    medianOrderValue: 65.00,
    maxOrderValue: 1200.00
  },
  
  customerLifetimeValue: 98.70,
  customerAcquisitionCost: 12.50,
  orderFrequency: 1.16  // Orders per customer
}
```

## 8. Security Considerations

| Aspect | Current Status | Recommendation |
|--------|---|---|
| **PCI Compliance** | ✅ Via provider SDKs (no card data on server) | Continue using provider tokens |
| **SSL/TLS** | Assumed HTTPS in production | Enforce in `next.config.ts` |
| **CORS** | Check Spring Boot config | Whitelist frontend domain only |
| **JWT Validation** | ✅ Implemented | Maintain strong secret keys |
| **Webhook Signature Verification** | ❌ Not implemented | Add HMAC-SHA256 validation |
| **Rate Limiting** | ❌ Missing | Add to payment endpoints (10 req/min) |
| **Idempotency Keys** | ❌ Missing | Add for Stripe payment requests |
| **Encryption at Rest** | ❌ Not visible | Encrypt sensitive data (SSN, tokens) |
| **Sensitive Data Logging** | ⚠️ Verify | Never log card numbers or full tokens |

---

## 9. Implementation Roadmap

### Phase 1 (Months 1-3): Foundation
- [ ] Webhook handler setup (Stripe & Razorpay)
- [ ] Refund flow implementation
- [ ] Payment reconciliation system
- [ ] Rate limiting on payment endpoints

### Phase 2 (Months 3-6): Analytics & Transparency
- [ ] Invoice generation system
- [ ] Transaction history UI
- [ ] Payment analytics dashboard
- [ ] Customer retention metrics

### Phase 3 (Months 6-12): Advanced Features
- [ ] Subscription billing system
- [ ] Automated recurring payments
- [ ] Dunning management (failed charge recovery)
- [ ] Payment method tokenization
- [ ] Partial refunds support

---

# KEY FINDINGS & RECOMMENDATIONS

## Strengths ✅

1. **Dual Payment Gateway Support** - Flexibility between Stripe (USD/global) and Razorpay (INR/India)
2. **Multi-Tenant Architecture** - Fully isolated storefronts with custom branding
3. **Role-Based Access Control** - Clear separation of admin/super_admin/user capabilities
4. **Modern Tech Stack** - Latest React, Next.js, Spring Boot with industry-standard libraries
5. **JWT Authentication** - Secure token-based auth with refresh token rotation
6. **Zustand State Management** - Lightweight, persistent state for cart and auth

## Critical Gaps ⚠️

1. **No Webhook Handling** - Relies on synchronous verification only
2. **No Refund System** - Payment capture without return flow
3. **No Invoice Generation** - Missing formal billing documents
4. **No Subscription Billing** - Plans are static, no recurring charges
5. **Limited Payment Analytics** - Basic KPIs only
6. **No Transaction Audit Trail** - Transactions not queryable
7. **Missing Rate Limiting** - Payment endpoints vulnerable to abuse
8. **No Payment Dispute Handling** - Chargebacks not tracked

## Priority Recommendations 🎯

### Immediate (Sprint 1-2)
1. Implement webhook endpoints for both gateways
2. Add rate limiting to payment endpoints
3. Create transaction audit logging
4. Document webhook signature verification process

### Short-term (Q2 2026)
1. Implement refund flow with admin approval
2. Generate invoices automatically for orders
3. Build payment-specific analytics dashboard
4. Add payment failure retry logic

### Medium-term (Q3-Q4 2026)
1. Implement subscription billing system
2. Add automated recurring payments
3. Create customer lifecycle analytics
4. Implement payment method tokenization

## Security Hardening

1. **Webhook Verification**
   - Validate all webhook signatures
   - Implement idempotency checks
   - Log all webhook events

2. **Rate Limiting**
   - Payment endpoints: 10 requests/minute per user
   - Auth endpoints: 5 requests/minute per IP
   - Implement exponential backoff

3. **Data Protection**
   - Encrypt sensitive fields at rest
   - Never log full card numbers
   - Implement field-level encryption for SSN

4. **Monitoring**
   - Alert on payment failure spikes
   - Monitor refund patterns
   - Track webhook delivery failures

---

## Document Generation Info

**Generated**: May 31, 2026  
**Version**: 1.0  
**Status**: Complete Analysis  
**Scope**: Full system architecture and payment integration

This document provides a comprehensive blueprint for understanding, maintaining, and extending the MyEbizz e-commerce platform.
