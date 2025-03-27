package com.ski.speedygobackend.Controller.UserManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.Role;
import com.ski.speedygobackend.Enum.Sexe;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            if (email == null || password == null) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Email and password are required"));
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }

            String token = jwtUtils.generateToken(
                    user.getEmail(),
                    user.getRole(),
                    user.getUserId()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "role", user.getRole(),
                    "profilePicture", user.getProfilePicture() != null ?
                            Base64.getEncoder().encodeToString(user.getProfilePicture()) : null,
                    "profilePictureType", user.getProfilePictureType()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestParam Map<String, String> userMap, @RequestParam("profile_picture") MultipartFile profilePicture) {
        try {
            System.out.println("userMap: " + userMap);
            System.out.println("profilePicture: " + (profilePicture != null ? profilePicture.getOriginalFilename() : "null"));

            // Validate profile picture
            if (profilePicture == null || profilePicture.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Profile picture is required"));
            }

            if (!profilePicture.getContentType().startsWith("image/")) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Invalid file type. Only images are allowed"));
            }

            // Check if email already exists
            if (userRepository.findByEmail(userMap.get("email")).isPresent()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Email already registered"));
            }

            // Create a new User object
            User user = new User();
            user.setFirstName(userMap.get("firstName"));
            user.setLastName(userMap.get("lastName"));
            user.setEmail(userMap.get("email"));
            user.setPassword(passwordEncoder.encode(userMap.get("password")));

            // Convert birthDate from String to LocalDate
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate birthDate = LocalDate.parse(userMap.get("birthDate"), formatter);
            user.setBirthDate(birthDate);

            user.setPhoneNumber(userMap.get("phoneNumber"));
            user.setAddress(userMap.get("address"));

            // Convert String to Sexe enum
            Sexe sexe;
            try {
                sexe = Sexe.valueOf(userMap.get("sexe"));
            } catch (IllegalArgumentException e) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Invalid Sexe value: " + userMap.get("sexe")));
            }
            user.setSexe(sexe);

            // Convert String to Role enum
            Role role;
            try {
                role = Role.valueOf(userMap.get("role"));
            } catch (IllegalArgumentException e) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Invalid Role value: " + userMap.get("role")));
            }
            user.setRole(role);

            // Save the image as bytes
            user.setProfilePicture(profilePicture.getBytes());
            user.setProfilePictureType(profilePicture.getContentType());

            // Save user
            User savedUser = userRepository.save(user);

            // Generate token
            String token = jwtUtils.generateToken(
                    savedUser.getEmail(),
                    savedUser.getRole(),
                    savedUser.getUserId()
            );

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                    "userId", savedUser.getUserId(),
                    "email", savedUser.getEmail(),
                    "firstName", savedUser.getFirstName(),
                    "lastName", savedUser.getLastName(),
                    "role", savedUser.getRole(),
                    "profilePicture", savedUser.getProfilePicture() != null ?
                            Base64.getEncoder().encodeToString(savedUser.getProfilePicture()) : null,
                    "profilePictureType", savedUser.getProfilePictureType()
            ));

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        }  catch (IllegalArgumentException e) {
            e.printStackTrace(); // Log the exception
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Invalid enum value: " + e.getMessage()));
        }
        catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid token format"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtils.extractUsername(token);

            if (jwtUtils.validateToken(token, email)) {
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "user", Map.of(
                                "userId", user.getUserId(),
                                "email", user.getEmail(),
                                "role", user.getRole(),
                                "profilePicture", user.getProfilePicture() != null ?
                                        Base64.getEncoder().encodeToString(user.getProfilePicture()) : null,
                                "profilePictureType", user.getProfilePictureType()
                        )
                ));
            } else {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("valid", false));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}