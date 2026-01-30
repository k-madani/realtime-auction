package com.auction.realtime_auction.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    /**
     * Upload a single image to Cloudinary
     */
    public String uploadImage(MultipartFile file) throws IOException {
        // Generate unique filename
        String publicId = "auctions/" + UUID.randomUUID().toString();
        
        // Upload to Cloudinary with size limit
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "auction-platform",
                "resource_type", "image",
                "transformation", new Object[]{
                    ObjectUtils.asMap("width", 800, "height", 800, "crop", "limit")
                }
            )
        );
        
        // Return secure URL
        return (String) uploadResult.get("secure_url");
    }
    
    /**
     * Upload multiple images
     */
    public List<String> uploadMultipleImages(List<MultipartFile> files) throws IOException {
        List<String> imageUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String url = uploadImage(file);
                imageUrls.add(url);
            }
        }
        
        return imageUrls;
    }
    
    /**
     * Delete image from Cloudinary
     */
    public void deleteImage(String imageUrl) throws IOException {
        // Extract public_id from URL
        String publicId = extractPublicId(imageUrl);
        
        if (publicId != null) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }
    
    /**
     * Extract public_id from Cloudinary URL
     */
    private String extractPublicId(String imageUrl) {
        try {
            // Split URL and get the part after /upload/
            String[] parts = imageUrl.split("/upload/");
            if (parts.length > 1) {
                // Get everything after version (e.g., "v1234567890/")
                String afterUpload = parts[1];
                String[] versionParts = afterUpload.split("/", 2);
                
                if (versionParts.length > 1) {
                    // Remove file extension
                    String withExtension = versionParts[1];
                    return withExtension.substring(0, withExtension.lastIndexOf('.'));
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting public_id: " + e.getMessage());
        }
        return null;
    }
}