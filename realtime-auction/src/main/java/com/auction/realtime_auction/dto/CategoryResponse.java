package com.auction.realtime_auction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private String value;
    private String displayName;
    private String displayNameWithEmoji;
}