package com.auction.realtime_auction.model;

public enum AuctionCategory {
    ELECTRONICS("Electronics", "📱"),
    FASHION("Fashion & Accessories", "👗"),
    HOME_GARDEN("Home & Garden", "🏡"),
    COLLECTIBLES("Collectibles & Antiques", "🏺"),
    ART("Art & Crafts", "🎨"),
    SPORTS("Sports & Outdoors", "⚽"),
    BOOKS_MEDIA("Books & Media", "📚"),
    TOYS_GAMES("Toys & Games", "🎮"),
    JEWELRY("Jewelry & Watches", "💎"),
    AUTOMOTIVE("Automotive", "🚗"),
    MUSIC("Musical Instruments", "🎸"),
    OTHER("Other", "📦");
    
    private final String displayName;
    private final String emoji;
    
    AuctionCategory(String displayName, String emoji) {
        this.displayName = displayName;
        this.emoji = emoji;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getEmoji() {
        return emoji;
    }
    
    public String getDisplayNameWithEmoji() {
        return emoji + " " + displayName;
    }
}