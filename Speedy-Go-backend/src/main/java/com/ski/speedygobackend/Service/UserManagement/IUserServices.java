package com.ski.speedygobackend.Service.UserManagement;

import com.ski.speedygobackend.DTO.UserUpdateDTO;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IUserServices {
    List<User> getAllUsers();
    User getUserById(Long id);
    User saveUser(User user);
    void deleteUser(Long id);

    // Add new method signatures
    User updateUserProfile(Long userId, UserUpdateDTO updateDTO);
    User updateProfilePicture(Long userId, MultipartFile file) throws IOException;
}
