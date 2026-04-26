package com.example.furreal.repository;

import com.example.furreal.model.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    
    Optional<OTP> findByEmailAndOtpCodeAndPurposeAndIsUsedFalse(String email, String otpCode, String purpose);
    
    @Modifying
    @Transactional  // ✅ IDAGDAG ITO
    void deleteByEmailAndPurpose(String email, String purpose);
    
    Optional<OTP> findTopByEmailAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(String email, String purpose);
}