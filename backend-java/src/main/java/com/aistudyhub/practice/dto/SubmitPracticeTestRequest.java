package com.aistudyhub.practice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SubmitPracticeTestRequest {
    @NotNull(message = "answers is required")
    private JsonNode answers;
    private Integer elapsedSeconds;
    private Set<Long> flaggedQuestionIds;

    public JsonNode getAnswers() { return answers; }
    public void setAnswers(JsonNode answers) { this.answers = answers; }
    public Integer getElapsedSeconds() { return elapsedSeconds; }
    public void setElapsedSeconds(Integer elapsedSeconds) { this.elapsedSeconds = elapsedSeconds; }
    public Set<Long> getFlaggedQuestionIds() { return flaggedQuestionIds; }
    public void setFlaggedQuestionIds(Set<Long> flaggedQuestionIds) { this.flaggedQuestionIds = flaggedQuestionIds; }
}
