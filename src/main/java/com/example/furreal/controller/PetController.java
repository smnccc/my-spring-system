package com.example.furreal.controller;

import com.example.furreal.dto.ApiResponse;
import com.example.furreal.dto.PetRequest;
import com.example.furreal.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pets")
@CrossOrigin(origins = "*")
public class PetController {
    
    @Autowired
    private PetService petService;
    
    // GET /pets - Get all approved pets (with filters)
    @GetMapping
    public ApiResponse<?> getAllPets(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        return petService.getAllPets(type, search);
    }
    
    // GET /pets/featured?limit=3 - Get featured pets
    @GetMapping("/featured")
    public ApiResponse<?> getFeaturedPets(@RequestParam(defaultValue = "3") int limit) {
        return petService.getFeaturedPets(limit);
    }
    
    // GET /pets/{id} - Get pet by ID
    @GetMapping("/{id}")
    public ApiResponse<?> getPetById(@PathVariable Long id) {
        return petService.getPetById(id);
    }
    
    // POST /pets - Create new pet listing (with postedDate)
    @PostMapping
    public ApiResponse<?> createPet(@RequestBody PetRequest request) {
        return petService.createPet(request);
    }
    
    // PUT /pets/{id} - Update pet
    @PutMapping("/{id}")
    public ApiResponse<?> updatePet(@PathVariable Long id, @RequestBody PetRequest request) {
        return petService.updatePet(id, request);
    }
    
    // DELETE /pets/{id} - Delete pet
    @DeleteMapping("/{id}")
    public ApiResponse<?> deletePet(@PathVariable Long id) {
        return petService.deletePet(id);
    }
    
    // ==================== ADMIN ENDPOINTS ====================
    
    // GET /pets/admin/all - Get all pets for admin
    @GetMapping("/admin/all")
    public ApiResponse<?> getAllPetsForAdmin(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return petService.getAllPetsForAdmin(type, status, search);
    }
    
    // GET /pets/admin/pending - Get pending pets
    @GetMapping("/admin/pending")
    public ApiResponse<?> getPendingPets() {
        return petService.getPendingPets();
    }
    
    // PUT /pets/admin/{id}/approve - Approve pet
    @PutMapping("/admin/{id}/approve")
    public ApiResponse<?> approvePet(@PathVariable Long id) {
        return petService.approvePet(id);
    }
    
    // PUT /pets/admin/{id}/reject - Reject pet
    @PutMapping("/admin/{id}/reject")
    public ApiResponse<?> rejectPet(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return petService.rejectPet(id, reason);
    }
    
    // PUT /pets/admin/{id}/adoption-status - Update adoption status
    @PutMapping("/admin/{id}/adoption-status")
    public ApiResponse<?> updateAdoptionStatus(@PathVariable Long id, @RequestParam Boolean adopted) {
        return petService.updateAdoptionStatus(id, adopted);
    }
}