package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.UserManagement.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IUserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
}
