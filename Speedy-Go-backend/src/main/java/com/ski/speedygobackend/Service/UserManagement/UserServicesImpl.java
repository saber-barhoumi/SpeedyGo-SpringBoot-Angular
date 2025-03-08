package com.ski.speedygobackend.Service.UserManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Service.RecrutementManagement.IRecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServicesImpl implements IUserServices {

    private final IUserRepository userRepository;
    private final IRecruitmentService recruitmentService; // Dependency Injection

    @Autowired // This is important!
    public UserServicesImpl(IUserRepository userRepository, IRecruitmentService recruitmentService) {
        this.userRepository = userRepository;
        this.recruitmentService = recruitmentService;
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

    public boolean isDeliveryRecruitmentCompleted(User user) {
        return recruitmentService.isDeliveryRecruitmentCompleted(user); // Use the instance
    }
}