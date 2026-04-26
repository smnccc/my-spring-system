package com.example.furreal.repository;

import com.example.furreal.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    
    List<Pet> findByStatus(String status);
    
    List<Pet> findByStatusAndAdopted(String status, Boolean adopted);
    
    List<Pet> findByPostedBy(Long userId);
    
    List<Pet> findByType(String type);
    
    List<Pet> findByPostedByOrderByPostedDateDesc(Long userId);
    
    @Query("SELECT p FROM Pet p WHERE p.status = 'approved' ORDER BY p.postedDate DESC")
    List<Pet> findApprovedPetsOrderByPostedDateDesc();
    
    @Query(value = "SELECT * FROM pets WHERE status = 'approved' ORDER BY posted_date DESC LIMIT :limit", nativeQuery = true)
    List<Pet> findFeaturedPets(@Param("limit") int limit);
    
    @Query("SELECT p FROM Pet p WHERE p.status = 'approved' AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.breed) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Pet> searchPets(@Param("search") String search);
}