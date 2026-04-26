package com.example.furreal.controller;

import com.example.furreal.dto.ApiResponse;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/waiver")
@CrossOrigin(origins = "*")
public class WaiverController {

    private static final String WAIVER_STORAGE_PATH = "uploads/waivers/";

    // ✅ DOWNLOAD WAIVER TEMPLATE
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadWaiverTemplate() {
        try {
            // Try to load from resources folder
            Resource resource = new ClassPathResource("static/waiver/furreal_adoption_waiver.pdf");
            
            if (resource.exists()) {
                byte[] content = resource.getContentAsByteArray();
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"FurReal_Adoption_Waiver.pdf\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(content);
            }
            
            // Fallback: Create a simple PDF if template not found
            byte[] fallbackPdf = createFallbackWaiverPdf();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"FurReal_Adoption_Waiver.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(fallbackPdf);
                    
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ✅ UPLOAD SIGNED WAIVER
    @PostMapping("/upload/{adoptionId}")
    public ApiResponse<?> uploadSignedWaiver(
            @PathVariable Long adoptionId,
            @RequestParam("waiver") MultipartFile file) {
        try {
            // Create directory if not exists
            Path uploadPath = Paths.get(WAIVER_STORAGE_PATH);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Validate file
            if (file.isEmpty()) {
                return ApiResponse.error("File is empty");
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("application/pdf") && 
                !contentType.startsWith("image/"))) {
                return ApiResponse.error("Only PDF and image files are allowed");
            }
            
            // Save file
            String fileName = "waiver_" + adoptionId + "_" + UUID.randomUUID().toString() + 
                             (contentType.equals("application/pdf") ? ".pdf" : ".jpg");
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("filePath", filePath.toString());
            
            return ApiResponse.success("Waiver uploaded successfully", response);
        } catch (IOException e) {
            return ApiResponse.error("Failed to upload waiver: " + e.getMessage());
        }
    }

    // ✅ GET WAIVER BY ADOPTION ID
    @GetMapping("/{adoptionId}")
    public ResponseEntity<byte[]> getWaiver(@PathVariable Long adoptionId) {
        try {
            Path uploadPath = Paths.get(WAIVER_STORAGE_PATH);
            // Find file starting with waiver_{adoptionId}
            try (var stream = Files.list(uploadPath)) {
                var waiverFile = stream
                        .filter(path -> path.getFileName().toString().startsWith("waiver_" + adoptionId))
                        .findFirst();
                
                if (waiverFile.isPresent()) {
                    byte[] content = Files.readAllBytes(waiverFile.get());
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + waiverFile.get().getFileName() + "\"")
                            .contentType(MediaType.APPLICATION_PDF)
                            .body(content);
                }
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ✅ CREATE FALLBACK PDF (kung walang template file)
    private byte[] createFallbackWaiverPdf() {
        String content = "FURREAL ADOPTION WAIVER FORM\n\n" +
                "=====================================\n\n" +
                "Adopter Information:\n" +
                "Name: ___________________\n" +
                "Email: ___________________\n" +
                "Phone: ___________________\n\n" +
                "Pet Information:\n" +
                "Pet Name: ___________________\n" +
                "Breed: ___________________\n" +
                "Age: ___________________\n\n" +
                "TERMS AND CONDITIONS:\n" +
                "1. I agree to provide proper care for the adopted pet.\n" +
                "2. I understand that adoption is permanent.\n" +
                "3. I will not sell or rehome the pet without notifying FurReal.\n" +
                "4. I will provide necessary veterinary care.\n" +
                "5. I agree to spay/neuter the pet if not already done.\n\n" +
                "Signature: ___________________\n" +
                "Date: ___________________\n\n" +
                "FurReal Representative: ___________________\n" +
                "Date: ___________________\n";
        
        return content.getBytes();
    }
}