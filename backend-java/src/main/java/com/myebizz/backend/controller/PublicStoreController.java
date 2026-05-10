package com.myebizz.backend.controller;

import com.myebizz.backend.dto.ApiResponse;
import com.myebizz.backend.service.DemoDataService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stores")
public class PublicStoreController {

    private final DemoDataService demoDataService;

    public PublicStoreController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @GetMapping("/{storeSlug}")
    public ResponseEntity<?> getStoreBySlug(@PathVariable String storeSlug) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(demoDataService.getStoreBySlug(storeSlug)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @GetMapping("/{storeSlug}/products")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStoreProducts(
            @PathVariable String storeSlug,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String minPrice,
            @RequestParam(required = false) String maxPrice,
            @RequestParam(defaultValue = "1") String page,
            @RequestParam(defaultValue = "12") String limit
    ) {
        Map<String, String> filters = Map.of(
                "search", search == null ? "" : search,
                "category", category == null ? "" : category,
                "sortBy", sortBy == null ? "" : sortBy,
                "minPrice", minPrice == null ? "" : minPrice,
                "maxPrice", maxPrice == null ? "" : maxPrice,
                "page", page,
                "limit", limit
        );
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.listStoreProducts(storeSlug, filters)));
    }

    @GetMapping("/{storeSlug}/products/featured")
    public ResponseEntity<ApiResponse<?>> getFeaturedProducts(@PathVariable String storeSlug) {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.getFeaturedProducts(storeSlug)));
    }

    @GetMapping("/{storeSlug}/products/{productSlug}")
    public ResponseEntity<?> getProductBySlug(@PathVariable String storeSlug, @PathVariable String productSlug) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(demoDataService.getProductBySlug(storeSlug, productSlug)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @GetMapping("/{storeSlug}/products/{productId}/related")
    public ResponseEntity<ApiResponse<?>> getRelatedProducts(@PathVariable String storeSlug, @PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.getRelatedProducts(storeSlug, productId)));
    }

    @PostMapping("/{storeSlug}/orders")
    public ResponseEntity<ApiResponse<?>> createOrder(@PathVariable String storeSlug, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Order created", demoDataService.createOrder(storeSlug, body)));
    }

    @PostMapping("/{storeSlug}/coupons/verify")
    public ResponseEntity<?> verifyCoupon(@PathVariable String storeSlug, @RequestBody Map<String, Object> body) {
        try {
            String code = String.valueOf(body.getOrDefault("code", ""));
            double orderAmount = Double.parseDouble(String.valueOf(body.getOrDefault("orderAmount", 0)));
            return ResponseEntity.ok(ApiResponse.ok(demoDataService.verifyCoupon(storeSlug, code, orderAmount)));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @PostMapping("/{storeSlug}/payments/stripe/intent")
    public ResponseEntity<ApiResponse<?>> createStripePaymentIntent(@PathVariable String storeSlug, @RequestBody Map<String, Object> body) {
        double amount = Double.parseDouble(String.valueOf(body.getOrDefault("amount", 0)));
        String currency = String.valueOf(body.getOrDefault("currency", "INR"));
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.createStripePaymentIntent(storeSlug, amount, currency)));
    }

    @PostMapping("/{storeSlug}/payments/razorpay/order")
    public ResponseEntity<ApiResponse<?>> createRazorpayOrder(@PathVariable String storeSlug, @RequestBody Map<String, Object> body) {
        double amount = Double.parseDouble(String.valueOf(body.getOrDefault("amount", 0)));
        String currency = String.valueOf(body.getOrDefault("currency", "INR"));
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.createRazorpayOrder(storeSlug, amount, currency)));
    }
}
