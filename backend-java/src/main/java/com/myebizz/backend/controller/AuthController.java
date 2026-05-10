package com.myebizz.backend.controller;

import com.myebizz.backend.dto.ApiResponse;
import com.myebizz.backend.service.DemoDataService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final DemoDataService demoDataService;

    public AuthController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
        String email = String.valueOf(body.getOrDefault("email", ""));
        String password = String.valueOf(body.getOrDefault("password", ""));

        return demoDataService.authenticate(email, password, false)
                .<ResponseEntity<?>>map(auth -> {
                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("success", true);
                    response.put("message", "Login successful");
                    response.put("data", auth.get("user"));
                    response.put("user", auth.get("user"));
                    response.put("accessToken", auth.get("accessToken"));
                    response.put("refreshToken", auth.get("refreshToken"));
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid credentials")));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, Object> body) {
        String email = String.valueOf(body.getOrDefault("email", ""));
        String password = String.valueOf(body.getOrDefault("password", ""));

        return demoDataService.authenticate(email, password, true)
                .<ResponseEntity<?>>map(auth -> {
                    Map<String, Object> user = new LinkedHashMap<>((Map<String, Object>) auth.get("user"));
                    user.put("accessToken", auth.get("accessToken"));
                    user.put("refreshToken", auth.get("refreshToken"));
                    return ResponseEntity.ok(ApiResponse.ok("Admin login successful", user));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid admin credentials")));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> body) {
        try {
            String name = String.valueOf(body.getOrDefault("name", ""));
            String email = String.valueOf(body.getOrDefault("email", ""));
            String password = String.valueOf(body.getOrDefault("password", ""));
            return ResponseEntity.ok(ApiResponse.ok("Signup successful", demoDataService.signup(name, email, password)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forgotPassword(@RequestBody Map<String, Object> body) {
        String email = String.valueOf(body.getOrDefault("email", ""));
        return ResponseEntity.ok(ApiResponse.ok("Reset link sent", Map.of(
                "email", email,
                "resetToken", "reset-demo-token"
        )));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetPassword(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Password reset successful", Map.of(
                "token", body.getOrDefault("token", ""),
                "status", "updated"
        )));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refresh(@RequestBody Map<String, Object> body) {
        String refreshToken = String.valueOf(body.getOrDefault("refreshToken", ""));
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "accessToken", "access-refreshed-" + Math.abs(refreshToken.hashCode())
        )));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Map<String, Object>>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Logged out", Map.of("loggedOut", true)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me() {
        return ResponseEntity.ok(ApiResponse.ok(demoDataService.currentUser()));
    }
}
