package com.example.furreal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired(required = false)  // ← ITO LANG ANG BAGO (optional)
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")  // ← ITO LANG ANG BAGO (may default)
    private String fromEmail;
    
    public void sendOTPEmail(String toEmail, String otpCode, String purpose) {
        // ITO LANG ANG BAGO (check if available)
        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            System.out.println("⚠️ Email not configured. OTP: " + otpCode + " for " + toEmail);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(getSubject(purpose));
            message.setText(getEmailBody(otpCode, purpose));
            mailSender.send(message);
            System.out.println("✅ OTP email sent to: " + toEmail);
        } catch (Exception e) {
            System.out.println("❌ Email failed: " + e.getMessage());
        }
    }
    
    private String getSubject(String purpose) {
        if ("REGISTRATION".equals(purpose)) {
            return "🐾 FurReal - Verify Your Email Address";
        } else if ("FORGOT_PASSWORD".equals(purpose)) {
            return "🔐 FurReal - Password Reset Request";
        }
        return "FurReal - Verification Code";
    }
    
    private String getEmailBody(String otpCode, String purpose) {
        if ("REGISTRATION".equals(purpose)) {
            return String.format(
                "Welcome to FurReal! 🐾\n\n" +
                "Thank you for joining our pet adoption community!\n\n" +
                "Your verification code is: %s\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "Please enter this code to complete your registration.\n\n" +
                "Best regards,\n" +
                "The FurReal Team 🐕🐈",
                otpCode
            );
        } else if ("FORGOT_PASSWORD".equals(purpose)) {
            return String.format(
                "Password Reset Request 🔐\n\n" +
                "We received a request to reset your password for your FurReal account.\n\n" +
                "Your OTP verification code is: %s\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The FurReal Team 🐾",
                otpCode
            );
        }
        return String.format("Your FurReal verification code is: %s\n\nThis code expires in 10 minutes.", otpCode);
    }
}
