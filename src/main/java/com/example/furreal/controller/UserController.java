package com.example.furreal.controller;

import com.example.furreal.dto.ApiResponse;
import com.example.furreal.model.User;
import com.example.furreal.service.AdoptionService;
import com.example.furreal.service.PetService;
import com.example.furreal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PetService petService;
    
    @Autowired
    private AdoptionService adoptionService;
    
    @GetMapping("/{userId}/profile")
    public ApiResponse<?> getUserProfile(@PathVariable Long userId) {
        return userService.getUserProfile(userId);
    }
    
    @PutMapping("/{userId}/profile")
    public ApiResponse<?> updateUserProfile(@PathVariable Long userId, @RequestBody Map<String, String> userData) {
        return userService.updateUserProfile(userId, userData);
    }
    
    @PostMapping("/{userId}/change-password")
    public ApiResponse<?> changePassword(
            @PathVariable Long userId,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        return userService.changePassword(userId, currentPassword, newPassword);
    }
    
    @DeleteMapping("/{userId}")
    public ApiResponse<?> deleteAccount(@PathVariable Long userId) {
        return userService.deleteAccount(userId);
    }
    
    @GetMapping("/{userId}/pets")
    public ApiResponse<?> getMyPostedPets(@PathVariable Long userId) {
        return petService.getMyPostedPets(userId);
    }
    
    @GetMapping("/{userId}/adopted")
    public ApiResponse<?> getMyAdoptedPets(@PathVariable Long userId) {
        return adoptionService.getMyAdoptedPets(userId);
    }
    
    @GetMapping("/{userId}/adoption-requests")
    public ApiResponse<?> getMyAdoptionRequests(@PathVariable Long userId, @RequestParam String email) {
        return adoptionService.getMyAdoptionRequests(email);
    }
    
    // ==================== PROFILE PICTURE ENDPOINTS ====================
    
    @PutMapping("/{userId}/profile-picture")
    public ApiResponse<?> updateProfilePicture(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        try {
            String profilePicture = body.get("profilePicture");
            User user = userService.findUserById(userId);
            if (user == null) {
                return ApiResponse.error("User not found");
            }
            user.setProfilePicture(profilePicture);
            userService.saveUser(user);
            return ApiResponse.success("Profile picture updated", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to update profile picture: " + e.getMessage());
        }
    }
    
    @GetMapping("/{userId}/profile-picture")
    public ApiResponse<?> getProfilePicture(@PathVariable Long userId) {
        try {
            User user = userService.findUserById(userId);
            if (user == null) {
                return ApiResponse.error("User not found");
            }
            Map<String, Object> data = new HashMap<>();
            data.put("profilePicture", user.getProfilePicture());
            return ApiResponse.success("Profile picture retrieved", data);
        } catch (Exception e) {
            return ApiResponse.error("Failed to get profile picture: " + e.getMessage());
        }
    }
}