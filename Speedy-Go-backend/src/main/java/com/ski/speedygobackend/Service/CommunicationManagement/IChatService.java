package com.ski.speedygobackend.Service.CommunicationManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.DTO.ChatDTOs.ConversationDTO;
import com.ski.speedygobackend.DTO.ChatDTOs.MessageDTO;
import com.ski.speedygobackend.DTO.SendMessageRequest;
import com.ski.speedygobackend.model.Conversation;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface IChatService {
    List<ConversationDTO> getUserConversations(String email);
    List<MessageDTO> getConversationMessages(Long conversationId, String email);
    MessageDTO saveMessage(SendMessageRequest messageRequest, String senderEmail);
    Set<User> getConversationParticipants(Long conversationId);
    Conversation createConversation(String title, Set<Long> participantIds);
    User updateUserOnlineStatus(String email, boolean online);
    ConversationDTO convertToConversationDTO(Conversation conversation);

    // Add these new methods
    Optional<Conversation> findCommonConversation();
    Conversation createCommonConversation(String title);
    Conversation addUserToConversation(Long conversationId, String userEmail);

    void markConversationAsRead(Long conversationId, String email);
}