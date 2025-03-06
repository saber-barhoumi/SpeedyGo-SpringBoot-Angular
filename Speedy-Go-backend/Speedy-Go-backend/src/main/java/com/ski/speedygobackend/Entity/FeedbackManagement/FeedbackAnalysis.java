package com.ski.speedygobackend.Entity.FeedbackManagement;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import com.ski.speedygobackend.Enum.FeedbackType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class FeedbackAnalysis  implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String feedback;
    private double rating;
    private String description;
    private LocalDateTime feedbackDate;
    private String reponseStatus;
    private Boolean resolved;
    @Enumerated(EnumType.STRING)
    FeedbackType feedbackType;


    @OneToOne
    private Trip trip;
}
