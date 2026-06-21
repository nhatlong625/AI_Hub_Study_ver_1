package com.aistudyhub.practice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.practice")
public class PracticeProperties {
    private int defaultQuestionCount = 10;
    private int defaultTimeLimitMinutes = 30;
    private int maxQuestions = 50;
    private int minimumSourceTextLength = 180;

    public int getDefaultQuestionCount() { return defaultQuestionCount; }
    public void setDefaultQuestionCount(int defaultQuestionCount) { this.defaultQuestionCount = defaultQuestionCount; }
    public int getDefaultTimeLimitMinutes() { return defaultTimeLimitMinutes; }
    public void setDefaultTimeLimitMinutes(int defaultTimeLimitMinutes) { this.defaultTimeLimitMinutes = defaultTimeLimitMinutes; }
    public int getMaxQuestions() { return maxQuestions; }
    public void setMaxQuestions(int maxQuestions) { this.maxQuestions = maxQuestions; }
    public int getMinimumSourceTextLength() { return minimumSourceTextLength; }
    public void setMinimumSourceTextLength(int minimumSourceTextLength) { this.minimumSourceTextLength = minimumSourceTextLength; }
}
