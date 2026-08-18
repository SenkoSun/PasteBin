package com.senkosun.pastebin.controller;

import com.senkosun.pastebin.dto.request.LoginRequest;
import com.senkosun.pastebin.dto.response.LoginResponse;
import com.senkosun.pastebin.dto.response.MessageResponse;
import com.senkosun.pastebin.dto.response.RefreshResponse;
import com.senkosun.pastebin.dto.request.RegisterRequest;
import com.senkosun.pastebin.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pastes")
@RequiredArgsConstructor
public class PasteController {

//    @PostMapping("/create")
//    public ResponseEntity<?> createPaste(Authentication authentication, @Valid @RequestBody PasteRequest request) {
//
//    }


}
