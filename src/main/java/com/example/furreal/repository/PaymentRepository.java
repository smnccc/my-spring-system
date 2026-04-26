package com.example.furreal.repository;

import com.example.furreal.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Find by adoption ID
    List<Payment> findByAdoptionId(Long adoptionId);
    
    // Find by status
    List<Payment> findByStatus(String status);
    
    // Find by status ordered by created date descending
    List<Payment> findByStatusOrderByCreatedAtDesc(String status);
    
    // Find by method
    List<Payment> findByMethod(String method);
    
    // Find by method ordered by created date descending
    List<Payment> findByMethodOrderByCreatedAtDesc(String method);
    
    // Find all ordered by created date descending (for admin dashboard)
    List<Payment> findAllByOrderByCreatedAtDesc();
    
    // Find pending verifications (GCash payments waiting for admin approval)
    List<Payment> findByStatusIn(List<String> statuses);
    
    // Count by status
    long countByStatus(String status);
    
    // Count by method
    long countByMethod(String method);
    
    // Find recent payments (last 7 days)
    List<Payment> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date);
    
    // Find payments by date range
    List<Payment> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Find payments by adoption ID with proof
    @Query("SELECT p FROM Payment p WHERE p.adoptionId = :adoptionId AND p.proofFileName IS NOT NULL")
    List<Payment> findByAdoptionIdWithProof(@Param("adoptionId") Long adoptionId);
    
    // Get total amount collected from completed payments
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status IN ('completed', 'delivered')")
    Double getTotalCollectedAmount();
    
    // Get monthly statistics
    @Query("SELECT FUNCTION('MONTH', p.createdAt) as month, COUNT(p) as count, SUM(p.amount) as total " +
           "FROM Payment p WHERE p.status IN ('completed', 'delivered') AND YEAR(p.createdAt) = :year " +
           "GROUP BY FUNCTION('MONTH', p.createdAt) ORDER BY month")
    List<Object[]> getMonthlyPaymentStats(@Param("year") int year);
}