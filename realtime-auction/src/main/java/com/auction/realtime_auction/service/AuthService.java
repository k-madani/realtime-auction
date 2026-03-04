package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.AuthResponse;
import com.auction.realtime_auction.dto.LoginRequest;
import com.auction.realtime_auction.dto.RegisterRequest;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.UnauthorizedException;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.UserRepository;
import com.auction.realtime_auction.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Register new user
    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already registered");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        // Save to database
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());

        // Return response with token
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }

    // Login user
    public AuthResponse login(LoginRequest request) {
        // Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        // Check if password matches
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());

        // Return response with token
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }
}