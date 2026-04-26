package com.example.furreal.dto;

public class AdoptionRequest {
    private Long petId;
    private String name;
    private String email;
    private String phone;
    private String message;
    
    public AdoptionRequest() {}
    
    public AdoptionRequest(Long petId, String name, String email, String phone, String message) {
        this.petId = petId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.message = message;
    }
    
    // Getters and Setters
    public Long getPetId() {
        return petId;
    }
    
    public void setPetId(Long petId) {
        this.petId = petId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}   