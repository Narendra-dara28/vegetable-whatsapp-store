package com.vegetableapp.service;

import com.vegetableapp.dto.AuthResponse;
import com.vegetableapp.dto.LoginRequest;
import com.vegetableapp.entity.Admin;
import com.vegetableapp.exception.BadRequestException;
import com.vegetableapp.repository.AdminRepository;
import com.vegetableapp.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AdminRepository adminRepository;

    public AuthService(AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            AdminRepository adminRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.adminRepository = adminRepository;
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername().trim(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Admin admin = adminRepository.findByUsernameIgnoreCase(request.getUsername().trim())
                    .orElseThrow(() -> new BadRequestException("Admin not found"));

            String token = tokenProvider.generateToken(admin.getUsername(), admin.getRole());

            return new AuthResponse(
                    token,
                    admin.getUsername(),
                    admin.getRole(),
                    tokenProvider.getJwtExpirationMs());
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }
}
