package com.myebizz.backend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class DemoDataService {

    private final Map<String, Map<String, Object>> usersByEmail = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> storesBySlug = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> productsByStoreSlug = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ordersByStoreSlug = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> couponsByStoreId = new ConcurrentHashMap<>();

    private final AtomicLong productIdSeq = new AtomicLong(5000);
    private final AtomicLong orderIdSeq = new AtomicLong(1000);
    private final AtomicLong storeIdSeq = new AtomicLong(50);

    public DemoDataService() {
        seedUsers();
        seedStores();
        seedProducts();
        seedOrders();
        seedCoupons();
    }

    private void seedUsers() {
        usersByEmail.put("admin@demo.com", makeUser("1", "Admin User", "admin@demo.com", "admin", "admin123"));
        usersByEmail.put("superadmin@demo.com", makeUser("2", "Super Admin", "superadmin@demo.com", "super_admin", "super123"));
        usersByEmail.put("user@demo.com", makeUser("3", "Demo User", "user@demo.com", "user", "user123"));
    }

    private Map<String, Object> makeUser(String id, String name, String email, String role, String password) {
        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", id);
        user.put("name", name);
        user.put("email", email);
        user.put("role", role);
        user.put("avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200");
        user.put("password", password);
        return user;
    }

    private void seedStores() {
        addStore(seedStore("1", "demo", "Demo Store", "Creator", "active", "pro", 248));
        addStore(seedStore("2", "johnfit", "JohnFit Store", "John Fitness", "active", "pro", 1248));
        addStore(seedStore("3", "fashionqueen", "FashionQueen", "Priya Style", "active", "enterprise", 892));
    }

    private Map<String, Object> seedStore(String id, String slug, String name, String owner, String status, String plan, int orders) {
        String now = Instant.now().toString();
        Map<String, Object> store = new LinkedHashMap<>();
        store.put("id", id);
        store.put("slug", slug);
        store.put("name", name);
        store.put("tagline", "Premium merch for your fans");
        store.put("description", "Official merchandise store for " + owner + ".");
        store.put("logoUrl", null);
        store.put("bannerUrl", "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600");
        store.put("primaryColor", "#E1306C");
        store.put("secondaryColor", "#f1f5f9");
        store.put("accentColor", "#0ea5e9");
        store.put("ownerId", "owner-" + id);
        store.put("ownerName", owner);
        store.put("ownerAvatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200");
        store.put("instagramHandle", slug);
        store.put("twitterHandle", slug);
        store.put("facebookHandle", slug + "Official");
        store.put("youtubeHandle", slug + "TV");
        store.put("status", status);
        store.put("plan", plan);
        store.put("currency", "INR");
        store.put("country", "IN");
        store.put("orders", orders);
        store.put("createdAt", now);
        store.put("updatedAt", now);
        return store;
    }

    private void addStore(Map<String, Object> store) {
        storesBySlug.put(String.valueOf(store.get("slug")), store);
        productsByStoreSlug.putIfAbsent(String.valueOf(store.get("slug")), new ArrayList<>());
        ordersByStoreSlug.putIfAbsent(String.valueOf(store.get("slug")), new ArrayList<>());
        couponsByStoreId.putIfAbsent(String.valueOf(store.get("id")), new ArrayList<>());
    }

    private void seedProducts() {
        addProduct("demo", seedProduct("101", "premium-graphic-tee", "Premium Graphic Tee", "T-Shirts", 1299.0, 999.0, true));
        addProduct("demo", seedProduct("102", "signature-hoodie", "Signature Hoodie", "Hoodies", 2499.0, null, true));
        addProduct("demo", seedProduct("103", "creator-cap", "Creator Cap", "Caps", 799.0, 599.0, false));

        addProduct("johnfit", seedProduct("201", "muscle-tee", "Muscle Tee", "Tops", 899.0, null, true));
        addProduct("johnfit", seedProduct("202", "gym-shorts", "Gym Shorts", "Bottoms", 1099.0, 899.0, true));

        addProduct("fashionqueen", seedProduct("301", "summer-dress", "Summer Dress", "Dresses", 1899.0, 1499.0, true));
        addProduct("fashionqueen", seedProduct("302", "retro-top", "Retro Top", "Tops", 999.0, null, false));
    }

    private Map<String, Object> seedProduct(String id, String slug, String name, String category, Double price, Double discountPrice, boolean featured) {
        String now = Instant.now().toString();
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("id", id);
        p.put("storeId", "1");
        p.put("name", name);
        p.put("slug", slug);
        p.put("description", name + " description");
        p.put("shortDescription", "Premium quality product");
        p.put("price", price);
        p.put("discountPrice", discountPrice);
        p.put("discountPercent", discountPrice == null ? 0 : Math.round((1 - (discountPrice / price)) * 100));
        p.put("images", List.of(Map.of(
                "id", id + "-img-1",
                "url", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
                "altText", name,
                "isPrimary", true,
                "sortOrder", 0
        )));
        p.put("category", category);
        p.put("tags", List.of("trending"));
        p.put("variants", List.of());
        p.put("stockCount", 25);
        p.put("sku", "SKU-" + id);
        p.put("isFeatured", featured);
        p.put("isPublished", true);
        p.put("rating", 4.5);
        p.put("reviewCount", 25);
        p.put("soldCount", 100);
        p.put("createdAt", now);
        p.put("updatedAt", now);
        return p;
    }

    private void addProduct(String storeSlug, Map<String, Object> product) {
        productsByStoreSlug.computeIfAbsent(storeSlug, k -> new ArrayList<>()).add(product);
    }

    private void seedOrders() {
        addOrder("demo", seedOrder("ORD-001", "Priya Sharma", 1499.0, "processing", 2));
        addOrder("demo", seedOrder("ORD-002", "Rahul Verma", 2999.0, "shipped", 3));
        addOrder("johnfit", seedOrder("ORD-003", "Ankit Rao", 1899.0, "pending", 1));
    }

    private Map<String, Object> seedOrder(String id, String customer, Double amount, String status, int items) {
        String now = Instant.now().toString();
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("id", id);
        o.put("customer", customer);
        o.put("amount", amount);
        o.put("status", status);
        o.put("orderStatus", status);
        o.put("items", items);
        o.put("date", now);
        o.put("createdAt", now);
        o.put("updatedAt", now);
        o.put("trackingNumber", "TRK" + Math.abs(id.hashCode()));
        return o;
    }

    private void addOrder(String storeSlug, Map<String, Object> order) {
        ordersByStoreSlug.computeIfAbsent(storeSlug, k -> new ArrayList<>()).add(order);
    }

    private void seedCoupons() {
        List<Map<String, Object>> demoCoupons = couponsByStoreId.computeIfAbsent("1", k -> new ArrayList<>());
        demoCoupons.add(makeCoupon("C1", "SAVE20", "percentage", 20.0, 500.0, 500, true, LocalDate.now().plusMonths(3).toString()));
        demoCoupons.add(makeCoupon("C2", "FLAT100", "fixed", 100.0, 999.0, 200, true, LocalDate.now().plusMonths(1).toString()));
    }

    private Map<String, Object> makeCoupon(String id, String code, String type, Double value, Double minOrderAmount, int maxUses, boolean active, String expiresAt) {
        Map<String, Object> c = new LinkedHashMap<>();
        c.put("id", id);
        c.put("storeId", "1");
        c.put("code", code);
        c.put("discountType", type);
        c.put("discountValue", value);
        c.put("minOrderAmount", minOrderAmount);
        c.put("maxUses", maxUses);
        c.put("usedCount", 0);
        c.put("isActive", active);
        c.put("expiresAt", expiresAt);
        c.put("createdAt", Instant.now().toString());
        return c;
    }

    public Optional<Map<String, Object>> authenticate(String email, String password, boolean adminOnly) {
        Map<String, Object> user = usersByEmail.get(email.toLowerCase(Locale.ROOT));
        if (user == null) {
            return Optional.empty();
        }
        String storedPassword = String.valueOf(user.get("password"));
        if (!Objects.equals(storedPassword, password)) {
            return Optional.empty();
        }
        String role = String.valueOf(user.get("role"));
        if (adminOnly && !("admin".equals(role) || "super_admin".equals(role))) {
            return Optional.empty();
        }

        Map<String, Object> userPayload = new LinkedHashMap<>();
        userPayload.put("id", user.get("id"));
        userPayload.put("name", user.get("name"));
        userPayload.put("email", user.get("email"));
        userPayload.put("role", role);
        userPayload.put("avatar", user.get("avatar"));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user", userPayload);
        payload.put("accessToken", "access-" + UUID.randomUUID());
        payload.put("refreshToken", "refresh-" + UUID.randomUUID());
        return Optional.of(payload);
    }

    public Map<String, Object> signup(String name, String email, String password) {
        String normalized = email.toLowerCase(Locale.ROOT);
        if (usersByEmail.containsKey(normalized)) {
            throw new IllegalArgumentException("Email already exists");
        }
        String id = String.valueOf(usersByEmail.size() + 1);
        Map<String, Object> user = makeUser(id, name, normalized, "user", password);
        usersByEmail.put(normalized, user);

        Map<String, Object> authPayload = authenticate(normalized, password, false).orElseThrow();
        Map<String, Object> userPayload = new LinkedHashMap<>((Map<String, Object>) authPayload.get("user"));
        userPayload.put("accessToken", authPayload.get("accessToken"));
        userPayload.put("refreshToken", authPayload.get("refreshToken"));
        return userPayload;
    }

    public Map<String, Object> getStoreBySlug(String slug) {
        Map<String, Object> store = storesBySlug.get(slug);
        if (store == null) {
            throw new IllegalArgumentException("Store not found");
        }
        return new LinkedHashMap<>(store);
    }

    public Map<String, Object> getAdminStore() {
        return new LinkedHashMap<>(storesBySlug.get("demo"));
    }

    public Map<String, Object> updateAdminStoreSettings(Map<String, Object> updates) {
        Map<String, Object> store = storesBySlug.get("demo");
        store.putAll(updates);
        store.put("updatedAt", Instant.now().toString());
        return new LinkedHashMap<>(store);
    }

    public Map<String, Object> adminAnalytics(String period) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("period", period);
        metrics.put("totalRevenue", 284500.0);
        metrics.put("totalOrders", 1248);
        metrics.put("totalProducts", productsByStoreSlug.getOrDefault("demo", List.of()).size());
        metrics.put("customers", 3421);
        metrics.put("growth", Map.of("revenue", 18.2, "orders", 12.5, "products", 4.3, "customers", 22.1));
        return metrics;
    }

    public List<Map<String, Object>> getAdminCoupons() {
        return new ArrayList<>(couponsByStoreId.getOrDefault("1", List.of()));
    }

    public Map<String, Object> createAdminCoupon(Map<String, Object> body) {
        String id = "C" + Math.abs(UUID.randomUUID().hashCode());
        Map<String, Object> coupon = makeCoupon(
                id,
                String.valueOf(body.getOrDefault("code", "NEWCODE")).toUpperCase(Locale.ROOT),
                String.valueOf(body.getOrDefault("discountType", "percentage")),
                toDouble(body.getOrDefault("discountValue", 10)),
                toDouble(body.getOrDefault("minOrderAmount", 0)),
                (int) toDouble(body.getOrDefault("maxUses", 500)),
                Boolean.parseBoolean(String.valueOf(body.getOrDefault("isActive", true))),
                String.valueOf(body.getOrDefault("expiresAt", LocalDate.now().plusMonths(1)))
        );
        couponsByStoreId.computeIfAbsent("1", k -> new ArrayList<>()).add(0, coupon);
        return coupon;
    }

    public Map<String, Object> updateAdminCoupon(String couponId, Map<String, Object> updates) {
        List<Map<String, Object>> coupons = couponsByStoreId.getOrDefault("1", new ArrayList<>());
        for (Map<String, Object> coupon : coupons) {
            if (Objects.equals(String.valueOf(coupon.get("id")), couponId)) {
                coupon.putAll(updates);
                return new LinkedHashMap<>(coupon);
            }
        }
        throw new IllegalArgumentException("Coupon not found");
    }

    public void deleteAdminCoupon(String couponId) {
        List<Map<String, Object>> coupons = couponsByStoreId.getOrDefault("1", new ArrayList<>());
        coupons.removeIf(c -> Objects.equals(String.valueOf(c.get("id")), couponId));
    }

    public Map<String, Object> superAdminStats() {
        int storeCount = storesBySlug.size();
        int totalOrders = ordersByStoreSlug.values().stream().mapToInt(List::size).sum();
        int totalCustomers = 42891;
        double totalRevenue = 12000000.0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("activeStores", storeCount);
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalOrders", totalOrders);
        stats.put("growth", Map.of("revenue", 24.5, "stores", 18.3, "customers", 31.7, "orders", 15.2));
        return stats;
    }

    public Map<String, Object> superAdminStores(int page, int limit, String status, String plan) {
        List<Map<String, Object>> stores = new ArrayList<>(storesBySlug.values());
        stores.sort(Comparator.comparing(s -> String.valueOf(s.get("slug"))));

        List<Map<String, Object>> filtered = stores.stream()
                .filter(s -> status == null || status.isBlank() || Objects.equals(String.valueOf(s.get("status")), status))
                .filter(s -> plan == null || plan.isBlank() || Objects.equals(String.valueOf(s.get("plan")), plan))
                .toList();

        int from = Math.max(0, (page - 1) * limit);
        int to = Math.min(filtered.size(), from + limit);
        List<Map<String, Object>> items = from >= filtered.size() ? List.of() : filtered.subList(from, to);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", items);
        response.put("page", page);
        response.put("limit", limit);
        response.put("total", filtered.size());
        response.put("totalPages", (int) Math.ceil(filtered.size() / (double) limit));
        return response;
    }

    public Map<String, Object> superAdminCreateStore(Map<String, Object> body) {
        String id = String.valueOf(storeIdSeq.incrementAndGet());
        String slug = String.valueOf(body.getOrDefault("storeSlug", "store-" + id)).toLowerCase(Locale.ROOT);
        Map<String, Object> store = seedStore(
                id,
                slug,
                String.valueOf(body.getOrDefault("storeName", "Store " + id)),
                String.valueOf(body.getOrDefault("ownerName", "Owner " + id)),
                "active",
                "starter",
                0
        );
        addStore(store);
        return store;
    }

    public Map<String, Object> superAdminClients(int page, int limit) {
        List<Map<String, Object>> clients = new ArrayList<>();
        int index = 1;
        for (Map<String, Object> store : storesBySlug.values()) {
            Map<String, Object> client = new LinkedHashMap<>();
            String slug = String.valueOf(store.get("slug"));
            client.put("id", "client-" + index);
            client.put("name", String.valueOf(store.get("ownerName")));
            client.put("email", "client" + index + "@example.com");
            client.put("store", slug);
            client.put("plan", String.valueOf(store.get("plan")));
            client.put("status", String.valueOf(store.get("status")).equals("active") ? "active" : "inactive");
            client.put("joinedAt", Instant.now().minusSeconds(index * 86400L).toString());
            clients.add(client);
            index++;
        }

        int from = Math.max(0, (page - 1) * limit);
        int to = Math.min(clients.size(), from + limit);
        List<Map<String, Object>> items = from >= clients.size() ? List.of() : clients.subList(from, to);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("limit", limit);
        result.put("total", clients.size());
        result.put("totalPages", (int) Math.ceil(clients.size() / (double) limit));
        return result;
    }

    public Map<String, Object> superAdminUpdateStoreStatus(String storeId, String status) {
        Map<String, Object> store = findStoreById(storeId);
        store.put("status", status);
        store.put("updatedAt", Instant.now().toString());
        return new LinkedHashMap<>(store);
    }

    public void superAdminDeleteStore(String storeId) {
        Map<String, Object> store = findStoreById(storeId);
        String slug = String.valueOf(store.get("slug"));
        storesBySlug.remove(slug);
        productsByStoreSlug.remove(slug);
        ordersByStoreSlug.remove(slug);
        couponsByStoreId.remove(String.valueOf(store.get("id")));
    }

    private Map<String, Object> findStoreById(String storeId) {
        return storesBySlug.values().stream()
                .filter(s -> Objects.equals(String.valueOf(s.get("id")), storeId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
    }

    public Map<String, Object> listStoreProducts(String storeSlug, Map<String, String> filters) {
        List<Map<String, Object>> products = new ArrayList<>(productsByStoreSlug.getOrDefault(storeSlug, List.of()));
        String search = filters.getOrDefault("search", "").toLowerCase(Locale.ROOT);
        String category = filters.getOrDefault("category", "");

        List<Map<String, Object>> filtered = products.stream()
                .filter(p -> search.isBlank() || String.valueOf(p.get("name")).toLowerCase(Locale.ROOT).contains(search))
                .filter(p -> category.isBlank() || Objects.equals(String.valueOf(p.get("category")), category))
                .toList();

        int page = toInt(filters.getOrDefault("page", "1"), 1);
        int limit = toInt(filters.getOrDefault("limit", "12"), 12);
        int from = Math.max(0, (page - 1) * limit);
        int to = Math.min(filtered.size(), from + limit);
        List<Map<String, Object>> items = from >= filtered.size() ? List.of() : filtered.subList(from, to);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", items);
        response.put("page", page);
        response.put("limit", limit);
        response.put("total", filtered.size());
        response.put("totalPages", (int) Math.ceil(filtered.size() / (double) limit));
        return response;
    }

    public Map<String, Object> getProductBySlug(String storeSlug, String productSlug) {
        return productsByStoreSlug.getOrDefault(storeSlug, List.of()).stream()
                .filter(p -> Objects.equals(String.valueOf(p.get("slug")), productSlug))
                .findFirst()
                .map(LinkedHashMap::new)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    public List<Map<String, Object>> getRelatedProducts(String storeSlug, String productId) {
        return productsByStoreSlug.getOrDefault(storeSlug, List.of()).stream()
                .filter(p -> !Objects.equals(String.valueOf(p.get("id")), productId))
                .limit(4)
                .map(LinkedHashMap::new)
                .toList();
    }

    public List<Map<String, Object>> getFeaturedProducts(String storeSlug) {
        return productsByStoreSlug.getOrDefault(storeSlug, List.of()).stream()
                .filter(p -> Boolean.TRUE.equals(p.get("isFeatured")))
                .map(LinkedHashMap::new)
                .toList();
    }

    public Map<String, Object> adminGetProducts(String storeId, Map<String, String> filters) {
        String slug = String.valueOf(findStoreById(storeId).get("slug"));
        return listStoreProducts(slug, filters);
    }

    public Map<String, Object> adminCreateProduct(String storeId, Map<String, Object> body) {
        String slug = String.valueOf(findStoreById(storeId).get("slug"));
        String id = String.valueOf(productIdSeq.incrementAndGet());
        String name = String.valueOf(body.getOrDefault("name", "New Product"));
        String productSlug = name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "") + "-" + id;
        Map<String, Object> product = seedProduct(
                id,
                productSlug,
                name,
                String.valueOf(body.getOrDefault("category", "General")),
                toDouble(body.getOrDefault("price", 999)),
                null,
                Boolean.parseBoolean(String.valueOf(body.getOrDefault("isFeatured", false)))
        );
        product.put("stockCount", (int) toDouble(body.getOrDefault("stock", 0)));
        addProduct(slug, product);
        return product;
    }

    public Map<String, Object> adminUpdateProduct(String storeId, String productId, Map<String, Object> body) {
        String slug = String.valueOf(findStoreById(storeId).get("slug"));
        for (Map<String, Object> p : productsByStoreSlug.getOrDefault(slug, new ArrayList<>())) {
            if (Objects.equals(String.valueOf(p.get("id")), productId)) {
                p.putAll(body);
                p.put("updatedAt", Instant.now().toString());
                return new LinkedHashMap<>(p);
            }
        }
        throw new IllegalArgumentException("Product not found");
    }

    public void adminDeleteProduct(String storeId, String productId) {
        String slug = String.valueOf(findStoreById(storeId).get("slug"));
        productsByStoreSlug.getOrDefault(slug, new ArrayList<>())
                .removeIf(p -> Objects.equals(String.valueOf(p.get("id")), productId));
    }

    public Map<String, Object> createOrder(String storeSlug, Map<String, Object> body) {
        String id = "ORD-" + orderIdSeq.incrementAndGet();
        Map<String, Object> order = seedOrder(
                id,
                String.valueOf(body.getOrDefault("customerName", "Guest Customer")),
                toDouble(body.getOrDefault("total", 999)),
                "pending",
                1
        );
        order.put("paymentMethod", body.getOrDefault("paymentMethod", "razorpay"));
        order.put("shippingAddress", body.getOrDefault("shippingAddress", Map.of()));
        addOrder(storeSlug, order);
        return order;
    }

    public Map<String, Object> getOrder(String orderId) {
        return ordersByStoreSlug.values().stream()
                .flatMap(List::stream)
                .filter(o -> Objects.equals(String.valueOf(o.get("id")), orderId))
                .findFirst()
                .map(LinkedHashMap::new)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

    public Map<String, Object> getMyOrders(int page, int limit) {
        List<Map<String, Object>> all = ordersByStoreSlug.values().stream().flatMap(List::stream).toList();
        int from = Math.max(0, (page - 1) * limit);
        int to = Math.min(all.size(), from + limit);
        List<Map<String, Object>> items = from >= all.size() ? List.of() : all.subList(from, to);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("limit", limit);
        result.put("total", all.size());
        result.put("totalPages", (int) Math.ceil(all.size() / (double) limit));
        return result;
    }

    public Map<String, Object> verifyCoupon(String storeSlug, String code, double orderAmount) {
        String storeId = String.valueOf(getStoreBySlug(storeSlug).get("id"));
        List<Map<String, Object>> coupons = couponsByStoreId.getOrDefault(storeId, List.of());

        Optional<Map<String, Object>> match = coupons.stream()
                .filter(c -> Objects.equals(String.valueOf(c.get("code")), code.toUpperCase(Locale.ROOT)))
                .filter(c -> Boolean.TRUE.equals(c.get("isActive")))
                .findFirst();

        if (match.isEmpty()) {
            throw new IllegalArgumentException("Invalid coupon code");
        }

        Map<String, Object> c = match.get();
        double min = toDouble(c.getOrDefault("minOrderAmount", 0));
        if (orderAmount < min) {
            throw new IllegalArgumentException("Minimum order amount not met");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("discount", toDouble(c.get("discountValue")));
        result.put("discountType", String.valueOf(c.get("discountType")));
        return result;
    }

    public Map<String, Object> adminGetOrders(String storeId, int page, int limit, String status) {
        String slug = String.valueOf(findStoreById(storeId).get("slug"));
        List<Map<String, Object>> orders = new ArrayList<>(ordersByStoreSlug.getOrDefault(slug, List.of()));
        if (status != null && !status.isBlank()) {
            orders = orders.stream().filter(o -> Objects.equals(String.valueOf(o.get("status")), status)).toList();
        }

        int from = Math.max(0, (page - 1) * limit);
        int to = Math.min(orders.size(), from + limit);
        List<Map<String, Object>> items = from >= orders.size() ? List.of() : orders.subList(from, to);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("limit", limit);
        result.put("total", orders.size());
        result.put("totalPages", (int) Math.ceil(orders.size() / (double) limit));
        return result;
    }

    public Map<String, Object> adminUpdateOrderStatus(String storeId, String orderId, String status, String trackingNumber) {
        String slug = String.valueOf(findStoreById(storeId).get("slug"));
        for (Map<String, Object> o : ordersByStoreSlug.getOrDefault(slug, new ArrayList<>())) {
            if (Objects.equals(String.valueOf(o.get("id")), orderId)) {
                o.put("status", status);
                o.put("orderStatus", status);
                if (trackingNumber != null && !trackingNumber.isBlank()) {
                    o.put("trackingNumber", trackingNumber);
                }
                o.put("updatedAt", Instant.now().toString());
                return new LinkedHashMap<>(o);
            }
        }
        throw new IllegalArgumentException("Order not found");
    }

    public Map<String, Object> createStripePaymentIntent(String storeSlug, double amount, String currency) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("clientSecret", "pi_demo_" + UUID.randomUUID() + "_secret_demo");
        result.put("amount", amount);
        result.put("currency", currency);
        result.put("storeSlug", storeSlug);
        return result;
    }

    public Map<String, Object> createRazorpayOrder(String storeSlug, double amount, String currency) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", "order_" + UUID.randomUUID().toString().replace("-", ""));
        result.put("amount", amount);
        result.put("currency", currency);
        result.put("storeSlug", storeSlug);
        return result;
    }

    public Map<String, Object> currentUser() {
        return authenticate("admin@demo.com", "admin123", false)
                .map(a -> (Map<String, Object>) a.get("user"))
                .orElse(Map.of());
    }

    private static int toInt(String value, int fallback) {
        try {
            return Integer.parseInt(value);
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private static double toDouble(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number n) {
            return n.doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ignored) {
            return 0;
        }
    }
}
