package com.ski.speedygobackend.Service.UserManagement;

import com.ski.speedygobackend.DTO.UserUpdateDTO;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Service.RecrutementManagement.IRecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class UserServicesImpl implements IUserServices {

    private final IUserRepository userRepository;

    @Autowired // This is important!
    public UserServicesImpl(IUserRepository userRepository, IRecruitmentService recruitmentService) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }



    public User updateUserProfile(Long userId, UserUpdateDTO updateDTO) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user fields
        existingUser.setFirstName(updateDTO.getFirstName());
        existingUser.setLastName(updateDTO.getLastName());
        existingUser.setEmail(updateDTO.getEmail());
        existingUser.setPhoneNumber(updateDTO.getPhoneNumber());
        existingUser.setAddress(updateDTO.getAddress());

        // Only update sexe and role if they are provided
        if (updateDTO.getSexe() != null) {
            existingUser.setSexe(updateDTO.getSexe());
        }
        if (updateDTO.getRole() != null) {
            existingUser.setRole(updateDTO.getRole());
        }

        return userRepository.save(existingUser);
    }

    public User updateProfilePicture(Long userId, MultipartFile file) throws IOException {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type and size
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }

        // Save profile picture
        existingUser.setProfilePicture(file.getBytes());
        existingUser.setProfilePictureType(file.getContentType());

        return userRepository.save(existingUser);
    }




}