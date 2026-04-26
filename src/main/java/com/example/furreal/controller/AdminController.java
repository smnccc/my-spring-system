package com.example.furreal.controller;

import com.example.furreal.dto.ApiResponse;
import com.example.furreal.dto.LoginRequest;
import com.example.furreal.service.AdoptionService;
import com.example.furreal.service.PetService;
import com.example.furreal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private PetService petService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AdoptionService adoptionService;
    
    // ========== ADMIN AUTHENTICATION ==========
    @PostMapping("/auth/login")
    public ApiResponse<?> adminLogin(@RequestBody LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        
        if ("admin@furreal.com".equals(email) && "admin123".equals(password)) {
            Map<String, Object> adminData = new HashMap<>();
            adminData.put("id", 1L);
            adminData.put("name", "Super Admin");
            adminData.put("email", "admin@furreal.com");
            adminData.put("role", "admin");
            adminData.put("token", generateAdminToken(email));
            return ApiResponse.success("Admin login successful", adminData);
        }
        
        var user = userService.findByEmail(email);
        if (user != null && user.isPresent() && "admin".equals(user.get().getRole())) {
            if (userService.verifyPassword(user.get(), password)) {
                Map<String, Object> adminData = new HashMap<>();
                adminData.put("id", user.get().getId());
                adminData.put("name", user.get().getName());
                adminData.put("email", user.get().getEmail());
                adminData.put("role", user.get().getRole());
                adminData.put("token", generateAdminToken(email));
                return ApiResponse.success("Admin login successful", adminData);
            }
        }
        return ApiResponse.error("Invalid admin credentials");
    }
    
    @PostMapping("/auth/logout")
    public ApiResponse<?> adminLogout() {
        return ApiResponse.success("Logged out successfully", null);
    }
    
    private String generateAdminToken(String email) {
        return java.util.Base64.getEncoder().encodeToString(
            (email + ":" + System.currentTimeMillis()).getBytes()
        );
    }
    
    // ========== DASHBOARD STATS ==========
    @GetMapping("/stats")
    public ApiResponse<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPets", petService.getTotalPetsCount());
        stats.put("totalAdoptions", adoptionService.getTotalAdoptionsCount());
        stats.put("totalUsers", userService.getTotalUsersCount());
        stats.put("pendingReviews", petService.getPendingPetsCount() + adoptionService.getPendingAdoptionsCount());
        return ApiResponse.success("Stats retrieved", stats);
    }
    
    // ========== PET MANAGEMENT ==========
    @GetMapping("/pets")
    public ApiResponse<?> getAllPets(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return petService.getAllPetsForAdmin(type, status, search);
    }
    
    @GetMapping("/pets/pending")
    public ApiResponse<?> getPendingPets() {
        return petService.getPendingPets();
    }
    
    // ✅ IDAGDAG ITO - POST method para sa pag-add ng pet
    @PostMapping("/pets")
    public ApiResponse<?> createPet(@RequestBody Map<String, String> petData) {
        return petService.createPetByAdmin(petData);
    }
    
    // ✅ IDAGDAG ITO - PUT method para sa pag-update ng pet
    @PutMapping("/pets/{id}")
    public ApiResponse<?> updatePet(@PathVariable Long id, @RequestBody Map<String, Object> petData) {
        return petService.updatePetByAdmin(id, petData);
    }
    
    @PutMapping("/pets/{id}/approve")
    public ApiResponse<?> approvePet(@PathVariable Long id) {
        return petService.approvePet(id);
    }
    
    @PutMapping("/pets/{id}/reject")
    public ApiResponse<?> rejectPet(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return petService.rejectPet(id, reason);
    }
    
    @DeleteMapping("/pets/{id}")
    public ApiResponse<?> deletePet(@PathVariable Long id) {
        return petService.deletePet(id);
    }
    
    // ========== USER MANAGEMENT ==========
    @GetMapping("/users")
    public ApiResponse<?> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        return userService.getAllUsers(role, search);
    }
    
    @PostMapping("/users")
    public ApiResponse<?> createUser(@RequestBody Map<String, String> userData) {
        return userService.createUser(userData);
    }
    
    @PutMapping("/users/{id}/role")
    public ApiResponse<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userService.updateUserRole(id, body.get("role"));
    }
    
    @DeleteMapping("/users/{id}")
    public ApiResponse<?> deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }
    
    // ========== ADOPTION MANAGEMENT ==========
    @GetMapping("/adoptions")
    public ApiResponse<?> getAllAdoptions(@RequestParam(required = false) String status) {
        return adoptionService.getAllAdoptions(status);
    }
    
    @GetMapping("/adoptions/pending")
    public ApiResponse<?> getPendingAdoptions() {
        return adoptionService.getPendingAdoptions();
    }
    
    @PutMapping("/adoptions/{id}/approve")
    public ApiResponse<?> approveAdoption(@PathVariable Long id) {
        return adoptionService.approveAdoption(id);
    }
    
    @PutMapping("/adoptions/{id}/reject")
    public ApiResponse<?> rejectAdoption(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return adoptionService.rejectAdoption(id, reason);
    }
    
    @PutMapping("/adoptions/{id}/complete")
    public ApiResponse<?> completeAdoption(@PathVariable Long id) {
        return adoptionService.completeAdoption(id);
    }
    
    // ========== DANGER ZONE ==========
    @DeleteMapping("/danger/clear-pets")
    public ApiResponse<?> clearAllPets() {
        return petService.clearAllPets();
    }
    
    @DeleteMapping("/danger/delete-users")
    public ApiResponse<?> deleteAllUsers() {
        return userService.deleteAllUsers();
    }
    
    @PostMapping("/danger/reset-db")
    public ApiResponse<?> resetDatabase() {
        petService.clearAllPets();
        userService.deleteAllUsers();
        adoptionService.clearAllAdoptions();
        return ApiResponse.success("Database reset successfully", null);
    }
}