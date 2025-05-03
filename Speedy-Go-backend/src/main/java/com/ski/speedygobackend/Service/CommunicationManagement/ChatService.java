package com.ski.speedygobackend.Service.CommunicationManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Service.UserManagement.IUserServices;
import com.ski.speedygobackend.DTO.ChatDTOs.ConversationDTO;
import com.ski.speedygobackend.DTO.ChatDTOs.MessageDTO;
import com.ski.speedygobackend.DTO.SendMessageRequest;
import com.ski.speedygobackend.DTO.ChatDTOs.UserDTO;
import com.ski.speedygobackend.model.Conversation;
import com.ski.speedygobackend.model.Message;
import com.ski.speedygobackend.Repository.ConversationRepository;
import com.ski.speedygobackend.Repository.MessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService implements IChatService {

    private final IUserServices userServices;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final IUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDTO> getUserConversations(String email) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        // Get all conversations for the user and convert to DTOs
        return user.getConversations().stream()
                .map(this::convertToConversationDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDTO> getConversationMessages(Long conversationId, String requesterEmail) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        // Verify if the user is a participant in the conversation
        Optional<User> requesterOpt = userRepository.findByEmail(requesterEmail);
        User requester = requesterOpt.orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!conversation.getParticipants().contains(requester)) {
            throw new SecurityException("User not authorized to view messages in this conversation");
        }

        List<Message> messages = messageRepository.findByConversationOrderByTimestampAsc(conversation);

        return messages.stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDTO saveMessage(SendMessageRequest messageRequest, String senderEmail) {
        Optional<User> senderOpt = userRepository.findByEmail(senderEmail);
        User sender = senderOpt.orElseThrow(() -> new EntityNotFoundException("Sender not found"));

        Conversation conversation = conversationRepository.findById(messageRequest.getConversationId())
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        if (!conversation.getParticipants().contains(sender)) {
            throw new SecurityException("User not authorized to send message to this conversation");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setConversation(conversation);
        message.setContent(messageRequest.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);

        Message savedMessage = messageRepository.save(message);
        return convertToMessageDTO(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<User> getConversationParticipants(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        return conversation.getParticipants();
    }

    @Override
    @Transactional
    public Conversation createConversation(String title, Set<Long> participantIds) {
        Set<User> participants = participantIds.stream()
                .map(id -> {
                    User user = userServices.getUserById(id);
                    if (user == null) {
                        throw new EntityNotFoundException("User not found with id: " + id);
                    }
                    return user;
                })
                .collect(Collectors.toSet());

        Conversation conversation = new Conversation();
        conversation.setTitle(title);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setParticipants(participants);

        Conversation savedConversation = conversationRepository.save(conversation);

        // Add the conversation to each participant
        participants.forEach(user -> {
            user.getConversations().add(savedConversation);
            userServices.saveUser(user);
        });

        return savedConversation;
    }

    @Override
    @Transactional
    public User updateUserOnlineStatus(String email, boolean online) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user = userOpt.orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setOnline(online);
        return userServices.saveUser(user);
    }

    @Override
    public ConversationDTO convertToConversationDTO(Conversation conversation) {
        List<UserDTO> participants = conversation.getParticipants().stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());

        MessageDTO lastMessage = messageRepository.findTopByConversationOrderByTimestampDesc(conversation)
                .map(this::convertToMessageDTO)
                .orElse(null);

        return new ConversationDTO(
                conversation.getId(),
                conversation.getTitle(),
                conversation.getCreatedAt(),
                participants,
                lastMessage
        );
    }

    // Helper methods for converting entities to DTOs
    private MessageDTO convertToMessageDTO(Message message) {
        return new MessageDTO(
                message.getId(),
                message.getSender().getUserId(),
                message.getSender().getFirstName() + " " + message.getSender().getLastName(),
                message.getConversation().getId(),
                message.getContent(),
                message.getTimestamp(), // Use LocalDateTime directly
                message.isRead()
        );
    }

    private UserDTO convertToUserDTO(User user) {
        return new UserDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.isOnline(),
                user.getProfilePicture(),
                user.getProfilePictureType()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Conversation> findCommonConversation() {
        // Assuming common conversations have a specific title pattern or flag
        return conversationRepository.findByTitle("General Chat");
    }

    @Override
    @Transactional
    public Conversation createCommonConversation(String title) {
        // Get all users to add to the common conversation
        List<User> allUsers = userRepository.findAll();

        Conversation conversation = new Conversation();
        conversation.setTitle(title);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setParticipants(new HashSet<>(allUsers));

        Conversation savedConversation = conversationRepository.save(conversation);

        // Add the conversation to each user
        allUsers.forEach(user -> {
            user.getConversations().add(savedConversation);
            userRepository.save(user);
        });

        return savedConversation;
    }

    @Override
    @Transactional
    public Conversation addUserToConversation(Long conversationId, String userEmail) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!conversation.getParticipants().contains(user)) {
            conversation.getParticipants().add(user);
            user.getConversations().add(conversation);
            userRepository.save(user);
            return conversationRepository.save(conversation);
        }

        return conversation;
    }
    @Override
    @Transactional
    public void markConversationAsRead(Long conversationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + userEmail));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        // Check if user is participant
        if (!conversation.getParticipants().contains(user)) {
            throw new SecurityException("User not authorized for this conversation");
        }

        // Mark all messages as read (except user's own messages)
        List<Message> unreadMessages = messageRepository.findByConversationAndIsReadFalseAndSenderNot(
                conversation, user);

        for (Message message : unreadMessages) {
            message.setRead(true);
            messageRepository.save(message);
        }
    }
}