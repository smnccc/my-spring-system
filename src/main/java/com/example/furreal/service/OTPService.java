package com.example.furreal.service;

import com.example.furreal.dto.ApiResponse;
import com.example.furreal.model.OTP;
import com.example.furreal.repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;  // ✅ IDAGDAG ITO
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class OTPService {
    
    @Autowired
    private OTPRepository otpRepository;
    
    @Autowired
    private EmailService emailService;
    
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int OTP_EXPIRY_MINUTES = 10;
    
    public String generateOTP() {
        return String.format("%06d", secureRandom.nextInt(1000000));
    }
    
    @Transactional  // ✅ IDAGDAG ITO
    public ApiResponse<?> sendOTP(String email, String purpose) {
        try {
            // Delete existing unused OTPs for this email and purpose
            otpRepository.deleteByEmailAndPurpose(email, purpose);
            
            // Generate new OTP
            String otpCode = generateOTP();
            
            // Create and save OTP entity
            OTP otp = new OTP();
            otp.setEmail(email);
            otp.setOtpCode(otpCode);
            otp.setPurpose(purpose);
            otp.setUsed(false);
            otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
            
            otpRepository.save(otp);  // ✅ Ngayon may transaction na ito
            
            // Send email
            emailService.sendOTPEmail(email, otpCode, purpose);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent successfully to " + email);
            response.put("expiresIn", OTP_EXPIRY_MINUTES + " minutes");
            
            return ApiResponse.success("OTP sent successfully", response);
        } catch (Exception e) {
            return ApiResponse.error("Failed to send OTP: " + e.getMessage());
        }
    }
    
    @Transactional  // ✅ IDAGDAG ITO
    public ApiResponse<?> verifyOTP(String email, String otpCode, String purpose) {
        try {
            OTP otp = otpRepository.findByEmailAndOtpCodeAndPurposeAndIsUsedFalse(email, otpCode, purpose)
                .orElse(null);
            
            if (otp == null) {
                return ApiResponse.error("Invalid OTP code");
            }
            
            if (otp.isExpired()) {
                otpRepository.delete(otp);
                return ApiResponse.error("OTP has expired. Please request a new one.");
            }
            
            // Mark as used
            otp.setUsed(true);
            otpRepository.save(otp);  // ✅ Ngayon may transaction na ito
            
            Map<String, Object> response = new HashMap<>();
            response.put("verified", true);
            response.put("message", "OTP verified successfully");
            
            return ApiResponse.success("OTP verified", response);
        } catch (Exception e) {
            return ApiResponse.error("Failed to verify OTP: " + e.getMessage());
        }
    }
    
    public void cleanupExpiredOTPs() {
        otpRepository.findAll().stream()
            .filter(OTP::isExpired)
            .forEach(otpRepository::delete);
    }
}