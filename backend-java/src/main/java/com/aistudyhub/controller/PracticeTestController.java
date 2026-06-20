package com.aistudyhub.controller;

import com.aistudyhub.dto.quiz.PracticeTestGenerateRequest;
import com.aistudyhub.dto.quiz.PracticeTestSubmitRequest;
import com.aistudyhub.service.PracticeTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/practice-tests")
@RequiredArgsConstructor
public class PracticeTestController {
    private final PracticeTestService practiceTestService;

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(defaultValue = "1") Integer userId) {
        return practiceTestService.list(userId);
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Integer id) {
        return practiceTestService.get(id);
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generate(@Valid @RequestBody PracticeTestGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(practiceTestService.generate(request));
    }

    @PostMapping("/{id}/submit")
    public Map<String, Object> submit(@PathVariable Integer id, @RequestBody PracticeTestSubmitRequest request) {
        return practiceTestService.submit(id, request);
    }
}
