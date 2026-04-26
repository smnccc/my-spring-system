package com.example.furreal.repository;

import com.example.furreal.model.Adoption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AdoptionRepository extends JpaRepository<Adoption, Long> {
    List<Adoption> findByStatus(String status);
    List<Adoption> findByAdopterEmail(String email);
    List<Adoption> findByAdopterEmailAndStatus(String email, String status);
    List<Adoption> findByPetId(Long petId);
}