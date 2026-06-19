package com.aistudyhub.practice.repository;

import com.aistudyhub.practice.entity.UserAnswerEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAnswerRepository extends JpaRepository<UserAnswerEntity, Long> {
    List<UserAnswerEntity> findByAttemptIdOrderByIdAsc(Long attemptId);
}
