package com.ski.speedygobackend.Controller.UserManagement;

import com.ski.speedygobackend.DTO.PasswordResetRequestDTO;
import com.ski.speedygobackend.Service.UserManagement.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/password")
@CrossOrigin(origins = "http://localhost:4200")
public class PasswordResetController {
    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody PasswordResetRequestDTO resetRequest) {
        try {
            passwordResetService.initiatePasswordReset(resetRequest.getEmail());
            return ResponseEntity.ok("Password reset link sent to your email");
        } catch (RuntimeException e) {
            // Log the error for server-side diagnostics
            System.err.println("Error in forgotPassword: " + e.getMessage());
            e.printStackTrace();  // Print stack trace for debugging

            // Return a more specific error message to the client
            String errorMessage = e.getMessage() != null && !e.getMessage().isEmpty()
                    ? e.getMessage()
                    : "Authentication failed";
            return ResponseEntity.badRequest().body(errorMessage);
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequestDTO resetRequest) {
        try {
            passwordResetService.resetPassword(resetRequest);
            return ResponseEntity.ok("Password reset successful");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateResetToken(token);
        return isValid
                ? ResponseEntity.ok("Token is valid")
                : ResponseEntity.badRequest().body("Invalid or expired token");
    }
}