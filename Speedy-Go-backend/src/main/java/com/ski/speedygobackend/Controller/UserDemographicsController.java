package com.ski.speedygobackend.Controller;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for user demographic data endpoints, used in the recommendation system.
 *
 * These endpoints provide demographics data for the LLM-powered recommendation system.
 *
 * Recommendation workflow:
 * 1. User logs in and visits the store page
 * 2. Frontend checks for demographic data (age, gender) in localStorage
 * 3. If missing, it calls fetchAndUpdateUserDemographics from AuthService
 * 4. This service calls /api/user/getUser/{userId} to get the user data
 * 5. Data is stored in localStorage and used to build a user profile
 * 6. User profile is included in the LLM prompt to Groq API
 * 7. Groq returns personalized store recommendations
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserDemographicsController {

    private static final Logger logger = LoggerFactory.getLogger(UserDemographicsController.class);

    @Autowired
    private IUserRepository userRepository;

    /**
     * Admin endpoint to get user demographic data
     * @param userId The user ID
     * @return Demographic data
     */
    @GetMapping("/admin/users/{userId}/demographics")
    public ResponseEntity<?> getUserDemographics(@PathVariable Long userId) {
        logger.info("Admin endpoint called for user demographics: {}", userId);

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Map<String, Object> demographics = new HashMap<>();
            demographics.put("sexe", user.getSexe().toString());
            demographics.put("birthDate", user.getBirthDate().toString());

            logger.info("Demographics data found for user {}: sexe={}, birthDate={}",
                    userId, user.getSexe(), user.getBirthDate());
            return ResponseEntity.ok(demographics);
        }

        logger.warn("User not found: {}", userId);
        return ResponseEntity.notFound().build();
    }

    /**
     * Public endpoint for user demographic data
     * @param userId The user ID
     * @return Demographic data
     */
    @GetMapping("/public/users/{userId}/demographics")
    public ResponseEntity<?> getPublicUserDemographics(@PathVariable Long userId) {
        logger.info("Public endpoint called for user demographics: {}", userId);

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Map<String, Object> demographics = new HashMap<>();
            demographics.put("sexe", user.getSexe().toString());
            demographics.put("birthDate", user.getBirthDate().toString());

            logger.info("Demographics data found for user {}: sexe={}, birthDate={}",
                    userId, user.getSexe(), user.getBirthDate());
            return ResponseEntity.ok(demographics);
        }

        logger.warn("User not found: {}", userId);
        return ResponseEntity.notFound().build();
    }

    /**
     * Get just the user gender
     * @param userId The user ID
     * @return The user gender
     */
    @GetMapping("/public/users/{userId}/gender")
    public ResponseEntity<?> getUserGender(@PathVariable Long userId) {
        logger.info("Getting gender for user: {}", userId);

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Map<String, String> response = new HashMap<>();
            response.put("sexe", user.getSexe().toString());

            logger.info("Gender found for user {}: {}", userId, user.getSexe());
            return ResponseEntity.ok(response);
        }

        logger.warn("User not found: {}", userId);
        return ResponseEntity.notFound().build();
    }
} 