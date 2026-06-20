package com.aistudyhub.controller;

import com.aistudyhub.dto.request.*;
import com.aistudyhub.dto.response.*;
import com.aistudyhub.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionDto>> listSessions(@RequestParam Integer userId) {
        return ResponseEntity.ok(chatService.listSessions(userId));
    }

    @PostMapping("/sessions")
    public ResponseEntity<ChatSessionDto> createSession(@Valid @RequestBody CreateChatSessionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.createSession(req));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageDto>> listMessages(
            @PathVariable Integer sessionId,
            @RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(chatService.listMessages(sessionId, userId));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable Integer sessionId,
            @RequestParam(required = false) Integer userId) {
        chatService.deleteSession(sessionId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatAskResponse> ask(@Valid @RequestBody ChatAskRequest req) {
        return ResponseEntity.ok(chatService.ask(req));
    }
}
