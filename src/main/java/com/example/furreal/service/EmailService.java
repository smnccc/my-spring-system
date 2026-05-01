package com.example.furreal.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.SendEmailRequest;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${RESEND_API_KEY}")
    private String apiKey;

    private Resend resend;

    @PostConstruct
    public void init() {
        resend = new Resend(apiKey);
    }

    public void sendOTPEmail(String toEmail, String otpCode, String purpose) {
        String subject;
        String htmlBody;
        
        if ("REGISTRATION".equals(purpose)) {
            subject = "🐾 FurReal - Verify Your Email Address";
            htmlBody = String.format(
                "<div style='font-family: Arial, sans-serif; padding: 20px;'>" +
                "<h2 style='color: #6EE7B7;'>Welcome to FurReal! 🐾</h2>" +
                "<p>Thank you for joining our pet adoption community!</p>" +
                "<p>Your verification code is:</p>" +
                "<h1 style='font-size: 32px; color: #6EE7B7; letter-spacing: 5px;'>%s</h1>" +
                "<p>This code will expire in <strong>10 minutes</strong>.</p>" +
                "<br/><p>Best regards,<br/>The FurReal Team 🐕🐈</p></div>",
                otpCode
            );
        } else if ("FORGOT_PASSWORD".equals(purpose)) {
            subject = "🔐 FurReal - Password Reset Request";
            htmlBody = String.format(
                "<div style='font-family: Arial, sans-serif; padding: 20px;'>" +
                "<h2 style='color: #6EE7B7;'>Password Reset Request 🔐</h2>" +
                "<p>We received a request to reset your password.</p>" +
                "<p>Your OTP verification code is:</p>" +
                "<h1 style='font-size: 32px; color: #6EE7B7; letter-spacing: 5px;'>%s</h1>" +
                "<p>This code will expire in <strong>10 minutes</strong>.</p>" +
                "<br/><p>If you did not request this, please ignore this email.</p>" +
                "<p>Best regards,<br/>The FurReal Team 🐾</p></div>",
                otpCode
            );
        } else {
            subject = "FurReal - Verification Code";
            htmlBody = String.format(
                "<h2>Your verification code is: <strong style='font-size: 28px;'>%s</strong></h2>" +
                "<p>This code expires in 10 minutes.</p>",
                otpCode
            );
        }

        SendEmailRequest request = SendEmailRequest.builder()
                .from("FurReal <onboarding@resend.dev>")
                .to(toEmail)
                .subject(subject)
                .html(htmlBody)
                .build();

        try {
            resend.emails().send(request);
            System.out.println("✅ OTP email sent successfully to: " + toEmail);
        } catch (ResendException e) {
            System.out.println("❌ Failed to send email: " + e.getMessage());
            // I-print pa rin ang OTP sa logs para may backup
            System.out.println("⚠️ OTP for " + toEmail + ": " + otpCode);
        }
    }
}
