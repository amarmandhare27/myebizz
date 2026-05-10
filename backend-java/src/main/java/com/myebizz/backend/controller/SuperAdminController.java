package com.myebizz.backend.controller;

import com.myebizz.backend.dto.ApiResponse;
import com.myebizz.backend.service.DemoDataService;
import java.util.Map;
import org.springframework.http.HttpStatus;
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

@RestController
@RequestMapping("/super-admin")
public class SuperAdminController {

    private final DemoDataService demoDataService;

    public SuperAdminController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.superAdminStats()));
    }

    @GetMapping("/stores")
    public ResponseEntity<ApiResponse<?>> getStores(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String plan
    ) {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.superAdminStores(page, limit, status, plan)));
    }

    @PostMapping("/stores")
    public ResponseEntity<ApiResponse<?>> createStore(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Store created", demoDataService.superAdminCreateStore(body)));
    }

    @PutMapping("/stores/{storeId}/status")
    public ResponseEntity<?> updateStoreStatus(@PathVariable String storeId, @RequestBody Map<String, Object> body) {
        try {
            String status = String.valueOf(body.getOrDefault("status", "active"));
            return ResponseEntity.ok(ApiResponse.ok("Store status updated", demoDataService.superAdminUpdateStoreStatus(storeId, status)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @DeleteMapping("/stores/{storeId}")
    public ResponseEntity<?> deleteStore(@PathVariable String storeId) {
        try {
            demoDataService.superAdminDeleteStore(storeId);
            return ResponseEntity.ok(ApiResponse.ok("Store deleted", Map.of("deleted", true)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @GetMapping("/clients")
    public ResponseEntity<ApiResponse<?>> getClients(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.superAdminClients(page, limit)));
    }
}
