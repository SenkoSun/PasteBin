package com.senkosun.pastebin.controller;

import com.senkosun.pastebin.dto.request.CreatePasteRequest;
import com.senkosun.pastebin.dto.request.LoginRequest;
import com.senkosun.pastebin.dto.response.LoginResponse;
import com.senkosun.pastebin.dto.response.MessageResponse;
import com.senkosun.pastebin.dto.response.PasteResponse;
import com.senkosun.pastebin.dto.response.RefreshResponse;
import com.senkosun.pastebin.dto.request.RegisterRequest;
import com.senkosun.pastebin.entity.Paste;
import com.senkosun.pastebin.entity.User;
import com.senkosun.pastebin.repository.UserRepository;
import com.senkosun.pastebin.service.AuthService;
import com.senkosun.pastebin.service.PasteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pastes")
@RequiredArgsConstructor
public class PasteController {

    private final PasteService pasteService;


    @PostMapping
    public ResponseEntity<PasteResponse> createPaste(Authentication authentication, @Valid @RequestBody CreatePasteRequest request) {
        PasteResponse pasteResponse = pasteService.createPaste(
                request.getContent(),
                authentication.getName(),
                request.getTtlMinutes()
        );
        return ResponseEntity.ok(pasteResponse);
    }

//    @GetMapping
//    public ResponseEntity<List<PasteSummaryResponse>> getPastes(Authentication authentication) {
//
//    }

//    @GetMapping(/{id})
//    public ResponseEntity<PasteResponse> getPasteById(@PathVariable Long id, Authentication authentication) {
//
//    }

//    @GetMapping(/slug/{slug})
//    public ResponseEntity<PasteResponse> getPasteBySlug(@PathVariable String slug, Authentication authentication) {
//
//    }

//    @PutMapping(/{id})
//    public ResponseEntity<PasteResponse> updatePaste(@PathVariable Long id, Authentication authentication,  @Valid @RequestBody UpdatePasteRequest request) {
//
//    }


//    @DeleteMapping(/{id})
//    public ResponseEntity<PasteResponse> deletePaste(@PathVariable Long id, Authentication authentication) {
//
//    }

}
