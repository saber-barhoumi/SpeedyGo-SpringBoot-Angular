package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.UserManagement.PasswordResetToken;
import com.ski.speedygobackend.Entity.UserManagement.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken t WHERE t.user.UserId = :userId")
    void deleteByUser_UserId(@Param("userId") Long userId);

    // Alternative method
    Optional<PasswordResetToken> findByUser(User user);
}