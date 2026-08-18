package com.senkosun.pastebin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PasteResponse {
    private String content;
    private String slug;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
