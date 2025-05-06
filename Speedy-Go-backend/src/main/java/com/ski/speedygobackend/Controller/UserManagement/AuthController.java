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

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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

            // ✅ Ajouter ici vérification si l'utilisateur est banni
            if (user.isBanned()) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Your account is banned. Please contact support."));
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
    public ResponseEntity<?> register(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("birthDate") String birthDate,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("address") String address,
            @RequestParam("sexe") String sexeStr,
            @RequestParam("role") String roleStr,
            @RequestParam(value = "profile_picture", required = false) MultipartFile profilePicture
    ) {
        try {
            // Validation image si elle existe
            if (profilePicture != null && !profilePicture.isEmpty()) {
                if (!profilePicture.getContentType().startsWith("image/")) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid file type. Only images are allowed"));
                }
                // Vérifier la taille du fichier
                if (profilePicture.getSize() > MAX_FILE_SIZE) {
                    return ResponseEntity.badRequest().body(Map.of("error", "File is too large, max size is 5MB"));
                }
            }

            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
            }

            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            user.setBirthDate(LocalDate.parse(birthDate, formatter));
            user.setPhoneNumber(phoneNumber);
            user.setAddress(address);

            // Enum parsing
            try {
                user.setSexe(Sexe.valueOf(sexeStr));
                user.setRole(Role.valueOf(roleStr));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid enum value: " + e.getMessage()));
            }

            // Enregistrement de la photo de profil si elle existe
            if (profilePicture != null && !profilePicture.isEmpty()) {
                user.setProfilePicture(profilePicture.getBytes());
                user.setProfilePictureType(profilePicture.getContentType());
            }

            User savedUser = userRepository.save(user);

            String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole(), savedUser.getUserId());

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

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
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
