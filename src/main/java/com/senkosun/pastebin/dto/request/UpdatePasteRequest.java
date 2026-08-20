package com.senkosun.pastebin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePasteRequest {
    @Size(max = 100, message = "The title may have at max 100, characters")
    private String title;

    @Size(max = 1000, message = "The content may have at max 1000 characters")
    private String content;

    @Positive(message = "TTL must be greater than 0")
    private Long ttlMinutes;
}
