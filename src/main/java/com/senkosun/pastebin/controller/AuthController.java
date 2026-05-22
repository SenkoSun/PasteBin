package com.senkosun.pastebin.controller;

import com.senkosun.pastebin.dto.request.LoginRequest;
import com.senkosun.pastebin.dto.response.LoginResponse;
import com.senkosun.pastebin.dto.response.RefreshResponse;
import com.senkosun.pastebin.dto.request.RegisterRequest;
import com.senkosun.pastebin.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@RequestHeader("Authorization") String authorizationHeader) {
        // Извлекаем refresh токен из заголовка "Bearer <token>"
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid refresh token header");
        }

        String refreshToken = authorizationHeader.substring(7); // убираем "Bearer "
        RefreshResponse response = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String refreshToken = authorizationHeader.substring(7);
            authService.logout(refreshToken);
        }
        return ResponseEntity.ok("Logged out successfully");
    }

}
