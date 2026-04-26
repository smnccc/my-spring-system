package com.example.furreal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "adoptions")
public class Adoption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "pet_id", nullable = false)
    private Long petId;
    
    @Column(name = "pet_name")
    private String petName;
    
    @Column(name = "pet_image")
    private String petImage;
    
    @Column(name = "adopter_name", nullable = false)
    private String adopterName;
    
    @Column(name = "adopter_email", nullable = false)
    private String adopterEmail;
    
    @Column(name = "adopter_phone")
    private String adopterPhone;
    
    @Column(length = 2000)
    private String message;
    
    private String status = "pending";
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @Column(name = "waiver_file_name")
    private String waiverFileName;
    
    @Column(name = "payment_id")
    private Long paymentId;
    
    @Column(name = "payment_status")
    private String paymentStatus = "pending";
    
    @Column(name = "payment_amount")
    private Double paymentAmount;
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "payment_reference")
    private String paymentReference;
    
    @Column(name = "request_date")
    private LocalDateTime requestDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    
    public Adoption() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.requestDate = LocalDateTime.now();
    }
    
    // ==================== GETTERS AND SETTERS ====================
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getPetId() {
        return petId;
    }
    
    public void setPetId(Long petId) {
        this.petId = petId;
    }
    
    public String getPetName() {
        return petName;
    }
    
    public void setPetName(String petName) {
        this.petName = petName;
    }
    
    public String getPetImage() {
        return petImage;
    }
    
    public void setPetImage(String petImage) {
        this.petImage = petImage;
    }
    
    public String getAdopterName() {
        return adopterName;
    }
    
    public void setAdopterName(String adopterName) {
        this.adopterName = adopterName;
    }
    
    public String getAdopterEmail() {
        return adopterEmail;
    }
    
    public void setAdopterEmail(String adopterEmail) {
        this.adopterEmail = adopterEmail;
    }
    
    public String getAdopterPhone() {
        return adopterPhone;
    }
    
    public void setAdopterPhone(String adopterPhone) {
        this.adopterPhone = adopterPhone;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public String getWaiverFileName() {
        return waiverFileName;
    }
    
    public void setWaiverFileName(String waiverFileName) {
        this.waiverFileName = waiverFileName;
    }
    
    public Long getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }
    
    public String getPaymentStatus() {
        return paymentStatus;
    }
    
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    
    public Double getPaymentAmount() {
        return paymentAmount;
    }
    
    public void setPaymentAmount(Double paymentAmount) {
        this.paymentAmount = paymentAmount;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getPaymentReference() {
        return paymentReference;
    }
    
    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }
    
    public LocalDateTime getRequestDate() {
        return requestDate;
    }
    
    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
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
    
    public String getFormattedDate() {
        if (requestDate != null) {
            return requestDate.format(DATE_FORMATTER);
        }
        return "";
    }
    
    // For backward compatibility with existing code
    public String getEmail() {
        return adopterEmail;
    }
    
    public void setEmail(String email) {
        this.adopterEmail = email;
    }
    
    public String getPhone() {
        return adopterPhone;
    }
    
    public void setPhone(String phone) {
        this.adopterPhone = phone;
    }
}