package com.ski.speedygobackend.Entity.ReportManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.ReportStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level=AccessLevel.PRIVATE)
@Entity
public class Report implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long reportID;
    String reportName;
    String reportDescription;
    @Enumerated(EnumType.STRING)
    ReportStatus status; ;

    @ManyToOne
    private User user;
}
