package com.aistudyhub.practice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "QUIZ_TEST")
public class QuizQuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private PracticeTestEntity practiceTest;

    @Column(name = "question_content", nullable = false)
    private String questionContent;

    @Column(name = "question_type", nullable = false)
    private String questionType;

    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer;

    @Column(name = "difficulty_level", nullable = false)
    private String difficultyLevel;

    public Long getId() { return id; }
    public PracticeTestEntity getPracticeTest() { return practiceTest; }
    public void setPracticeTest(PracticeTestEntity practiceTest) { this.practiceTest = practiceTest; }
    public String getQuestionContent() { return questionContent; }
    public void setQuestionContent(String questionContent) { this.questionContent = questionContent; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
}
