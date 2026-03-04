package com.auction.realtime_auction.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ErrorResponse {

    private final int code;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final String message;

    private final String error;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime timestamp;

    public ErrorResponse(int code, String message, String error) {
        this.code = code;
        this.message = message;
        this.error = error;
        this.timestamp = LocalDateTime.now();
    }
}