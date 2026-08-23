package com.senkosun.pastebin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String index() {
        return "forward:/html/index.html";
    }

    @GetMapping("/search/**")
    public String search() {
        return "forward:/html/search.html";
    }

    @GetMapping("/login")
    public String login() {
        return "forward:/html/login.html";
    }

    // Страница регистрации
    @GetMapping("/registration")
    public String register() {
        return "forward:/html/registration.html";
    }
}