package com.example.furreal.service;

import com.example.furreal.dto.AdoptionRequest;
import com.example.furreal.dto.ApiResponse;
import com.example.furreal.model.Adoption;
import com.example.furreal.model.Pet;
import com.example.furreal.model.User;
import com.example.furreal.repository.AdoptionRepository;
import com.example.furreal.repository.PetRepository;
import com.example.furreal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdoptionService {
    
    @Autowired
    private AdoptionRepository adoptionRepository;
    
    @Autowired
    private PetRepository petRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private static final String WAIVER_STORAGE_PATH = "uploads/waivers/";
    
    // In-memory payment storage (replace with database table later)
    private final Map<Long, Payment> payments = new HashMap<>();
    private Long nextPaymentId = 1L;
    
    // ==================== SUBMIT ADOPTION REQUEST ====================
    public ApiResponse<?> submitAdoptionRequest(AdoptionRequest request) {
        try {
            Pet pet = petRepository.findById(request.getPetId()).orElse(null);
            if (pet == null) {
                return ApiResponse.error("Pet not found");
            }
            
            if (Boolean.TRUE.equals(pet.getAdopted())) {
                return ApiResponse.error("This pet has already been adopted");
            }
            
            Adoption adoption = new Adoption();
            adoption.setPetId(request.getPetId());
            adoption.setPetName(pet.getName());
            adoption.setPetImage(pet.getImageUrl());
            adoption.setAdopterName(request.getName());
            adoption.setAdopterEmail(request.getEmail());
            adoption.setAdopterPhone(request.getPhone());
            adoption.setMessage(request.getMessage());
            adoption.setStatus("pending");
            adoption.setRequestDate(LocalDateTime.now());
            adoption.setCreatedAt(LocalDateTime.now());
            
            Adoption savedAdoption = adoptionRepository.save(adoption);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", savedAdoption.getId());
            result.put("status", savedAdoption.getStatus());
            result.put("petName", pet.getName());
            
            return ApiResponse.success("Adoption request submitted", result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to submit adoption request: " + e.getMessage());
        }
    }
    
    // ==================== GET MY ADOPTION REQUESTS ====================
    public ApiResponse<?> getMyAdoptionRequests(String email) {
        try {
            List<Adoption> adoptions = adoptionRepository.findByAdopterEmail(email);
            List<Map<String, Object>> adoptionList = adoptions.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
            return ApiResponse.success("Your adoption requests retrieved", adoptionList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve adoption requests: " + e.getMessage());
        }
    }
    
    // ==================== GET MY ADOPTED PETS ====================
    public ApiResponse<?> getMyAdoptedPets(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ApiResponse.error("User not found");
            }
            
            List<Adoption> completedAdoptions = adoptionRepository.findByAdopterEmailAndStatus(user.getEmail(), "completed");
            
            List<Map<String, Object>> adoptedPetsList = new ArrayList<>();
            
            for (Adoption adoption : completedAdoptions) {
                Pet pet = petRepository.findById(adoption.getPetId()).orElse(null);
                if (pet != null) {
                    Map<String, Object> adoptedPet = new HashMap<>();
                    adoptedPet.put("id", pet.getId());
                    adoptedPet.put("name", pet.getName());
                    adoptedPet.put("type", pet.getType());
                    adoptedPet.put("breed", pet.getBreed());
                    adoptedPet.put("age", pet.getAge());
                    adoptedPet.put("image", pet.getImageUrl());
                    adoptedPet.put("adoptedDate", adoption.getFormattedDate());
                    adoptedPet.put("status", adoption.getStatus());
                    adoptedPetsList.add(adoptedPet);
                }
            }
            
            return ApiResponse.success("Your adopted pets retrieved", adoptedPetsList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve adopted pets: " + e.getMessage());
        }
    }
    
    // ==================== ADMIN METHODS ====================
    
    public int getTotalAdoptionsCount() {
        return (int) adoptionRepository.count();
    }
    
    public int getPendingAdoptionsCount() {
        return adoptionRepository.findByStatus("pending").size();
    }
    
    public ApiResponse<?> getAllAdoptions(String status) {
        try {
            List<Adoption> adoptions;
            if (status != null && !status.equals("all")) {
                adoptions = adoptionRepository.findByStatus(status);
            } else {
                adoptions = adoptionRepository.findAll();
            }
            
            List<Map<String, Object>> adoptionList = adoptions.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
            return ApiResponse.success("Adoptions retrieved", adoptionList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve adoptions: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> getPendingAdoptions() {
        try {
            List<Adoption> pendingAdoptions = adoptionRepository.findByStatus("pending");
            List<Map<String, Object>> adoptionList = pendingAdoptions.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
            return ApiResponse.success("Pending adoptions retrieved", adoptionList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve pending adoptions: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> approveAdoption(Long id) {
        try {
            Adoption adoption = adoptionRepository.findById(id).orElse(null);
            if (adoption == null) {
                return ApiResponse.error("Adoption not found");
            }
            
            adoption.setStatus("approved");
            adoption.setUpdatedAt(LocalDateTime.now());
            adoptionRepository.save(adoption);
            
            return ApiResponse.success("Adoption approved", convertToMap(adoption));
        } catch (Exception e) {
            return ApiResponse.error("Failed to approve adoption: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> rejectAdoption(Long id, String reason) {
        try {
            Adoption adoption = adoptionRepository.findById(id).orElse(null);
            if (adoption == null) {
                return ApiResponse.error("Adoption not found");
            }
            
            adoption.setStatus("rejected");
            adoption.setRejectionReason(reason);
            adoption.setUpdatedAt(LocalDateTime.now());
            adoptionRepository.save(adoption);
            
            return ApiResponse.success("Adoption rejected", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to reject adoption: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> completeAdoption(Long id) {
        try {
            Adoption adoption = adoptionRepository.findById(id).orElse(null);
            if (adoption == null) {
                return ApiResponse.error("Adoption not found");
            }
            
            adoption.setStatus("completed");
            adoption.setUpdatedAt(LocalDateTime.now());
            adoptionRepository.save(adoption);
            
            // Mark pet as adopted
            Pet pet = petRepository.findById(adoption.getPetId()).orElse(null);
            if (pet != null) {
                pet.setAdopted(true);
                pet.setUpdatedAt(LocalDateTime.now());
                petRepository.save(pet);
            }
            
            return ApiResponse.success("Adoption completed", convertToMap(adoption));
        } catch (Exception e) {
            return ApiResponse.error("Failed to complete adoption: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> clearAllAdoptions() {
        try {
            adoptionRepository.deleteAll();
            return ApiResponse.success("All adoptions cleared", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to clear adoptions: " + e.getMessage());
        }
    }
    
    // ==================== WAIVER METHODS ====================
    
    public ResponseEntity<byte[]> downloadWaiverTemplate() {
        try {
            // Try to load custom waiver PDF from resources
            Resource resource = new ClassPathResource("static/waiver/furreal_adoption_waiver.pdf");
            
            if (resource.exists()) {
                byte[] content = resource.getContentAsByteArray();
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"FurReal_Adoption_Waiver.pdf\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(content);
            }
            
            // Fallback PDF if template not found
            byte[] fallbackPdf = createFallbackWaiverPdf();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"FurReal_Adoption_Waiver.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(fallbackPdf);
                    
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    public ApiResponse<?> uploadSignedWaiver(Long adoptionId, MultipartFile file) {
        try {
            Adoption adoption = adoptionRepository.findById(adoptionId).orElse(null);
            if (adoption == null) {
                return ApiResponse.error("Adoption not found");
            }
            
            // Create directory if not exists
            Path uploadPath = Paths.get(WAIVER_STORAGE_PATH);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Validate file
            if (file.isEmpty()) {
                return ApiResponse.error("File is empty");
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("application/pdf") && 
                !contentType.startsWith("image/"))) {
                return ApiResponse.error("Only PDF and image files are allowed");
            }
            
            // Save file
            String extension = contentType.equals("application/pdf") ? ".pdf" : ".jpg";
            String fileName = "waiver_" + adoptionId + "_" + UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Save waiver filename to adoption record
            adoption.setWaiverFileName(fileName);
            adoption.setUpdatedAt(LocalDateTime.now());
            adoptionRepository.save(adoption);
            
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("message", "Waiver uploaded successfully");
            
            return ApiResponse.success("Waiver uploaded successfully", response);
        } catch (IOException e) {
            return ApiResponse.error("Failed to upload waiver: " + e.getMessage());
        }
    }
    
    public ResponseEntity<byte[]> getWaiverFile(Long adoptionId) {
        try {
            Adoption adoption = adoptionRepository.findById(adoptionId).orElse(null);
            if (adoption == null || adoption.getWaiverFileName() == null) {
                return ResponseEntity.notFound().build();
            }
            
            Path filePath = Paths.get(WAIVER_STORAGE_PATH, adoption.getWaiverFileName());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] content = Files.readAllBytes(filePath);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + adoption.getWaiverFileName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(content);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // ==================== PAYMENT METHODS ====================
    
    public ApiResponse<?> createPayment(Long adoptionId, double amount) {
        try {
            Adoption adoption = adoptionRepository.findById(adoptionId).orElse(null);
            if (adoption == null) {
                return ApiResponse.error("Adoption not found");
            }
            
            Payment payment = new Payment();
            payment.setId(nextPaymentId++);
            payment.setAdoptionId(adoptionId);
            payment.setAmount(amount);
            payment.setStatus("pending");
            payment.setCreatedAt(LocalDateTime.now());
            
            payments.put(payment.getId(), payment);
            
            // Update adoption with payment info
            adoption.setPaymentId(payment.getId());
            adoption.setPaymentStatus("pending");
            adoption.setPaymentAmount(amount);
            adoption.setUpdatedAt(LocalDateTime.now());
            adoptionRepository.save(adoption);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", payment.getId());
            result.put("amount", payment.getAmount());
            result.put("status", payment.getStatus());
            
            return ApiResponse.success("Payment created", result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create payment: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> processPayment(Long paymentId, String method, String referenceNumber) {
        try {
            Payment payment = payments.get(paymentId);
            if (payment == null) {
                return ApiResponse.error("Payment not found");
            }
            
            payment.setMethod(method);
            payment.setReferenceNumber(referenceNumber);
            payment.setStatus("completed");
            payment.setProcessedAt(LocalDateTime.now());
            
            // Update adoption with payment details
            Adoption adoption = adoptionRepository.findById(payment.getAdoptionId()).orElse(null);
            if (adoption != null) {
                adoption.setPaymentStatus("completed");
                adoption.setPaymentMethod(method);
                adoption.setPaymentReference(referenceNumber);
                adoption.setStatus("completed");
                adoption.setUpdatedAt(LocalDateTime.now());
                adoptionRepository.save(adoption);
                
                // Mark pet as adopted
                Pet pet = petRepository.findById(adoption.getPetId()).orElse(null);
                if (pet != null) {
                    pet.setAdopted(true);
                    pet.setUpdatedAt(LocalDateTime.now());
                    petRepository.save(pet);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", payment.getId());
            result.put("status", payment.getStatus());
            result.put("message", "Payment successful");
            
            return ApiResponse.success("Payment processed successfully", result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to process payment: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> getPaymentStatus(Long paymentId) {
        try {
            Payment payment = payments.get(paymentId);
            if (payment == null) {
                return ApiResponse.error("Payment not found");
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", payment.getId());
            result.put("status", payment.getStatus());
            result.put("amount", payment.getAmount());
            result.put("method", payment.getMethod());
            result.put("referenceNumber", payment.getReferenceNumber());
            result.put("createdAt", payment.getCreatedAt());
            result.put("processedAt", payment.getProcessedAt());
            
            return ApiResponse.success("Payment status retrieved", result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to get payment status: " + e.getMessage());
        }
    }
    
    // ==================== HELPER METHODS ====================
    
    private Map<String, Object> convertToMap(Adoption adoption) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", adoption.getId());
        map.put("petId", adoption.getPetId());
        map.put("petName", adoption.getPetName());
        map.put("petImg", adoption.getPetImage());
        map.put("adopter", adoption.getAdopterName());
        map.put("adopterName", adoption.getAdopterName());
        map.put("email", adoption.getAdopterEmail());
        map.put("phone", adoption.getAdopterPhone());
        map.put("message", adoption.getMessage());
        map.put("status", adoption.getStatus());
        map.put("date", adoption.getFormattedDate());
        map.put("createdAt", adoption.getCreatedAt());
        map.put("waiverFileName", adoption.getWaiverFileName());
        map.put("paymentId", adoption.getPaymentId());
        map.put("paymentStatus", adoption.getPaymentStatus());
        map.put("paymentAmount", adoption.getPaymentAmount());
        return map;
    }
    
    private byte[] createFallbackWaiverPdf() {
        String content = "FURREAL ADOPTION WAIVER FORM\n\n" +
                "=====================================\n\n" +
                "Adopter Information:\n" +
                "Name: ___________________\n" +
                "Email: ___________________\n" +
                "Phone: ___________________\n\n" +
                "Pet Information:\n" +
                "Pet Name: ___________________\n" +
                "Breed: ___________________\n" +
                "Age: ___________________\n\n" +
                "TERMS AND CONDITIONS:\n" +
                "1. I agree to provide proper care for the adopted pet.\n" +
                "2. I understand that adoption is permanent.\n" +
                "3. I will not sell or rehome the pet without notifying FurReal.\n" +
                "4. I will provide necessary veterinary care.\n" +
                "5. I agree to spay/neuter the pet if not already done.\n\n" +
                "Signature: ___________________\n" +
                "Date: ___________________\n\n" +
                "FurReal Representative: ___________________\n" +
                "Date: ___________________\n";
        return content.getBytes();
    }
    
    // ==================== INNER PAYMENT CLASS ====================
    
    private static class Payment {
        private Long id;
        private Long adoptionId;
        private double amount;
        private String status;
        private String method;
        private String referenceNumber;
        private LocalDateTime createdAt;
        private LocalDateTime processedAt;
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public Long getAdoptionId() { return adoptionId; }
        public void setAdoptionId(Long adoptionId) { this.adoptionId = adoptionId; }
        
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        
        public String getReferenceNumber() { return referenceNumber; }
        public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getProcessedAt() { return processedAt; }
        public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    }
}