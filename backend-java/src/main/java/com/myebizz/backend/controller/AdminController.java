package com.myebizz.backend.controller;

import com.myebizz.backend.dto.ApiResponse;
import com.myebizz.backend.service.DemoDataService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final DemoDataService demoDataService;

    public AdminController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @GetMapping("/store")
    public ResponseEntity<ApiResponse<?>> getAdminStore() {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.getAdminStore()));
    }

    @PutMapping("/store/settings")
    public ResponseEntity<ApiResponse<?>> updateStoreSettings(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Store settings updated", demoDataService.updateAdminStoreSettings(body)));
    }

    @PutMapping(value = "/store/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> updateStoreLogo(
            @RequestParam(required = false) MultipartFile file,
            @RequestParam Map<String, String> body
    ) {
        Map<String, Object> updates = new LinkedHashMap<>();
        updates.put("logoUrl", file != null ? "/uploads/demo-logo-" + file.getOriginalFilename() : "/uploads/demo-logo.png");
        updates.putAll(body);
        return ResponseEntity.ok(ApiResponse.ok("Store logo updated", demoDataService.updateAdminStoreSettings(updates)));
    }

    @PutMapping(value = "/store/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> updateStoreBanner(
            @RequestParam(required = false) MultipartFile file,
            @RequestParam Map<String, String> body
    ) {
        Map<String, Object> updates = new LinkedHashMap<>();
        updates.put("bannerUrl", file != null ? "/uploads/demo-banner-" + file.getOriginalFilename() : "/uploads/demo-banner.jpg");
        updates.putAll(body);
        return ResponseEntity.ok(ApiResponse.ok("Store banner updated", demoDataService.updateAdminStoreSettings(updates)));
    }

    @GetMapping("/store/analytics")
    public ResponseEntity<ApiResponse<?>> getAnalytics(@RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.adminAnalytics(period)));
    }

    @GetMapping("/store/coupons")
    public ResponseEntity<ApiResponse<?>> getCoupons() {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.getAdminCoupons()));
    }

    @PostMapping("/store/coupons")
    public ResponseEntity<ApiResponse<?>> createCoupon(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Coupon created", demoDataService.createAdminCoupon(body)));
    }

    @PutMapping("/store/coupons/{couponId}")
    public ResponseEntity<?> updateCoupon(@PathVariable String couponId, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Coupon updated", demoDataService.updateAdminCoupon(couponId, body)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @DeleteMapping("/store/coupons/{couponId}")
    public ResponseEntity<ApiResponse<?>> deleteCoupon(@PathVariable String couponId) {
        demoDataService.deleteAdminCoupon(couponId);
        return ResponseEntity.ok(ApiResponse.ok("Coupon deleted", Map.of("deleted", true)));
    }

    @GetMapping("/stores/{storeId}/products")
    public ResponseEntity<ApiResponse<?>> adminGetProducts(
            @PathVariable String storeId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") String page,
            @RequestParam(defaultValue = "12") String limit
    ) {
        Map<String, String> filters = Map.of(
                "search", search == null ? "" : search,
                "category", category == null ? "" : category,
                "page", page,
                "limit", limit
        );
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.adminGetProducts(storeId, filters)));
    }

    @PostMapping(value = "/stores/{storeId}/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> adminCreateProduct(
            @PathVariable String storeId,
            @RequestParam Map<String, String> body,
            @RequestParam(required = false) MultipartFile[] images
    ) {
        Map<String, Object> data = new LinkedHashMap<>(body);
        if (images != null) {
            data.put("uploadedImages", images.length);
        }
        return ResponseEntity.ok(ApiResponse.ok("Product created", demoDataService.adminCreateProduct(storeId, data)));
    }

    @PutMapping(value = "/stores/{storeId}/products/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> adminUpdateProduct(
            @PathVariable String storeId,
            @PathVariable String productId,
            @RequestParam Map<String, String> body,
            @RequestParam(required = false) MultipartFile[] images
    ) {
        Map<String, Object> data = new LinkedHashMap<>(body);
        if (images != null) {
            data.put("uploadedImages", images.length);
        }
        return ResponseEntity.ok(ApiResponse.ok("Product updated", demoDataService.adminUpdateProduct(storeId, productId, data)));
    }

    @DeleteMapping("/stores/{storeId}/products/{productId}")
    public ResponseEntity<ApiResponse<?>> adminDeleteProduct(@PathVariable String storeId, @PathVariable String productId) {
        demoDataService.adminDeleteProduct(storeId, productId);
        return ResponseEntity.ok(ApiResponse.ok("Product deleted", Map.of("deleted", true)));
    }

    @GetMapping("/stores/{storeId}/orders")
    public ResponseEntity<ApiResponse<?>> adminGetOrders(
            @PathVariable String storeId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.adminGetOrders(storeId, page, limit, status)));
    }

    @PutMapping("/stores/{storeId}/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<?>> adminUpdateOrderStatus(
            @PathVariable String storeId,
            @PathVariable String orderId,
            @RequestBody Map<String, Object> body
    ) {
        String status = String.valueOf(body.getOrDefault("status", "processing"));
        String trackingNumber = String.valueOf(body.getOrDefault("trackingNumber", ""));
        return ResponseEntity.ok(ApiResponse.ok("Order status updated", demoDataService.adminUpdateOrderStatus(storeId, orderId, status, trackingNumber)));
    }
}
