package com.auction.realtime_auction.controller;

import com.auction.realtime_auction.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ImageController {
    
    private final CloudinaryService cloudinaryService;
    
    /**
     * Upload single image
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("image") MultipartFile file) { 
        try {
            String imageUrl = cloudinaryService.uploadImage(file);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Upload multiple images
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<Map<String, Object>> uploadMultipleImages(
            @RequestParam("images") List<MultipartFile> files) {
        try {
            List<String> imageUrls = cloudinaryService.uploadMultipleImages(files);
            
            Map<String, Object> response = new HashMap<>();
            response.put("urls", imageUrls);
            response.put("count", imageUrls.size());
            response.put("message", "Images uploaded successfully");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to upload images: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Delete single image by URL
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteImage(
            @RequestParam("url") String imageUrl) {
        try {
            cloudinaryService.deleteImage(imageUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Image deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete image: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Delete multiple images by URLs
     */
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<Map<String, Object>> deleteMultipleImages(
            @RequestBody List<String> imageUrls) {
        try {
            int deletedCount = cloudinaryService.deleteMultipleImages(imageUrls);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Images deleted successfully");
            response.put("deletedCount", deletedCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete images: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}