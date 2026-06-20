package com.aistudyhub.service;
import com.aistudyhub.dto.request.*;
import com.aistudyhub.dto.response.*;
public interface AuthService {
    MessageResponse register(RegisterRequest request);
    MessageResponse verifyEmail(String token);
    AuthResponse login(LoginRequest request);
    MessageResponse forgotPassword(ForgotPasswordRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);
}
