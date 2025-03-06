package com.ski.speedygobackend.Entity.ChatbotManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.ChatStatus;
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

public class SpeedyChat implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long SpeedyChatId ;
    private String message;
    LocalDateTime createdAt ;

    @Enumerated(EnumType.STRING)
    ChatStatus status;

    @OneToMany(mappedBy = "speedyChat", cascade = CascadeType.ALL)
    private Set<SpeedyMessage> messages;
    @ManyToOne
    private User user;
}
