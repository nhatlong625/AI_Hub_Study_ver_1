package com.aistudyhub.practice.controller;

import com.aistudyhub.common.ApiResponse;
import com.aistudyhub.practice.dto.GeneratePracticeTestRequest;
import com.aistudyhub.practice.dto.PracticeTestResponse;
import com.aistudyhub.practice.dto.PracticeTestResultResponse;
import com.aistudyhub.practice.dto.PracticeTestSummaryResponse;
import com.aistudyhub.practice.dto.SubmitPracticeTestRequest;
import com.aistudyhub.practice.service.PracticeTestService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/practice-tests")
public class PracticeTestController {
    private final PracticeTestService practiceTestService;

    public PracticeTestController(PracticeTestService practiceTestService) {
        this.practiceTestService = practiceTestService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<PracticeTestResponse>> generate(@Valid @RequestBody GeneratePracticeTestRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Practice test generated successfully", practiceTestService.generate(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PracticeTestResponse>> getPracticeTest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Practice test loaded successfully", practiceTestService.getPracticeTest(id)));
    }

    @GetMapping("/my-tests")
    public ResponseEntity<ApiResponse<List<PracticeTestSummaryResponse>>> getMyTests() {
        return ResponseEntity.ok(ApiResponse.success("Practice tests loaded successfully", practiceTestService.getMyTests()));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<PracticeTestResultResponse>> submit(@PathVariable Long id, @Valid @RequestBody SubmitPracticeTestRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Practice test submitted successfully", practiceTestService.submit(id, request)));
    }

    @GetMapping("/results/{resultId}")
    public ResponseEntity<ApiResponse<PracticeTestResultResponse>> getResult(@PathVariable Long resultId) {
        return ResponseEntity.ok(ApiResponse.success("Practice test result loaded successfully", practiceTestService.getResult(resultId)));
    }
}
