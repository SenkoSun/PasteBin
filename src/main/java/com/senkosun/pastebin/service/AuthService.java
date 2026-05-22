package com.senkosun.pastebin.service;

import com.senkosun.pastebin.dto.response.LoginResponse;
import com.senkosun.pastebin.dto.response.RefreshResponse;
import com.senkosun.pastebin.entity.User;
import com.senkosun.pastebin.entity.RefreshToken;
import com.senkosun.pastebin.repository.UserRepository;
import com.senkosun.pastebin.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public void register(String username, String email, String password) {
        // Проверяем, не занят ли username
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken");
        }

        // Проверяем, не занят ли email
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already taken");
        }

        // Создаем нового пользователя
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .isAdmin(false)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
    }

    @Transactional
    public LoginResponse login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        refreshTokenRepository.deleteByUser(user);

        String accessToken = jwtService.generateAccessToken(
                user.getUsername(),
                user.getId(),
                user.isAdmin()
        );

        String refreshTokenString = jwtService.generateRefreshToken(
                user.getUsername(),
                user.getId()
        );

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenString)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(30))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return new LoginResponse(accessToken, refreshTokenString);
    }

    @Transactional
    public RefreshResponse refreshAccessToken(String refreshTokenString) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new RuntimeException("Refresh token revoked");
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        if (!jwtService.validateToken(refreshTokenString)) {
            throw new RuntimeException("Invalid refresh token");
        }

        User user = refreshToken.getUser();

        String newAccessToken = jwtService.generateAccessToken(
                user.getUsername(),
                user.getId(),
                user.isAdmin()
        );
        return new RefreshResponse(newAccessToken);
    }

    @Transactional
    public void logout(String refreshTokenString) {
        // Находим refresh токен
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElse(null);

        if (refreshToken != null) {
            // Помечаем как отозванный или просто удаляем
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
        }
    }
}
