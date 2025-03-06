package com.ski.speedygobackend.Entity.ChatbotManagement;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class SpeedyMessage implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long SpeedyMessageId;

    private String content;
    private LocalDateTime timestamp;
    @ManyToOne
    @JoinColumn(name = "chat_id", nullable = false)
    private SpeedyChat speedyChat;
}
