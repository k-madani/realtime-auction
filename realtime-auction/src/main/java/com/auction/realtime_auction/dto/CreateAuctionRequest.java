package com.auction.realtime_auction.dto;

import com.auction.realtime_auction.model.AuctionCategory;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateAuctionRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;
    
    @Size(max = 5000, message = "Description too long")
    private String description;
    
    @NotNull(message = "Starting price is required")
    @DecimalMin(value = "0.01", message = "Starting price must be at least 0.01")
    private BigDecimal startingPrice;
    
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    @NotNull(message = "Category is required")
    private AuctionCategory category;
    
    // Multiple image URLs (new approach)
    private List<String> imageUrls = new ArrayList<>();
}