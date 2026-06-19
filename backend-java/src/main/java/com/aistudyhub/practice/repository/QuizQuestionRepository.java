package com.aistudyhub.practice.repository;

import com.aistudyhub.practice.entity.QuizQuestionEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestionEntity, Long> {
    List<QuizQuestionEntity> findByPracticeTestIdOrderByIdAsc(Long practiceTestId);
}
