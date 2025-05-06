package com.ski.speedygobackend.Service.UserManagement;

import com.ski.speedygobackend.DTO.PasswordResetRequestDTO;
import com.ski.speedygobackend.Entity.UserManagement.PasswordResetToken;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PasswordResetService {
    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Transactional
    public void initiatePasswordReset(String email) {
        try {
            // Find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            // Check if a token already exists for this user and delete it
            tokenRepository.deleteByUser_UserId(user.getUserId());

            // Generate reset token
            String token = UUID.randomUUID().toString();

            // Create and save password reset token
            PasswordResetToken resetToken = new PasswordResetToken(token, user);
            tokenRepository.save(resetToken);

            // Construct reset link
            String resetLink = "http://localhost:4200/reset-password?token=" + token;

            // Send email
            try {
                emailService.sendPasswordResetEmail(email, resetLink);
            } catch (Exception e) {
                System.err.println("Failed to send password reset email: " + e.getMessage());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initiate password reset: " + e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(PasswordResetRequestDTO resetRequest) {
        // Find token
        PasswordResetToken resetToken = tokenRepository.findByToken(resetRequest.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        // Check token expiration
        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired");
        }

        // Get user and update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);

        // Delete the used token
        tokenRepository.delete(resetToken);
    }

    @Transactional
    public boolean validateResetToken(String token) {
        return tokenRepository.findByToken(token)
                .map(resetToken -> !resetToken.isExpired())
                .orElse(false);
    }
}