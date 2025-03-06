package com.ski.speedygobackend.Entity.CommunicationManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class ChatRoom implements Serializable  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long ChatRoomID;

    String name;

    LocalDateTime createdAt;

    @ManyToMany
    @JoinTable(
            name = "chatroom_user",
            joinColumns = @JoinColumn(name = "ChatroomId"),
            inverseJoinColumns = @JoinColumn(name = "UserId")
    )
    private Set<User> users;
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL)
    private List<SessionMessage> sessionMessages;
}

