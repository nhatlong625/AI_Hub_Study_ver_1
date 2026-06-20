package com.aistudyhub.repository;
import com.aistudyhub.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findBySubjectId(Integer subjectId);
    List<Document> findByUserId(Integer userId);
    List<Document> findByUserIdAndSubjectId(Integer userId, Integer subjectId);
    List<Document> findByStatus(String status);
    List<Document> findBySubjectIdAndVisibilityStatus(Integer subjectId, String visibilityStatus);
    List<Document> findByVisibilityStatus(String visibilityStatus);
}
