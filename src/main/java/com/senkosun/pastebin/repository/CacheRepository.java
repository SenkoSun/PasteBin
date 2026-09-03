package com.senkosun.pastebin.repository;

import com.senkosun.pastebin.entity.Paste;
import com.senkosun.pastebin.repository.PasteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CacheRepository {

    private final PasteRepository pasteRepository;

    @Cacheable(value = "pastes", key = "#slug")
    public List<Paste> getRawPastesFromDb(String slug) {
        System.out.println("🔴 Загружено из БД (кэш пуст), slug: " + slug);
        return pasteRepository.findBySlugOrderByCreatedAtDesc(slug);
    }
}
