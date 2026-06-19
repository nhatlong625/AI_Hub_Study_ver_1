package com.aistudyhub.practice.repository;

import com.aistudyhub.practice.entity.TestAttemptEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestAttemptRepository extends JpaRepository<TestAttemptEntity, Long> {
    Optional<TestAttemptEntity> findTopByUserIdAndQuestionIdOrderByEndTimeDesc(Long userId, Long questionId);
}
