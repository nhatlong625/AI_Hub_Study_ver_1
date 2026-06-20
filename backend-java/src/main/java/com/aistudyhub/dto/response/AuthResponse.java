package com.aistudyhub.dto.response;
import lombok.*;
@Data @AllArgsConstructor(staticName = "of")
public class AuthResponse {
    private String token;
    private Integer userId;
    private String email;
    private String fullName;
    private String role;
}
