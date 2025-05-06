package com.ski.speedygobackend.Controller.UserManagement;

import com.ski.speedygobackend.DTO.UserDTO;
import com.ski.speedygobackend.DTO.UserUpdateDTO;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.Role;
import com.ski.speedygobackend.Enum.Sexe;
import com.ski.speedygobackend.Service.UserManagement.UserServicesImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Base64;

@RestController
@RequestMapping("api/user")
public class UserRestController {
    private final UserServicesImpl userService;

    public UserRestController(UserServicesImpl userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    @GetMapping("/getUser/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping("/add")
    public ResponseEntity<User> createUser(
            @RequestParam("first_name") String firstName,
            @RequestParam("last_name") String lastName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("birth_date") String birthDate, // Expecting a String
            @RequestParam("phone_number") String phoneNumber,
            @RequestParam("address") String address,
            @RequestParam("sexe") Sexe sexe,
            @RequestParam("role") Role role,
            @RequestParam("profilePicture") MultipartFile profilePicture) {

        // Validate file type
        if (!profilePicture.getContentType().startsWith("image/")) {
            return new ResponseEntity<>(HttpStatus.UNSUPPORTED_MEDIA_TYPE); // 415
        }

        // Validate file size (e.g., 5MB limit)
        if (profilePicture.getSize() > 5 * 1024 * 1024) {
            return new ResponseEntity<>(HttpStatus.PAYLOAD_TOO_LARGE); // 413
        }

        try {
            // Save the file and create the user
            String fileName = System.currentTimeMillis() + "_" + profilePicture.getOriginalFilename();
            Path filePath = Paths.get("uploads/profile-pictures/" + fileName);
            Files.createDirectories(filePath.getParent()); // Ensure the directory exists
            Files.copy(profilePicture.getInputStream(), filePath);

            // Parse the birthDate String into a LocalDate
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate parsedBirthDate = LocalDate.parse(birthDate, formatter);

            // Create the User object
            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPassword(password);
            user.setBirthDate(parsedBirthDate); // Set the parsed LocalDate
            user.setPhoneNumber(phoneNumber);
            user.setAddress(address);
            user.setSexe(sexe);
            user.setRole(role);

            // Save the image as bytes
            user.setProfilePicture(profilePicture.getBytes()); // Set the byte[] instead of the file path

            // Save the user
            User savedUser = userService.saveUser(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        if (user != null) {
            // Convert profile picture to Base64
            String profilePictureBase64 = null;
            if (user.getProfilePicture() != null) {
                profilePictureBase64 = Base64.getEncoder().encodeToString(user.getProfilePicture());
            }

            // Create a DTO to return the user data
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getUserId());
            userDTO.setFirstName(user.getFirstName());
            userDTO.setLastName(user.getLastName());
            userDTO.setEmail(user.getEmail());
            userDTO.setAddress(user.getAddress());
            userDTO.setPhoneNumber(user.getPhoneNumber());
            userDTO.setProfilePicture(profilePictureBase64);

            return ResponseEntity.ok(userDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @PutMapping("/update/{userId}")
    public ResponseEntity<UserDTO> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody UserUpdateDTO updateDTO) {
        try {
            User updatedUser = userService.updateUserProfile(userId, updateDTO);

            // Convert to DTO
            UserDTO userDTO = convertToDTO(updatedUser);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Helper method to convert User to UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getUserId());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setEmail(user.getEmail());
        userDTO.setAddress(user.getAddress());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setSexe(user.getSexe().name());
        userDTO.setRole(user.getRole().name());

        if (user.getProfilePicture() != null) {
            userDTO.setProfilePicture(Base64.getEncoder().encodeToString(user.getProfilePicture()));
        }

        return userDTO;
    }

    // Add method to upload profile picture
    @PostMapping("/{userId}/profile-picture")
    public ResponseEntity<UserDTO> uploadProfilePicture(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            User updatedUser = userService.updateProfilePicture(userId, file);
            UserDTO userDTO = convertToDTO(updatedUser);
            return ResponseEntity.ok(userDTO);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

