package com.senkosun.pastebin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RefreshResponse {
    private String accessToken;
}