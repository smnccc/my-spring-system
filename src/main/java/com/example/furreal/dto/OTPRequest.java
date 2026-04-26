package com.example.furreal.dto;

public class OTPRequest {
    private String email;
    private String otpCode;
    private String purpose; // REGISTRATION, FORGOT_PASSWORD
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
}