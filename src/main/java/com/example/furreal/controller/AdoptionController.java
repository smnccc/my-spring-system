package com.example.furreal.controller;

import com.example.furreal.dto.AdoptionRequest;
import com.example.furreal.dto.ApiResponse;
import com.example.furreal.service.AdoptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/adoptions")
@CrossOrigin(origins = "*")
public class AdoptionController {
    
    @Autowired
    private AdoptionService adoptionService;
    
    // ========== ADOPTION REQUESTS ==========
    
    @PostMapping
    public ApiResponse<?> submitAdoptionRequest(@RequestBody AdoptionRequest request) {
        return adoptionService.submitAdoptionRequest(request);
    }
    
    @GetMapping("/user/{email}")
    public ApiResponse<?> getUserAdoptionRequests(@PathVariable String email) {
        return adoptionService.getMyAdoptionRequests(email);
    }
    
    @GetMapping("/user/{userId}/adopted")
    public ApiResponse<?> getMyAdoptedPets(@PathVariable Long userId) {
        return adoptionService.getMyAdoptedPets(userId);
    }
    
    @PutMapping("/{id}/status")
    public ApiResponse<?> updateAdoptionStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        switch (status) {
            case "approved":
                return adoptionService.approveAdoption(id);
            case "rejected":
                return adoptionService.rejectAdoption(id, null);
            case "completed":
                return adoptionService.completeAdoption(id);
            default:
                return ApiResponse.error("Invalid status");
        }
    }
    
    // ========== WAIVER ENDPOINTS ==========
    
    @GetMapping("/waiver/template")
    public ResponseEntity<byte[]> downloadWaiverTemplate() {
        return adoptionService.downloadWaiverTemplate();
    }
    
    @PostMapping("/{adoptionId}/waiver")
    public ApiResponse<?> uploadSignedWaiver(
            @PathVariable Long adoptionId,
            @RequestParam("waiver") MultipartFile file) {
        return adoptionService.uploadSignedWaiver(adoptionId, file);
    }
    
    @GetMapping("/{adoptionId}/waiver")
    public ResponseEntity<byte[]> getWaiver(@PathVariable Long adoptionId) {
        return adoptionService.getWaiverFile(adoptionId);
    }
    
    // ========== PAYMENT ENDPOINTS ==========
    
    @PostMapping("/{adoptionId}/payment")
    public ApiResponse<?> createPayment(
            @PathVariable Long adoptionId,
            @RequestBody Map<String, Double> request) {
        double amount = request.getOrDefault("amount", 500.0);
        return adoptionService.createPayment(adoptionId, amount);
    }
    
    @PostMapping("/payment/{paymentId}/process")
    public ApiResponse<?> processPayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, String> request) {
        String method = request.get("method");
        String referenceNumber = request.get("referenceNumber");
        return adoptionService.processPayment(paymentId, method, referenceNumber);
    }
    
    @GetMapping("/payment/{paymentId}/status")
    public ApiResponse<?> getPaymentStatus(@PathVariable Long paymentId) {
        return adoptionService.getPaymentStatus(paymentId);
    }
}