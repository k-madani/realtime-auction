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
     * Upload single image to Cloudinary
     */
    public String uploadImage(MultipartFile file) throws IOException {
        String publicId = "auctions/" + UUID.randomUUID().toString();

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", publicId,
                        "folder", "auction-platform",
                        "resource_type", "image"));

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
     * Delete single image from Cloudinary
     */
    public void deleteImage(String imageUrl) throws IOException {
        String publicId = extractPublicId(imageUrl);

        if (publicId != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap()); // ← FIXED
            System.out.println("Cloudinary delete result: " + result);
        } else {
            throw new IOException("Could not extract public_id from URL: " + imageUrl);
        }
    }

    /**
     * Delete multiple images from Cloudinary
     */
    public int deleteMultipleImages(List<String> imageUrls) {
        int deletedCount = 0;

        for (String url : imageUrls) {
            try {
                deleteImage(url);
                deletedCount++;
            } catch (IOException e) {
                System.err.println("Failed to delete image: " + url + " - " + e.getMessage());
            }
        }

        return deletedCount;
    }

    /**
     * Extract public_id from Cloudinary URL
     * Example:
     * https://res.cloudinary.com/demo/image/upload/v1234567890/auction-platform/auctions/abc-123.jpg
     * Returns: auction-platform/auctions/abc-123
     */
    private String extractPublicId(String imageUrl) {
        try {
            // Find the position after "/upload/"
            int uploadIndex = imageUrl.indexOf("/upload/");
            if (uploadIndex == -1)
                return null;

            // Get everything after "/upload/"
            String afterUpload = imageUrl.substring(uploadIndex + 8); // 8 = length of "/upload/"

            // Skip version number (starts with 'v')
            int firstSlash = afterUpload.indexOf('/');
            if (firstSlash == -1)
                return null;

            String pathWithFile = afterUpload.substring(firstSlash + 1);

            // Remove file extension
            int lastDot = pathWithFile.lastIndexOf('.');
            if (lastDot == -1)
                return pathWithFile;

            return pathWithFile.substring(0, lastDot);

        } catch (Exception e) {
            System.err.println("Error extracting public_id: " + e.getMessage());
            return null;
        }
    }
}