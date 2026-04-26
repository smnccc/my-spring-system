package com.example.furreal.service;

import com.example.furreal.dto.ApiResponse;
import com.example.furreal.dto.PetRequest;
import com.example.furreal.model.Pet;
import com.example.furreal.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PetService {
    
    @Autowired
    private PetRepository petRepository;
    
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    // ==================== PUBLIC METHODS ====================
    
    public ApiResponse<?> getAllPets(String type, String search) {
        try {
            List<Pet> pets = petRepository.findByStatusAndAdopted("approved", false);
            
            if (type != null && !type.equals("all")) {
                pets = pets.stream().filter(p -> p.getType().equals(type)).collect(Collectors.toList());
            }
            
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                pets = pets.stream().filter(p -> 
                    (p.getName() != null && p.getName().toLowerCase().contains(searchLower)) ||
                    (p.getBreed() != null && p.getBreed().toLowerCase().contains(searchLower))
                ).collect(Collectors.toList());
            }
            
            pets.sort((a, b) -> {
                if (a.getPostedDate() == null) return 1;
                if (b.getPostedDate() == null) return -1;
                return b.getPostedDate().compareTo(a.getPostedDate());
            });
            
            List<Map<String, Object>> petList = pets.stream().map(this::convertToMap).collect(Collectors.toList());
            return ApiResponse.success("Pets retrieved successfully", petList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve pets: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> getFeaturedPets(int limit) {
        try {
            List<Pet> pets = petRepository.findFeaturedPets(limit);
            List<Map<String, Object>> petList = pets.stream().map(this::convertToMap).collect(Collectors.toList());
            return ApiResponse.success("Featured pets retrieved", petList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve featured pets: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> getPetById(Long id) {
        try {
            Pet pet = petRepository.findById(id).orElse(null);
            if (pet == null) {
                return ApiResponse.error("Pet not found");
            }
            return ApiResponse.success("Pet retrieved", convertToMap(pet));
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve pet: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> createPet(PetRequest request) {
        try {
            Pet pet = new Pet();
            pet.setName(request.getName());
            pet.setType(request.getType());
            pet.setBreed(request.getBreed());
            pet.setAge(request.getAge());
            pet.setDescription(request.getDescription());
            pet.setImageUrl(request.getImageUrl());
            pet.setLocation(request.getLocation());
            pet.setContact(request.getContact());
            pet.setPostedBy(request.getUserId());
            
            if (request.getPostedDate() != null) {
                pet.setPostedDate(request.getPostedDate());
            } else {
                pet.setPostedDate(LocalDate.now());
            }
            
            pet.setStatus("pending");
            pet.setAdopted(false);
            pet.setCreatedAt(LocalDateTime.now());
            pet.setUpdatedAt(LocalDateTime.now());
            
            Pet savedPet = petRepository.save(pet);
            return ApiResponse.success("Pet submitted for approval", convertToMap(savedPet));
        } catch (Exception e) {
            return ApiResponse.error("Failed to create pet: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> updatePet(Long id, PetRequest request) {
        try {
            Pet pet = petRepository.findById(id).orElse(null);
            if (pet == null) {
                return ApiResponse.error("Pet not found");
            }
            
            if (request.getName() != null) pet.setName(request.getName());
            if (request.getType() != null) pet.setType(request.getType());
            if (request.getBreed() != null) pet.setBreed(request.getBreed());
            if (request.getAge() != null) pet.setAge(request.getAge());
            if (request.getDescription() != null) pet.setDescription(request.getDescription());
            if (request.getImageUrl() != null) pet.setImageUrl(request.getImageUrl());
            if (request.getLocation() != null) pet.setLocation(request.getLocation());
            if (request.getContact() != null) pet.setContact(request.getContact());
            if (request.getPostedDate() != null) pet.setPostedDate(request.getPostedDate());
            
            pet.setUpdatedAt(LocalDateTime.now());
            
            Pet updatedPet = petRepository.save(pet);
            return ApiResponse.success("Pet updated successfully", convertToMap(updatedPet));
        } catch (Exception e) {
            return ApiResponse.error("Failed to update pet: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> deletePet(Long id) {
        try {
            if (!petRepository.existsById(id)) {
                return ApiResponse.error("Pet not found");
            }
            petRepository.deleteById(id);
            return ApiResponse.success("Pet deleted successfully", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete pet: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> getMyPostedPets(Long userId) {
        try {
            List<Pet> pets = petRepository.findByPostedByOrderByPostedDateDesc(userId);
            List<Map<String, Object>> petList = pets.stream().map(this::convertToMap).collect(Collectors.toList());
            return ApiResponse.success("Your pets retrieved", petList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve your pets: " + e.getMessage());
        }
    }
    
    // ==================== ADMIN METHODS ====================
    
    // ✅ FIXED - Returns count
    public long getTotalPetsCount() {
        return petRepository.count();
    }
    
    // ✅ FIXED - Returns count of pending pets
    public long getPendingPetsCount() {
        return petRepository.findByStatus("pending").size();
    }
    
    public ApiResponse<?> getAllPetsForAdmin(String type, String status, String search) {
        try {
            List<Pet> pets = petRepository.findAll();
            
            if (type != null && !type.equals("all")) {
                pets = pets.stream().filter(p -> p.getType().equals(type)).collect(Collectors.toList());
            }
            
            if (status != null && !status.equals("all")) {
                if (status.equals("available")) {
                    pets = pets.stream().filter(p -> !p.getAdopted()).collect(Collectors.toList());
                } else if (status.equals("adopted")) {
                    pets = pets.stream().filter(Pet::getAdopted).collect(Collectors.toList());
                } else if (status.equals("pending")) {
                    pets = pets.stream().filter(p -> p.getStatus().equals("pending")).collect(Collectors.toList());
                } else if (status.equals("approved")) {
                    pets = pets.stream().filter(p -> p.getStatus().equals("approved")).collect(Collectors.toList());
                }
            }
            
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                pets = pets.stream().filter(p -> 
                    (p.getName() != null && p.getName().toLowerCase().contains(searchLower)) ||
                    (p.getBreed() != null && p.getBreed().toLowerCase().contains(searchLower)) ||
                    (p.getLocation() != null && p.getLocation().toLowerCase().contains(searchLower))
                ).collect(Collectors.toList());
            }
            
            List<Map<String, Object>> petList = pets.stream().map(this::convertToMap).collect(Collectors.toList());
            return ApiResponse.success("Pets retrieved", petList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve pets: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> getPendingPets() {
        try {
            List<Pet> pendingPets = petRepository.findByStatus("pending");
            List<Map<String, Object>> petList = pendingPets.stream().map(this::convertToMap).collect(Collectors.toList());
            return ApiResponse.success("Pending pets retrieved", petList);
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve pending pets: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> approvePet(Long id) {
        try {
            Pet pet = petRepository.findById(id).orElse(null);
            if (pet == null) {
                return ApiResponse.error("Pet not found");
            }
            pet.setStatus("approved");
            pet.setUpdatedAt(LocalDateTime.now());
            petRepository.save(pet);
            return ApiResponse.success("Pet approved successfully", convertToMap(pet));
        } catch (Exception e) {
            return ApiResponse.error("Failed to approve pet: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> rejectPet(Long id, String reason) {
        try {
            Pet pet = petRepository.findById(id).orElse(null);
            if (pet == null) {
                return ApiResponse.error("Pet not found");
            }
            pet.setStatus("rejected");
            pet.setUpdatedAt(LocalDateTime.now());
            petRepository.save(pet);
            return ApiResponse.success("Pet rejected: " + (reason != null ? reason : "No reason provided"), null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to reject pet: " + e.getMessage());
        }
    }
    
    // ✅ ADD THIS METHOD - For admin create pet
    public ApiResponse<?> createPetByAdmin(Map<String, String> petData) {
        try {
            Pet pet = new Pet();
            pet.setName(petData.get("name"));
            pet.setAge(petData.get("age"));
            pet.setType(petData.get("type"));
            pet.setBreed(petData.get("breed"));
            pet.setLocation(petData.get("location"));
            pet.setContact(petData.get("contact"));
            pet.setDescription(petData.get("description"));
            pet.setImageUrl(petData.get("imageUrl"));
            
            String postedDateStr = petData.get("postedDate");
            if (postedDateStr != null && !postedDateStr.isEmpty()) {
                pet.setPostedDate(LocalDate.parse(postedDateStr));
            } else {
                pet.setPostedDate(LocalDate.now());
            }
            
            pet.setStatus("approved");
            pet.setAdopted(false);
            pet.setCreatedAt(LocalDateTime.now());
            pet.setUpdatedAt(LocalDateTime.now());
            
            Pet savedPet = petRepository.save(pet);
            return ApiResponse.success("Pet added successfully", convertToMap(savedPet));
        } catch (Exception e) {
            return ApiResponse.error("Failed to add pet: " + e.getMessage());
        }
    }
    
    // ✅ ADD THIS METHOD - For admin update pet
    public ApiResponse<?> updatePetByAdmin(Long id, Map<String, Object> petData) {
        try {
            Pet pet = petRepository.findById(id).orElse(null);
            if (pet == null) {
                return ApiResponse.error("Pet not found");
            }
            
            if (petData.containsKey("name")) pet.setName((String) petData.get("name"));
            if (petData.containsKey("age")) pet.setAge((String) petData.get("age"));
            if (petData.containsKey("type")) pet.setType((String) petData.get("type"));
            if (petData.containsKey("breed")) pet.setBreed((String) petData.get("breed"));
            if (petData.containsKey("location")) pet.setLocation((String) petData.get("location"));
            if (petData.containsKey("contact")) pet.setContact((String) petData.get("contact"));
            if (petData.containsKey("description")) pet.setDescription((String) petData.get("description"));
            if (petData.containsKey("adopted")) pet.setAdopted((Boolean) petData.get("adopted"));
            
            pet.setUpdatedAt(LocalDateTime.now());
            
            Pet updatedPet = petRepository.save(pet);
            return ApiResponse.success("Pet updated successfully", convertToMap(updatedPet));
        } catch (Exception e) {
            return ApiResponse.error("Failed to update pet: " + e.getMessage());
        }
    }
    
    // ✅ ADD THIS METHOD - Clear all pets
    public ApiResponse<?> clearAllPets() {
        try {
            petRepository.deleteAll();
            return ApiResponse.success("All pets cleared successfully", null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to clear pets: " + e.getMessage());
        }
    }
    
    public ApiResponse<?> updateAdoptionStatus(Long id, Boolean adopted) {
        try {
            Pet pet = petRepository.findById(id).orElse(null);
            if (pet == null) {
                return ApiResponse.error("Pet not found");
            }
            pet.setAdopted(adopted);
            pet.setUpdatedAt(LocalDateTime.now());
            petRepository.save(pet);
            return ApiResponse.success("Adoption status updated", convertToMap(pet));
        } catch (Exception e) {
            return ApiResponse.error("Failed to update adoption status: " + e.getMessage());
        }
    }
    
    // ==================== HELPER METHODS ====================
    
    private Map<String, Object> convertToMap(Pet pet) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", pet.getId());
        map.put("name", pet.getName());
        map.put("type", pet.getType());
        map.put("breed", pet.getBreed());
        map.put("age", pet.getAge());
        map.put("description", pet.getDescription());
        map.put("image", pet.getImageUrl());
        map.put("location", pet.getLocation());
        map.put("contact", pet.getContact());
        map.put("postedBy", pet.getPostedBy());
        map.put("status", pet.getStatus());
        map.put("adopted", pet.getAdopted());
        map.put("createdAt", pet.getCreatedAt() != null ? pet.getCreatedAt().format(dateFormatter) : "");
        map.put("postedDate", pet.getPostedDate() != null ? pet.getPostedDate().toString() : "");
        return map;
    }
}