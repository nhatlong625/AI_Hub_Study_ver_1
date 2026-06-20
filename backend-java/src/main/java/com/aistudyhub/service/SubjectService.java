package com.aistudyhub.service;

import com.aistudyhub.entity.Document;
import com.aistudyhub.entity.Subject;
import com.aistudyhub.repository.DocumentRepository;
import com.aistudyhub.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final DocumentRepository documentRepository;
    private final WebClient supabaseWebClient;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucket;

    public List<Subject> getBySemester(Integer semesterId) {
        return subjectRepository.findBySemesterId(semesterId);
    }

    @Transactional
    public Subject addSubject(Integer semesterId, String name, String description) {
        Subject s = new Subject();
        s.setSemesterId(semesterId);
        s.setSubjectName(name);
        s.setDescription(description);
        s.setCreatedAt(LocalDateTime.now());
        return subjectRepository.save(s);
    }

    @Transactional
    public void deleteSubject(Integer subjectId) {
        // 1. Lấy tất cả documents của subject
        List<Document> docs = documentRepository.findBySubjectId(subjectId);

        // 2. Xóa từng file trên Supabase
        for (Document doc : docs) {
            if (doc.getDocumentUrl() != null) {
                String fileName = doc.getDocumentUrl()
                        .replaceFirst(".*/public/" + bucket + "/", "");
                try {
                    supabaseWebClient.delete()
                            .uri("/storage/v1/object/" + bucket + "/" + fileName)
                            .header("apikey", supabaseKey)
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                            .retrieve()
                            .toBodilessEntity()
                            .block();
                } catch (Exception ignored) {}
            }
        }

        // 3. Xóa documents trong DB
        documentRepository.deleteAll(docs);

        // 4. Xóa subject
        subjectRepository.deleteById(subjectId);
    }
}