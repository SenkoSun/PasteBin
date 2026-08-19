package com.senkosun.pastebin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class UpdatePasteRequest {
    @NotBlank(message = "Content is requiring")
    @Size(max = 1000, message = "The content may have at max 1000 characters")
    private String content;

    @Positive(message = "TTL must be greater than 0")
    private Long ttlMinutes;
}
