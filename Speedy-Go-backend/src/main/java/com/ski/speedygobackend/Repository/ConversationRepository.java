package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.UserId = ?1")
    List<Conversation> findByParticipantId(Long userId);

    @Query("SELECT c FROM Conversation c JOIN c.participants p1 JOIN c.participants p2 " +
            "WHERE p1.UserId = ?1 AND p2.UserId = ?2 AND SIZE(c.participants) = 2")
    Optional<Conversation> findConversationBetweenUsers(Long userId1, Long userId2);

    Optional<Conversation> findByTitle(String generalChat);
}