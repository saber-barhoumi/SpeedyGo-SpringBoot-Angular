package com.ski.speedygobackend.DTO;

import com.ski.speedygobackend.Enum.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ChatDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageDTO {
        private Long id;
        private Long senderId;
        private String senderName;
        private Long conversationId;
        private String content;
        private LocalDateTime timestamp; // Change from String to LocalDateTime
        private boolean read;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessageRequest {
        private Long conversationId;
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationDTO {
        private Long id;
        private String title;
        private LocalDateTime createdAt;
        private List<UserDTO> participants;
        private MessageDTO lastMessage;

        public LocalDateTime getLastMessageTimestamp() {
            return lastMessage != null ? lastMessage.getTimestamp() : null;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Long userId;
        private String firstName;
        private String lastName;
        private String email;
        private Role role;
        private boolean online;
        private byte[] profilePicture;
        private String profilePictureType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatNotification {
        private Long conversationId;
        private Long senderId;
        private String senderName;
        private String content;
        private LocalDateTime timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatusUpdate {
        private Long userId;
        private String email;
        private boolean online;
    }
}