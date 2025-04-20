package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.model.Conversation;
import com.ski.speedygobackend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdOrderByTimestampAsc(Long conversationId);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = ?1 ORDER BY m.timestamp DESC")
    List<Message> findMessagesByConversationOrderByTimestampDesc(Long conversationId);
    List<Message> findByConversationOrderByTimestampAsc(Conversation conversation);

    Optional<Message> findTopByConversationOrderByTimestampDesc(Conversation conversation);

    List<Message> findByConversationAndIsReadFalseAndSenderNot(Conversation conversation, User sender);
}