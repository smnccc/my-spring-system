package com.example.furreal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "adoption_id", nullable = false)
    private Long adoptionId;
    
    @Column(nullable = false)
    private Double amount;
    
    private String method; // "gcash" or "cod"
    
    @Column(name = "reference_number")
    private String referenceNumber;
    
    private String status; // "pending_verification", "completed", "cod_pending", "delivered", "declined"
    
    @Column(name = "decline_reason", length = 500)
    private String declineReason;
    
    @Column(name = "proof_file_name")
    private String proofFileName;
    
    @Column(name = "proof_url")
    private String proofUrl;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Payment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Payment(Long adoptionId, Double amount, String method) {
        this.adoptionId = adoptionId;
        this.amount = amount;
        this.method = method;
        this.status = "pending";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // ==================== GETTERS AND SETTERS ====================
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getAdoptionId() {
        return adoptionId;
    }
    
    public void setAdoptionId(Long adoptionId) {
        this.adoptionId = adoptionId;
    }
    
    public Double getAmount() {
        return amount;
    }
    
    public void setAmount(Double amount) {
        this.amount = amount;
    }
    
    public String getMethod() {
        return method;
    }
    
    public void setMethod(String method) {
        this.method = method;
    }
    
    public String getReferenceNumber() {
        return referenceNumber;
    }
    
    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getDeclineReason() {
        return declineReason;
    }
    
    public void setDeclineReason(String declineReason) {
        this.declineReason = declineReason;
    }
    
    public String getProofFileName() {
        return proofFileName;
    }
    
    public void setProofFileName(String proofFileName) {
        this.proofFileName = proofFileName;
    }
    
    public String getProofUrl() {
        return proofUrl;
    }
    
    public void setProofUrl(String proofUrl) {
        this.proofUrl = proofUrl;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // ==================== HELPER METHODS ====================
    
    public String getFormattedCreatedAt() {
        if (createdAt == null) return "";
        return createdAt.format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy h:mm a"));
    }
    
    public boolean isPending() {
        return "pending_verification".equals(status) || "cod_pending".equals(status);
    }
    
    public boolean isCompleted() {
        return "completed".equals(status) || "delivered".equals(status);
    }
    
    public boolean isDeclined() {
        return "declined".equals(status);
    }
    
    public boolean isGCash() {
        return "gcash".equals(method);
    }
    
    public boolean isCOD() {
        return "cod".equals(method);
    }
}