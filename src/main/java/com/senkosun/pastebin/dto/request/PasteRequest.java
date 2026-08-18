package com.senkosun.pastebin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasteRequest {

    @NotBlank(message = "Content is requiring")
    @Size(min = 1, max = 1000, message = "The content may have at max 1000 characters")
    private String content;

    @NotNull(message = "Time is requiring")
    @Positive(message = "TTL must be greater than 0")
    private Long ttlMinutes;

}
