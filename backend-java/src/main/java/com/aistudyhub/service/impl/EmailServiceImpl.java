package com.aistudyhub.service.impl;

import com.aistudyhub.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.email-verify-url}")
    private String verifyUrl;

    @Value("${app.password-reset-url}")
    private String resetUrl;

    @Override
    public void sendVerificationEmail(String to, String fullName, String token) {
        String link = verifyUrl + "?token=" + token;
        sendHtmlEmail(to, "Verify your email - AI Study Hub",
            """
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;
                        border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
                <h2 style="color: #333;">Welcome to AI Study Hub, %s!</h2>
                <p style="color: #555;">Please click the button below to verify your email address.</p>
                <a href="%s"
                   style="display: inline-block; background: #4F46E5; color: white;
                          padding: 12px 32px; text-decoration: none; border-radius: 6px;
                          font-weight: bold; margin: 16px 0;">
                    Verify Email
                </a>
                <p style="color: #999; font-size: 12px;">
                    This link expires in 24 hours.<br>
                    If you did not create this account, please ignore this email.
                </p>
            </div>
            """.formatted(fullName, link));
    }

    @Override
    public void sendPasswordResetEmail(String to, String fullName, String token) {
        String link = resetUrl + "?token=" + token;
        sendHtmlEmail(to, "Reset your password - AI Study Hub",
            """
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;
                        border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="color: #555;">Hi %s, click the button below to reset your password.</p>
                <a href="%s"
                   style="display: inline-block; background: #F59E0B; color: white;
                          padding: 12px 32px; text-decoration: none; border-radius: 6px;
                          font-weight: bold; margin: 16px 0;">
                    Reset Password
                </a>
                <p style="color: #999; font-size: 12px;">
                    This link expires in 15 minutes.<br>
                    If you did not request this, please ignore this email.
                </p>
            </div>
            """.formatted(fullName, link));
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
