package com.aistudyhub.practice.repository;

import com.aistudyhub.practice.entity.AnswerOptionEntity;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerOptionRepository extends JpaRepository<AnswerOptionEntity, Long> {
    List<AnswerOptionEntity> findByQuestionIdIn(Collection<Long> questionIds);
}
