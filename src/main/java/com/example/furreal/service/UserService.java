package com.example.furreal.service;

import com.example.furreal.dto.ApiResponse;
import com.example.furreal.model.User;
import com.example.furreal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    // ==================== PASSWORD HELPER METHODS ====================
    
    private String encodePassword(String password) {
        return Base64.getEncoder().encodeToString(password.getBytes());
    }
    
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return encodePassword(rawPassword).equals(encodedPassword);
    }
    
    public boolean verifyPassword(User user, String rawPassword) {
        return verifyPassword(rawPassword, user.getPasswordHash());
    }
    
    // ==================== AUTHENTICATION METHODS ====================
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User findUserById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }
    
    public void saveUser(User user) {
        userRepository.save(user);
    }
    
    private String generateToken(Long userId, String email) {
        return Base64.getEncoder().encodeToString(
            (userId + ":" + email + ":" + System.currentTimeMillis()).getBytes()
        );
    }
    
    // ==================== PUBLIC USER METHODS ====================
    
    public ApiResponse<?> getUserProfile(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ApiResponse.error("User not found");
            }
            return ApiResponse.success("User profile retrieved", convertToMap(user));
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve profile: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> updateUserProfile(Long userId, Map<String, String> userData) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ApiResponse.error("User not found");
            }
            
            if (userData.containsKey("name")) user.setName(userData.get("name"));
            if (userData.containsKey("email")) user.setEmail(userData.get("email"));
            if (userData.containsKey("phone")) user.setPhone(userData.get("phone"));
            
            userRepository.save(user);
            return ApiResponse.success("Profile updated successfully", convertToMap(user));
        } catch (Exception e) {
            return ApiResponse.error("Failed to update profile: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> changePassword(Long userId, String currentPassword, String newPassword) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ApiResponse.error("User not found");
            }
            
            if (!verifyPassword(currentPassword, user.getPasswordHash())) {
                return ApiResponse.error("Current password is incorrect");
            }
            
            if (newPassword.length() < 6) {
                return ApiResponse.error("New password must be at least 6 characters");
            }
            
            user.setPasswordHash(encodePassword(newPassword));
            userRepository.save(user);
            return ApiResponse.success("Password changed successfully", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to change password: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> deleteAccount(Long userId) {
        try {
            userRepository.deleteById(userId);
            return ApiResponse.success("Account deleted successfully", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete account: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> registerUser(Map<String, String> userData) {
        try {
            String email = userData.get("email");
            if (userRepository.existsByEmail(email)) {
                return ApiResponse.error("Email already registered");
            }
            
            User user = new User();
            user.setName(userData.get("name"));
            user.setEmail(email);
            user.setPhone(userData.get("phone"));
            user.setPasswordHash(encodePassword(userData.get("password")));
            user.setRole("user");
            user.setCreatedAt(LocalDateTime.now());
            
            User savedUser = userRepository.save(user);
            String token = generateToken(savedUser.getId(), savedUser.getEmail());
            
            Map<String, Object> result = convertToMap(savedUser);
            result.put("token", token);
            
            return ApiResponse.success("Registration successful", result);
        } catch (Exception e) {
            return ApiResponse.error("Registration failed: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> loginUser(String email, String password) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Invalid email or password");
            }
            
            User user = userOpt.get();
            if (!verifyPassword(password, user.getPasswordHash())) {
                return ApiResponse.error("Invalid email or password");
            }
            
            String token = generateToken(user.getId(), user.getEmail());
            Map<String, Object> result = convertToMap(user);
            result.put("token", token);
            
            return ApiResponse.success("Login successful", result);
        } catch (Exception e) {
            return ApiResponse.error("Login failed: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> updateProfilePicture(Long userId, String profilePicture) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ApiResponse.error("User not found");
            }
            user.setProfilePicture(profilePicture);
            userRepository.save(user);
            return ApiResponse.success("Profile picture updated", convertToMap(user));
        } catch (Exception e) {
            return ApiResponse.error("Failed to update profile picture: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> getProfilePicture(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ApiResponse.error("User not found");
            }
            Map<String, Object> result = new HashMap<>();
            result.put("profilePicture", user.getProfilePicture());
            return ApiResponse.success("Profile picture retrieved", result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve profile picture: " + e.getMessage());
        }
    }
    
    // ==================== ADMIN METHODS ====================
    
    public long getTotalUsersCount() {
        return userRepository.count();
    }
    
    public ApiResponse<?> getAllUsers(String role, String search) {
        try {
            List<User> users = userRepository.findAll();
            
            if (role != null && !role.equals("all")) {
                users = users.stream()
                    .filter(u -> u.getRole().equals(role))
                    .collect(Collectors.toList());
            }
            
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                users = users.stream()
                    .filter(u -> 
                        (u.getName() != null && u.getName().toLowerCase().contains(searchLower)) ||
                        (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower))
                    )
                    .collect(Collectors.toList());
            }
            
            List<Map<String, Object>> userList = users.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
            return ApiResponse.success("Users retrieved", userList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve users: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> createUser(Map<String, String> userData) {
        try {
            if (userRepository.existsByEmail(userData.get("email"))) {
                return ApiResponse.error("Email already exists");
            }
            
            User user = new User();
            user.setName(userData.get("name"));
            user.setEmail(userData.get("email"));
            user.setPhone(userData.get("phone"));
            user.setPasswordHash(encodePassword(userData.get("password")));
            user.setRole(userData.getOrDefault("role", "user"));
            user.setCreatedAt(LocalDateTime.now());
            
            User savedUser = userRepository.save(user);
            return ApiResponse.success("User created successfully", convertToMap(savedUser));
        } catch (Exception e) {
            return ApiResponse.error("Failed to create user: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> updateUserRole(Long userId, String role) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ApiResponse.error("User not found");
            }
            user.setRole(role);
            userRepository.save(user);
            return ApiResponse.success("User role updated", convertToMap(user));
        } catch (Exception e) {
            return ApiResponse.error("Failed to update role: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> deleteUser(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && "admin@furreal.com".equals(user.getEmail())) {
                return ApiResponse.error("Cannot delete main admin account");
            }
            userRepository.deleteById(userId);
            return ApiResponse.success("User deleted successfully", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete user: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> deleteAllUsers() {
        try {
            userRepository.deleteAll();
            
            // Re-create main admin account
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("admin@furreal.com");
            admin.setPhone("+1-555-9999");
            admin.setPasswordHash(encodePassword("admin123"));
            admin.setRole("admin");
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            
            return ApiResponse.success("All users deleted (admin preserved)", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete users: " + e.getMessage());
        }
    }
    
    // ==================== HELPER METHODS ====================
    
    private Map<String, Object> convertToMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole());
        map.put("joinedAt", user.getCreatedAt() != null ? user.getCreatedAt().format(dateFormatter) : "");
        map.put("profilePicture", user.getProfilePicture());
        return map;
    }
    
    // ==================== CREATE DEFAULT ADMIN ON STARTUP ====================
    public void createDefaultAdminIfNotExists() {
        if (!userRepository.existsByEmail("admin@furreal.com")) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("admin@furreal.com");
            admin.setPhone("+1-555-9999");
            admin.setPasswordHash(encodePassword("admin123"));
            admin.setRole("admin");
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println("Default admin account created: admin@furreal.com / admin123");
        }
    }
}