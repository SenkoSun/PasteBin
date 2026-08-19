package com.senkosun.pastebin.dto.response;

import java.time.LocalDateTime;

public class PasteSummaryResponse {
    private Long id;
    private String contentPreview;  // первые 50 символов
    private String slug;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
