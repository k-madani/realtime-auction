package com.auction.realtime_auction.exception;

import com.stripe.exception.StripeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 — Bad Request
    // Covers: BadRequestException, @Valid field validation errors
    @ExceptionHandler({BadRequestException.class, MethodArgumentNotValidException.class})
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception ex) {
        String message;
        if (ex instanceof MethodArgumentNotValidException manve) {
            message = manve.getBindingResult().getAllErrors()
                    .stream()
                    .map(err -> err instanceof FieldError fe
                            ? fe.getField() + ": " + fe.getDefaultMessage()
                            : err.getDefaultMessage())
                    .collect(Collectors.joining(", "));
        } else {
            message = ex.getMessage();
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, message, "Bad Request"));
    }

    // 401 — Unauthorized
    // Covers: invalid/missing JWT, wrong password
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, ex.getMessage(), "Unauthorized"));
    }

    // 403 — Forbidden
    // Covers: update/delete another user's auction, bid on own auction, pay when not winner, non-participant review
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(403, ex.getMessage(), "Forbidden"));
    }

    // 404 — Not Found
    // Covers: auction, user, payment, bid not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, ex.getMessage(), "Not Found"));
    }

    // 500 — Internal Server Error
    // Covers: unhandled exceptions, Stripe errors, Cloudinary IO errors
    @ExceptionHandler({Exception.class, StripeException.class, IOException.class})
    public ResponseEntity<ErrorResponse> handleServerError(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, ex.getMessage(), "Internal Server Error"));
    }
}