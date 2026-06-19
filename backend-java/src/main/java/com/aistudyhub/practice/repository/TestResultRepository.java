package com.aistudyhub.practice.repository;

import com.aistudyhub.practice.entity.TestResultEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestResultRepository extends JpaRepository<TestResultEntity, Long> {
    Optional<TestResultEntity> findByAttemptId(Long attemptId);
}
