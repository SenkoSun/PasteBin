package com.senkosun.pastebin.service;

import com.senkosun.pastebin.dto.response.PasteResponse;
import com.senkosun.pastebin.dto.response.LoginResponse;
import com.senkosun.pastebin.dto.response.RefreshResponse;
import com.senkosun.pastebin.entity.Paste;
import com.senkosun.pastebin.entity.User;
import com.senkosun.pastebin.entity.RefreshToken;
import com.senkosun.pastebin.repository.PasteRepository;
import com.senkosun.pastebin.repository.UserRepository;
import com.senkosun.pastebin.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasteService {
    private final UserRepository userRepository;
    private final PasteRepository pasteRepository;

    @Transactional
    public PasteResponse createPaste(String content, String username, Long ttlMinutes) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }

        // Проверка: время жизни должно быть положительным
        if (ttlMinutes == null || ttlMinutes <= 0) {
            throw new IllegalArgumentException("TTL must be greater than 0");
        }

        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        Paste paste = new Paste();
        paste.setContent(content);
        paste.setUser(user);
        paste.setCreatedAt(LocalDateTime.now());
        paste.setTtlMinutes(ttlMinutes);
        paste.setExpiresAt(LocalDateTime.now().plusMinutes(ttlMinutes));


        String slug = generateUniqueSlug();
        paste.setSlug(slug);

        Paste savedPaste = pasteRepository.save(paste);
        return toResponse(savedPaste);

    }

    private PasteResponse toResponse(Paste paste) {
        return new PasteResponse(
                paste.getId(),
                paste.getContent(),
                paste.getSlug(),
                paste.getCreatedAt(),
                paste.getExpiresAt()
        );
    }

    private String generateUniqueSlug() {
        String slug;
        do {
            // Берем первые 6 символов из UUID и переводим в верхний регистр
            slug = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 6)
                    .toUpperCase();
        } while (pasteRepository.existsBySlug(slug));

        return slug;
    }
}
