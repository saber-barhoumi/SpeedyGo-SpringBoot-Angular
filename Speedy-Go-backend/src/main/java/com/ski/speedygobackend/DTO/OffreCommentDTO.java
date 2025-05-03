package com.ski.speedygobackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OffreCommentDTO {
    private Long commentId;
    private String text;
    private Long userId;
    private String username;
    private Long offreId;
    private LocalDateTime createdAt;
    private Boolean badWord;
}