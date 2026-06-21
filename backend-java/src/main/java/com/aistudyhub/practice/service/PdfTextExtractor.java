package com.aistudyhub.practice.service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PdfTextExtractor {
    public String extractText(String documentUrl) {
        if (documentUrl == null || documentUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document URL is required.");
        }
        try (InputStream inputStream = openStream(documentUrl);
             PDDocument document = PDDocument.load(inputStream)) {
            return new PDFTextStripper().getText(document).replaceAll("\\s+", " ").trim();
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read PDF from document URL.", exception);
        }
    }

    private InputStream openStream(String documentUrl) throws IOException {
        String trimmed = documentUrl.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return new URL(trimmed).openStream();
        }
        if (trimmed.startsWith("file:")) {
            return Files.newInputStream(Path.of(URI.create(trimmed)));
        }
        return Files.newInputStream(Path.of(trimmed));
    }
}
