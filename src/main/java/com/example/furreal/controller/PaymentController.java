package com.example.furreal.controller;

import com.example.furreal.dto.ApiResponse;
import com.example.furreal.model.Payment;
import com.example.furreal.model.Adoption;
import com.example.furreal.model.Pet;
import com.example.furreal.repository.PaymentRepository;
import com.example.furreal.repository.AdoptionRepository;
import com.example.furreal.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private AdoptionRepository adoptionRepository;
    
    @Autowired
    private PetRepository petRepository;
    
    private static final String PROOF_STORAGE_PATH = "uploads/proofs/";
    
    // ========== CREATE PAYMENT ==========
    @PostMapping("/create")
    public ApiResponse<?> createPayment(@RequestBody Map<String, Object> request) {
        try {
            Long adoptionId = Long.valueOf(request.get("adoptionId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            
            Payment payment = new Payment();
            payment.setAdoptionId(adoptionId);
            payment.setAmount(amount);
            payment.setStatus("pending");
            payment.setCreatedAt(LocalDateTime.now());
            
            Payment saved = paymentRepository.save(payment);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", saved.getId());
            result.put("amount", saved.getAmount());
            result.put("status", saved.getStatus());
            
            return ApiResponse.success("Payment created", result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create payment: " + e.getMessage());
        }
    }
    
    // ========== PROCESS PAYMENT ==========
    @PostMapping("/{paymentId}/process")
    public ApiResponse<?> processPayment(@PathVariable Long paymentId, @RequestBody Map<String, String> request) {
        try {
            Payment payment = paymentRepository.findById(paymentId).orElse(null);
            if (payment == null) {
                return ApiResponse.error("Payment not found");
            }
            
            String method = request.get("method");
            String referenceNumber = request.get("referenceNumber");
            
            payment.setMethod(method);
            payment.setReferenceNumber(referenceNumber);
            
            if ("cod".equals(method)) {
                payment.setStatus("cod_pending");
            } else {
                payment.setStatus("pending_verification");
            }
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", payment.getId());
            result.put("status", payment.getStatus());
            
            return ApiResponse.success("Payment processed", result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to process payment: " + e.getMessage());
        }
    }
    
    // ========== UPLOAD PROOF OF PAYMENT ==========
    @PostMapping("/{adoptionId}/proof")
    public ApiResponse<?> uploadProofOfPayment(@PathVariable Long adoptionId, @RequestParam("proof") MultipartFile file) {
        try {
            // Create directory if not exists
            Path uploadPath = Paths.get(PROOF_STORAGE_PATH);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Validate file
            if (file.isEmpty()) {
                return ApiResponse.error("File is empty");
            }
            
            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ApiResponse.error("File too large. Maximum size is 5MB");
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ApiResponse.error("Only image files are allowed (JPG, PNG, WEBP)");
            }
            
            // Save file
            String extension = contentType.equals("image/png") ? ".png" : ".jpg";
            String fileName = "proof_" + adoptionId + "_" + UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Find payment by adoption ID and update proof file name
            List<Payment> payments = paymentRepository.findByAdoptionId(adoptionId);
            if (!payments.isEmpty()) {
                Payment payment = payments.get(0);
                payment.setProofFileName(fileName);
                payment.setProofUrl("/payments/proof/view/" + fileName);
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);
            }
            
            Map<String, String> result = new HashMap<>();
            result.put("fileName", fileName);
            result.put("fileUrl", "/payments/proof/view/" + fileName);
            
            return ApiResponse.success("Proof of payment uploaded", result);
        } catch (IOException e) {
            return ApiResponse.error("Failed to upload proof: " + e.getMessage());
        }
    }
    
    // ========== VIEW PROOF OF PAYMENT IMAGE ==========
    @GetMapping("/proof/view/{fileName}")
    public ResponseEntity<byte[]> viewProofImage(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(PROOF_STORAGE_PATH + fileName);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] content = Files.readAllBytes(filePath);
            String contentType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(content);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // ========== GET ALL PAYMENTS (ADMIN) ==========
    @GetMapping
    public ApiResponse<?> getAllPayments() {
        try {
            List<Payment> payments = paymentRepository.findAllByOrderByCreatedAtDesc();
            
            // Add full proof URL for each payment
            for (Payment payment : payments) {
                if (payment.getProofFileName() != null) {
                    payment.setProofUrl("/payments/proof/view/" + payment.getProofFileName());
                }
            }
            
            return ApiResponse.success("Payments retrieved", payments);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve payments: " + e.getMessage());
        }
    }
    
    // ========== GET PAYMENT BY ID ==========
    @GetMapping("/{paymentId}")
    public ApiResponse<?> getPaymentById(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId).orElse(null);
            if (payment == null) {
                return ApiResponse.error("Payment not found");
            }
            
            if (payment.getProofFileName() != null) {
                payment.setProofUrl("/payments/proof/view/" + payment.getProofFileName());
            }
            
            return ApiResponse.success("Payment retrieved", payment);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve payment: " + e.getMessage());
        }
    }
    
    // ========== GET PAYMENTS BY STATUS ==========
    @GetMapping("/status/{status}")
    public ApiResponse<?> getPaymentsByStatus(@PathVariable String status) {
        try {
            List<Payment> payments = paymentRepository.findByStatusOrderByCreatedAtDesc(status);
            return ApiResponse.success("Payments retrieved", payments);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve payments: " + e.getMessage());
        }
    }
    
    // ========== GET PAYMENTS BY METHOD ==========
    @GetMapping("/method/{method}")
    public ApiResponse<?> getPaymentsByMethod(@PathVariable String method) {
        try {
            List<Payment> payments = paymentRepository.findByMethodOrderByCreatedAtDesc(method);
            return ApiResponse.success("Payments retrieved", payments);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve payments: " + e.getMessage());
        }
    }
    
    // ========== VERIFY PAYMENT (ADMIN) ==========
    @PutMapping("/{paymentId}/verify")
    public ApiResponse<?> verifyPayment(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId).orElse(null);
            if (payment == null) {
                return ApiResponse.error("Payment not found");
            }
            
            payment.setStatus("completed");
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            
            // Update adoption status to completed
            Adoption adoption = adoptionRepository.findById(payment.getAdoptionId()).orElse(null);
            if (adoption != null) {
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
            
            return ApiResponse.success("Payment verified and adoption completed", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to verify payment: " + e.getMessage());
        }
    }
    
    // ========== DECLINE PAYMENT (ADMIN) ==========
    @PutMapping("/{paymentId}/decline")
    public ApiResponse<?> declinePayment(@PathVariable Long paymentId, @RequestBody Map<String, String> request) {
        try {
            Payment payment = paymentRepository.findById(paymentId).orElse(null);
            if (payment == null) {
                return ApiResponse.error("Payment not found");
            }
            
            String reason = request.get("reason");
            payment.setStatus("declined");
            payment.setDeclineReason(reason);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            
            // Update adoption status to rejected
            Adoption adoption = adoptionRepository.findById(payment.getAdoptionId()).orElse(null);
            if (adoption != null) {
                adoption.setStatus("rejected");
                adoption.setRejectionReason(reason);
                adoption.setUpdatedAt(LocalDateTime.now());
                adoptionRepository.save(adoption);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", payment.getId());
            result.put("status", payment.getStatus());
            result.put("reason", reason);
            
            return ApiResponse.success("Payment declined", result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to decline payment: " + e.getMessage());
        }
    }
    
    // ========== MARK COD AS DELIVERED (ADMIN) ==========
    @PutMapping("/{paymentId}/deliver")
    public ApiResponse<?> completeDelivery(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId).orElse(null);
            if (payment == null) {
                return ApiResponse.error("Payment not found");
            }
            
            payment.setStatus("delivered");
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            
            // Update adoption status to completed
            Adoption adoption = adoptionRepository.findById(payment.getAdoptionId()).orElse(null);
            if (adoption != null) {
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
            
            return ApiResponse.success("Delivery completed and adoption finalized", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to complete delivery: " + e.getMessage());
        }
    }
    
    // ========== PAYMENT STATISTICS ==========
    @GetMapping("/stats")
    public ApiResponse<?> getPaymentStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPayments", paymentRepository.count());
            stats.put("completedPayments", paymentRepository.countByStatus("completed"));
            stats.put("pendingVerification", paymentRepository.countByStatus("pending_verification"));
            stats.put("codPending", paymentRepository.countByStatus("cod_pending"));
            stats.put("declined", paymentRepository.countByStatus("declined"));
            stats.put("gcashPayments", paymentRepository.countByMethod("gcash"));
            stats.put("codPayments", paymentRepository.countByMethod("cod"));
            stats.put("totalCollected", paymentRepository.getTotalCollectedAmount());
            
            return ApiResponse.success("Payment statistics retrieved", stats);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve statistics: " + e.getMessage());
        }
    }
}