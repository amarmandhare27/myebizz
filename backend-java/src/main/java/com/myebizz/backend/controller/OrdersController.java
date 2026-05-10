package com.myebizz.backend.controller;

import com.myebizz.backend.dto.ApiResponse;
import com.myebizz.backend.service.DemoDataService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
public class OrdersController {

    private final DemoDataService demoDataService;

    public OrdersController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable String orderId) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(demoDataService.getOrder(orderId)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<?>> getMyOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.getMyOrders(page, limit)));
    }
}
