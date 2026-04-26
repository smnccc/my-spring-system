package com.example.furreal.service;

import com.example.furreal.dto.*;
import com.example.furreal.model.User;
import com.example.furreal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    private String encodePassword(String password) {
        return Base64.getEncoder().encodeToString(password.getBytes());
    }
    
    private boolean verifyPassword(String rawPassword, String encodedPassword) {
        return encodePassword(rawPassword).equals(encodedPassword);
    }
    
    private String generateToken(Long userId, String email) {
        return Base64.getEncoder().encodeToString(
            (userId + ":" + email + ":" + System.currentTimeMillis()).getBytes()
        );
    }
    
    // ========== LOGIN ==========
    public ApiResponse<?> login(LoginRequest request) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Invalid email or password");
            }
            
            User user = userOpt.get();
            
            if (!verifyPassword(request.getPassword(), user.getPasswordHash())) {
                return ApiResponse.error("Invalid email or password");
            }
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("phone", user.getPhone());
            userData.put("role", user.getRole());
            
            String token = generateToken(user.getId(), user.getEmail());
            
            return ApiResponse.success("Login successful", userData, token);
        } catch (Exception e) {
            return ApiResponse.error("Login failed: " + e.getMessage());
        }
    }
    
    // ========== REGISTER ==========
    public ApiResponse<?> register(RegisterRequest request) {
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                return ApiResponse.error("Email already registered");
            }
            
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setPasswordHash(encodePassword(request.getPassword()));
            user.setRole("user");
            
            User savedUser = userRepository.save(user);
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("name", savedUser.getName());
            userData.put("email", savedUser.getEmail());
            userData.put("phone", savedUser.getPhone());
            userData.put("role", savedUser.getRole());
            
            String token = generateToken(savedUser.getId(), savedUser.getEmail());
            
            return ApiResponse.success("Registration successful", userData, token);
        } catch (Exception e) {
            return ApiResponse.error("Registration failed: " + e.getMessage());
        }
    }
    
    // ========== RESET PASSWORD (WITHOUT OTP - DIRECT) ==========
    public ApiResponse<?> resetPassword(String email, String newPassword) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ApiResponse.error("User not found");
            }
            
            User user = userOpt.get();
            
            if (newPassword == null || newPassword.length() < 6) {
                return ApiResponse.error("Password must be at least 6 characters");
            }
            
            user.setPasswordHash(encodePassword(newPassword));
            userRepository.save(user);
            
            return ApiResponse.success("Password reset successfully", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to reset password: " + e.getMessage());
        }
    }
    
    // ========== RESET PASSWORD WITH OTP ==========
    public ApiResponse<?> resetPasswordWithOTP(String email, String otpCode, String newPassword) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ApiResponse.error("User not found");
            }
            
            User user = userOpt.get();
            
            if (newPassword == null || newPassword.length() < 6) {
                return ApiResponse.error("Password must be at least 6 characters");
            }
            
            user.setPasswordHash(encodePassword(newPassword));
            userRepository.save(user);
            
            return ApiResponse.success("Password reset successfully", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to reset password: " + e.getMessage());
        }
    }
    
    // ========== CHANGE PASSWORD (WHILE LOGGED IN) ==========
    public ApiResponse<?> changePassword(Long userId, String currentPassword, String newPassword) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ApiResponse.error("User not found");
            }
            
            User user = userOpt.get();
            
            if (!verifyPassword(currentPassword, user.getPasswordHash())) {
                return ApiResponse.error("Current password is incorrect");
            }
            
            if (newPassword == null || newPassword.length() < 6) {
                return ApiResponse.error("New password must be at least 6 characters");
            }
            
            user.setPasswordHash(encodePassword(newPassword));
            userRepository.save(user);
            
            return ApiResponse.success("Password changed successfully", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to change password: " + e.getMessage());
        }
    }
    
    // ========== FORGOT PASSWORD (SEND OTP) ==========
    public ApiResponse<?> forgotPassword(String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Email not found");
            }
            
            // This will be handled by OTPService
            // Returns success to indicate email exists
            return ApiResponse.success("If email exists, OTP will be sent", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to process request: " + e.getMessage());
        }
    }
    
    // ========== LOGOUT ==========
    public ApiResponse<?> logout() {
        return ApiResponse.success("Logged out successfully", null);
    }
}