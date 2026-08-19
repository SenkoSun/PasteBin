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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @Transactional
    public PasteResponse getPasteById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));


        Paste paste = pasteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paste not found"));

        if (!paste.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only access your own pastes");
        }

        if (paste.getExpiresAt().isBefore(LocalDateTime.now())) {
            pasteRepository.delete(paste);
            throw new RuntimeException("Paste has expired and has been deleted");
        }

        return toResponse(paste);

    }

    @Transactional
    public List<PasteResponse> getUserPastes(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Paste> pastes = pasteRepository.findByUserOrderByCreatedAtDesc(user);

        List<Paste> activePastes = new ArrayList<>();
        for (Paste paste : pastes) {
            if (paste.getExpiresAt().isBefore(LocalDateTime.now())) {
                pasteRepository.delete(paste);
            } else {
                activePastes.add(paste);
            }
        }

        return activePastes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

    }

    @Transactional
    public PasteResponse getPasteBySlug(String slug) {

        Paste paste = pasteRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Paste not found"));

        if (paste.getExpiresAt().isBefore(LocalDateTime.now())) {
            pasteRepository.delete(paste);
            throw new RuntimeException("Paste has expired and has been deleted");
        }

        return toResponse(paste);

    }

    @Transactional
    public PasteResponse updatePaste(Long id, String content, String username, Long ttlMinutes) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        Paste paste = pasteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paste not found"));

        if (paste.getExpiresAt().isBefore(LocalDateTime.now())) {
            pasteRepository.delete(paste);
            throw new RuntimeException("Paste has expired and has been deleted");
        }

        if (content != null && !content.trim().isEmpty()) {
            paste.setContent(content);
        }

        if (ttlMinutes != null && ttlMinutes > 0) {
            paste.setTtlMinutes(ttlMinutes);
            paste.setExpiresAt(LocalDateTime.now().plusMinutes(ttlMinutes));
        }


        Paste updatedPaste = pasteRepository.save(paste);
        return toResponse(updatedPaste);

    }


    @Transactional
    public void deletePaste(Long id, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        Paste paste = pasteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paste not found"));

        if (!paste.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own pastes");
        }

        pasteRepository.delete(paste);

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
