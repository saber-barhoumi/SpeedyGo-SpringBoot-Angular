package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.UserManagement.User;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@PersistenceContext(unitName = "mysqlPersistenceUnit")
public interface IUserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPasswordResetToken(String token);

}
