package com.ski.speedygobackend.Controller.CommunicationManagement;

import com.ski.speedygobackend.DTO.ChatDTOs;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Service.CommunicationManagement.IChatService;
import com.ski.speedygobackend.DTO.ChatDTOs.ChatNotification;
import com.ski.speedygobackend.DTO.ChatDTOs.MessageDTO;
import com.ski.speedygobackend.DTO.SendMessageRequest;
import com.ski.speedygobackend.DTO.ChatDTOs.UserStatusUpdate;
import com.ski.speedygobackend.model.Conversation;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final IChatService chatService;

    // Add this DTO class for creating conversations
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateConversationRequest {
        private Long participantId;
        private String title; // Optional: if you want to allow custom titles
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload SendMessageRequest messageRequest, Principal principal) {
        if (principal == null) {
            logger.error("Principal is null - authentication required for messaging");
            return;
        }

        String senderEmail = principal.getName();

        // Debug the raw request
        try {
            logger.info("Raw message request: {}", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(messageRequest));
        } catch (Exception e) {
            logger.error("Error serializing request", e);
        }

        logger.info("Received message request from {} for conversation {}", senderEmail, messageRequest.getConversationId());

        // Validate conversation ID
        if (messageRequest.getConversationId() == null) {
            logger.error("Cannot process message with null conversationId from user {}", senderEmail);
            return;
        }

        try {
            MessageDTO message = chatService.saveMessage(messageRequest, senderEmail);

            // Send message to the conversation topic
            messagingTemplate.convertAndSend(
                    "/topic/conversation." + messageRequest.getConversationId(),
                    message
            );
            // Rest of the method remains the same...
        } catch (Exception e) {
            logger.error("Error processing message request", e);
            throw e;
        }
    }

    @MessageMapping("/chat.userStatus")
    public void updateUserStatus(@Payload boolean isOnline, Principal principal) {
        String email = principal.getName();
        logger.info("Updating user status for {}: online={}", email, isOnline);

        try {
            User user = chatService.updateUserOnlineStatus(email, isOnline);

            UserStatusUpdate statusUpdate = new UserStatusUpdate(
                    user.getUserId(),
                    user.getEmail(),
                    isOnline
            );

            // Broadcast user status to all connected clients
            messagingTemplate.convertAndSend("/topic/user.status", statusUpdate);
            logger.debug("User status broadcasted: {}", statusUpdate);
        } catch (Exception e) {
            logger.error("Error updating user status", e);
            throw e;
        }
    }

    @GetMapping("/api/conversations")
    @ResponseBody
    public List<ChatDTOs.ConversationDTO> getUserConversations(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        logger.info("Fetching conversations for user: {}", userDetails.getUsername());

        try {
            return chatService.getUserConversations(userDetails.getUsername());
        } catch (Exception e) {
            logger.error("Error fetching user conversations", e);
            throw e;
        }
    }

    @GetMapping("/api/conversations/{conversationId}/messages")
    @ResponseBody
    public ResponseEntity<?> getConversationMessages(
            @PathVariable Long conversationId,
            Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        logger.info("Fetching messages for conversation {} requested by {}", conversationId, userDetails.getUsername());

        try {
            List<MessageDTO> messages = chatService.getConversationMessages(conversationId, userDetails.getUsername());
            logger.debug("Found {} messages for conversation {}", messages.size(), conversationId);
            return ResponseEntity.ok(messages);
        } catch (EntityNotFoundException e) {
            logger.error("Conversation not found: {}", conversationId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", "Conversation not found",
                            "conversationId", conversationId
                    ));
        } catch (Exception e) {
            logger.error("Error retrieving conversation messages", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "An unexpected error occurred",
                            "message", e.getMessage()
                    ));
        }
    }

    @PostMapping("/api/conversations")
    public ResponseEntity<ChatDTOs.ConversationDTO> createConversation(
            Authentication authentication,
            @RequestBody CreateConversationRequest request
    ) {
        try {
            String creatorEmail = authentication.getName();

            // Use the createConversation method that takes title and participant IDs
            Conversation conversation = chatService.createConversation(
                    request.getTitle() != null ? request.getTitle() : "New Conversation",
                    Set.of(request.getParticipantId())
            );

            // Convert to DTO using the service's conversion method
            ChatDTOs.ConversationDTO conversationDTO = chatService.convertToConversationDTO(conversation);

            return ResponseEntity.status(HttpStatus.CREATED).body(conversationDTO);
        } catch (EntityNotFoundException e) {
            logger.error("Error creating conversation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error creating conversation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/api/conversations/common")
    public ResponseEntity<ChatDTOs.ConversationDTO> createOrGetCommonConversation(
            Authentication authentication,
            @RequestBody Map<String, String> request
    ) {
        try {
            String creatorEmail = authentication.getName();
            String title = request.getOrDefault("title", "General Chat");

            // Check if common conversation exists
            Optional<Conversation> existingCommon = chatService.findCommonConversation();

            Conversation conversation;
            if (existingCommon.isPresent()) {
                // Add current user to existing conversation if not already a participant
                conversation = chatService.addUserToConversation(
                        existingCommon.get().getId(),
                        creatorEmail
                );
            } else {
                // Create new common conversation with all users
                conversation = chatService.createCommonConversation(title);
            }

            ChatDTOs.ConversationDTO conversationDTO = chatService.convertToConversationDTO(conversation);
            return ResponseEntity.status(HttpStatus.CREATED).body(conversationDTO);
        } catch (Exception e) {
            logger.error("Error creating/getting common conversation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PostMapping("/api/conversations/{conversationId}/messages")
    public ResponseEntity<MessageDTO> sendMessageHttp(
            @PathVariable Long conversationId,
            @RequestBody SendMessageRequest messageRequest,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String senderEmail = userDetails.getUsername();
            logger.info("Received HTTP message from {} for conversation {}", senderEmail, conversationId);

            // Ensure the conversationId in the URL matches the one in the request
            messageRequest.setConversationId(conversationId);

            MessageDTO message = chatService.saveMessage(messageRequest, senderEmail);

            // Broadcast to websocket clients
            messagingTemplate.convertAndSend(
                    "/topic/conversation." + conversationId,
                    message
            );

            return ResponseEntity.ok(message);
        } catch (Exception e) {
            logger.error("Error sending message via HTTP", e);
            return ResponseEntity.internalServerError().build();
        }
    }


    @PutMapping("/api/conversations/{conversationId}/read")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long conversationId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            logger.info("Marking conversation {} as read for user {}", conversationId, userEmail);

            chatService.markConversationAsRead(conversationId, userEmail);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            logger.error("Conversation not found: {}", conversationId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error marking conversation as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}