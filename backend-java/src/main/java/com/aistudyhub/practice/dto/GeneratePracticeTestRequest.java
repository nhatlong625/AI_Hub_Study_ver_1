package com.aistudyhub.practice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GeneratePracticeTestRequest {
    @NotNull(message = "documentId is required")
    private Long documentId;

    @Size(max = 255, message = "title must be at most 255 characters")
    private String title;

    @JsonAlias({"questions", "questionCount"})
    @Min(value = 1, message = "numberOfQuestions must be at least 1")
    @Max(value = 50, message = "numberOfQuestions must be at most 50")
    private Integer numberOfQuestions;

    private String difficulty;

    @JsonAlias({"duration", "timeLimit"})
    private String duration;

    @JsonAlias({"feedback", "instantFeedback"})
    private Boolean instantFeedback;

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Integer getNumberOfQuestions() { return numberOfQuestions; }
    public void setNumberOfQuestions(Integer numberOfQuestions) { this.numberOfQuestions = numberOfQuestions; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public Boolean getInstantFeedback() { return instantFeedback; }
    public void setInstantFeedback(Boolean instantFeedback) { this.instantFeedback = instantFeedback; }
}
