package com.aistudyhub.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.codec.ClientCodecConfigurer;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    private static final int MAX_FILE_BUFFER_BYTES = 50 * 1024 * 1024;

    @Bean
    public WebClient pythonAiWebClient(@Value("${ai.python-service.base-url}") String baseUrl) {
        return WebClient.builder().baseUrl(baseUrl).build();
    }

    @Bean
    public WebClient supabaseWebClient(@Value("${supabase.url}") String baseUrl) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .codecs(this::configureFileBuffer)
                .build();
    }

    private void configureFileBuffer(ClientCodecConfigurer codecs) {
        codecs.defaultCodecs().maxInMemorySize(MAX_FILE_BUFFER_BYTES);
    }
}
