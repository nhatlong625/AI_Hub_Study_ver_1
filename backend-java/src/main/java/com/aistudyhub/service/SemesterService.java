package com.aistudyhub.service;

import com.aistudyhub.dto.response.*;
import com.aistudyhub.entity.*;
import com.aistudyhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SemesterService {

    private final SemesterRepository semesterRepository;
    private final SubjectRepository subjectRepository;
    private final DocumentRepository documentRepository;

    public List<SemesterResponse> getAllSemesters() {
        return semesterRepository.findAll().stream().map(sem -> {
            SemesterResponse res = new SemesterResponse();
            res.setSemesterId(sem.getSemesterId());
            res.setSemesterName(sem.getSemesterName());

            List<SubjectResponse> subjects = subjectRepository.findBySemesterId(sem.getSemesterId())
                    .stream().map(sub -> {
                        SubjectResponse sr = new SubjectResponse();
                        sr.setSubjectId(sub.getSubjectId());
                        sr.setSubjectName(sub.getSubjectName());
                        sr.setDescription(sub.getDescription());

                        List<Document> docs = documentRepository.findBySubjectId(sub.getSubjectId());
                        sr.setDocumentCount(docs.size());
                        docs.stream()
                                .max(java.util.Comparator.comparing(Document::getCreatedAt))
                                .ifPresent(d -> {
                                    sr.setRecentDocId(d.getDocumentId());
                                    sr.setRecentDocTitle(d.getTitle());
                                    sr.setRecentDocName(d.getDocumentName());
                                    sr.setRecentDocType(d.getDocumentType());
                                    sr.setRecentDocUrl(d.getDocumentUrl());
                                    sr.setRecentDocUploadedAt(d.getCreatedAt() != null ? d.getCreatedAt().toString() : null);
                                });
                        return sr;
                    }).collect(Collectors.toList());

            res.setSubjects(subjects);
            return res;
        }).collect(Collectors.toList());
    }
}
