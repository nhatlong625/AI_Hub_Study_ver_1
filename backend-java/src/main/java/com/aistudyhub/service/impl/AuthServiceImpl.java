package com.aistudyhub.service.impl;

import com.aistudyhub.dto.request.*;
import com.aistudyhub.dto.response.*;
import com.aistudyhub.entity.*;
import com.aistudyhub.exception.*;
import com.aistudyhub.repository.*;
import com.aistudyhub.security.JwtTokenProvider;
import com.aistudyhub.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already exists");

        // roleId = 1 = STUDENT (mặc định)
        Integer studentRoleId = resolveStudentRoleId();

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roleId(studentRoleId)
                .status("Active")
                .build();
        userRepository.save(user);

        String tokenValue = UUID.randomUUID().toString();
        authTokenRepository.save(AuthToken.builder()
                .user(user)
                .token(tokenValue)
                .tokenType(TokenType.EMAIL_VERIFY)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .isUsed(false)
                .build());

        try { emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), tokenValue); }
        catch (Exception ignored) {}

        return MessageResponse.ok("Registration successful. Please check your email to verify your account.");
    }

    @Override
    @Transactional
    public MessageResponse verifyEmail(String token) {
        // Email verify chưa dùng — trả về OK
        AuthToken authToken = getToken(token, TokenType.EMAIL_VERIFY);
        authToken.setIsUsed(true);
        authTokenRepository.save(authToken);
        return MessageResponse.ok("Email verified successfully.");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new BadRequestException("Invalid email or password");
        String roleName = user.getRoleId() != null && user.getRoleId() == 2 ? "ADMIN" : "STUDENT";
        String jwt = jwtTokenProvider.generateToken(user, user.getUserId());
        return AuthResponse.of(jwt, user.getUserId(), user.getEmail(), user.getFullName(), roleName);
    }

    @Override
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            authTokenRepository.invalidateTokensByUserAndType(user, TokenType.PASSWORD_RESET);
            String tokenValue = UUID.randomUUID().toString();
            authTokenRepository.save(AuthToken.builder()
                    .user(user).token(tokenValue)
                    .tokenType(TokenType.PASSWORD_RESET)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .isUsed(false).build());
            try { emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), tokenValue); }
            catch (Exception ignored) {}
        });
        return MessageResponse.ok("If the email exists, a reset link has been sent.");
    }

    @Override
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        AuthToken authToken = getToken(request.getToken(), TokenType.PASSWORD_RESET);
        User user = authToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        authToken.setIsUsed(true);
        authTokenRepository.save(authToken);
        return MessageResponse.ok("Password reset successfully.");
    }

    private AuthToken getToken(String tokenValue, TokenType expectedType) {
        AuthToken t = authTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new BadRequestException("Invalid token"));
        if (t.getIsUsed()) throw new BadRequestException("Token already used");
        if (t.getExpiresAt().isBefore(LocalDateTime.now())) throw new TokenExpiredException("Token expired");
        if (t.getTokenType() != expectedType) throw new BadRequestException("Invalid token type");
        return t;
    }

    private Integer resolveStudentRoleId() {
        jdbcTemplate.update("""
                IF NOT EXISTS (
                    SELECT 1 FROM dbo.ROLE WHERE UPPER(role_name) IN ('STUDENT', 'USER')
                )
                INSERT INTO dbo.ROLE (role_name, description, created_at)
                VALUES ('STUDENT', 'Default student role', GETDATE())
                """);

        return jdbcTemplate.queryForObject("""
                SELECT TOP 1 role_id
                FROM dbo.ROLE
                WHERE UPPER(role_name) IN ('STUDENT', 'USER')
                ORDER BY CASE WHEN UPPER(role_name) = 'STUDENT' THEN 0 ELSE 1 END
                """, Integer.class);
    }
}
