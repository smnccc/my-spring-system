package com.example.furreal.controller;

import com.example.furreal.dto.*;
import com.example.furreal.service.AuthService;
import com.example.furreal.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private OTPService otpService;
    
    // ========== BASIC AUTH ENDPOINTS ==========
    
    @PostMapping("/login")
    public ApiResponse<?> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
    
    @PostMapping("/register")
    public ApiResponse<?> register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }
    
    @PostMapping("/logout")
    public ApiResponse<?> logout() {
        return ApiResponse.success("Logged out successfully", null);
    }
    
    // ========== OTP ENDPOINTS ==========
    
    @PostMapping("/send-otp")
    public ApiResponse<?> sendOTP(@RequestBody OTPRequest request) {
        return otpService.sendOTP(request.getEmail(), request.getPurpose());
    }
    
    @PostMapping("/verify-otp")
    public ApiResponse<?> verifyOTP(@RequestBody OTPRequest request) {
        return otpService.verifyOTP(request.getEmail(), request.getOtpCode(), request.getPurpose());
    }
    
    // ========== PASSWORD RESET ENDPOINTS ==========
    
    @PostMapping("/forgot-password")
    public ApiResponse<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return otpService.sendOTP(request.getEmail(), "FORGOT_PASSWORD");
    }
    
    @PostMapping("/reset-password")
    public ApiResponse<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        // First verify OTP
        ApiResponse<?> otpVerification = otpService.verifyOTP(
            request.getEmail(), 
            request.getOtpCode(), 
            "FORGOT_PASSWORD"
        );
        
        if (!otpVerification.isSuccess()) {
            return otpVerification;
        }
        
        // Then reset password
        return authService.resetPassword(request.getEmail(), request.getNewPassword());
    }
    
    // ========== CHANGE PASSWORD (WHILE LOGGED IN) ==========
    
    @PostMapping("/change-password")
    public ApiResponse<?> changePassword(@RequestBody ChangePasswordRequest request) {
        return authService.changePassword(
            request.getUserId(),
            request.getCurrentPassword(),
            request.getNewPassword()
        );
    }
}