package com.ski.speedygobackend.security;

import com.ski.speedygobackend.Enum.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtils {

    private final Key SECRET_KEY;

    public JwtUtils(@Value("${jwt.secret}") String secret) {
        this.SECRET_KEY = Keys.hmacShaKeyFor(Base64.getEncoder().encode(secret.getBytes()));
    }

    // Method to generate JWT Token with email, role, and userId
    public String generateToken(String email, Role role, Long userId) {
        return Jwts.builder()
                .setSubject(email) // Use email as unique identifier
                .claim("role", role.name()) // Store single role as string
                .claim("id", userId) // Store userId
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours expiration
                .signWith(SECRET_KEY)
                .compact();
    }

    // Method to validate the token
    public boolean validateToken(String token, String email) {
        try {
            String extractedEmail = extractUsername(token);
            return (email.equals(extractedEmail) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    // Extract the claims from the token
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    // Extract the username (email) from the token
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // Extract role from the token
    public Role extractRole(String token) {
        String roleName = extractClaims(token).get("role", String.class);
        return Role.valueOf(roleName);
    }

    // Extract the user ID from the token
    public Long extractUserId(String token) {
        return Long.valueOf(extractClaims(token).get("id").toString());
    }

    // Check if the token is expired
    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }
}