# Myebizz Java Backend (Scaffold)

Spring Boot backend scaffold with in-memory demo data for your existing frontend integration work.

## What This Project Is

- A separate backend project in `backend-java`
- Java 17 + Spring Boot 3
- Runs on `http://localhost:8000/api`
- Contains all key endpoints your frontend currently needs
- Uses in-memory data (no database yet)

## Run

1. Open terminal in `backend-java`
2. Run:

```bash
mvn spring-boot:run
```

Health check:

- `GET http://localhost:8000/api/health`

## Frontend Config

Set frontend env to:

- `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

## Endpoints Implemented

### Auth

- `POST /auth/login`
- `POST /auth/admin/login`
- `POST /auth/signup`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Public Store + Products + Checkout

- `GET /stores/{storeSlug}`
- `GET /stores/{storeSlug}/products`
- `GET /stores/{storeSlug}/products/featured`
- `GET /stores/{storeSlug}/products/{productSlug}`
- `GET /stores/{storeSlug}/products/{productId}/related`
- `POST /stores/{storeSlug}/orders`
- `POST /stores/{storeSlug}/coupons/verify`
- `POST /stores/{storeSlug}/payments/stripe/intent`
- `POST /stores/{storeSlug}/payments/razorpay/order`

### Orders

- `GET /orders/{orderId}`
- `GET /orders/my?page=1&limit=10`

### Admin

- `GET /admin/store`
- `PUT /admin/store/settings`
- `PUT /admin/store/logo` (multipart)
- `PUT /admin/store/banner` (multipart)
- `GET /admin/store/analytics?period=30d`
- `GET /admin/store/coupons`
- `POST /admin/store/coupons`
- `PUT /admin/store/coupons/{couponId}`
- `DELETE /admin/store/coupons/{couponId}`
- `GET /admin/stores/{storeId}/products`
- `POST /admin/stores/{storeId}/products` (multipart)
- `PUT /admin/stores/{storeId}/products/{productId}` (multipart)
- `DELETE /admin/stores/{storeId}/products/{productId}`
- `GET /admin/stores/{storeId}/orders`
- `PUT /admin/stores/{storeId}/orders/{orderId}/status`

### Super Admin

- `GET /super-admin/stats`
- `GET /super-admin/stores`
- `POST /super-admin/stores`
- `PUT /super-admin/stores/{storeId}/status`
- `DELETE /super-admin/stores/{storeId}`
- `GET /super-admin/clients`

## Notes

- This intentionally does not modify your frontend mock data yet.
- Response envelope is `{"success": true, "message": "...", "data": ...}` for most endpoints.
- `/auth/login` also returns top-level `user`, `accessToken`, and `refreshToken` for compatibility with your NextAuth credentials flow.

## Suggested Next Step

- Add a real database layer (PostgreSQL + JPA) and replace in-memory service methods incrementally.
