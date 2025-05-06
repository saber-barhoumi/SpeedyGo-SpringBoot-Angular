package com.ski.speedygobackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FideliteDTO {
    private Long id;
    private Long userId;
    private int points;
    private String storeName;
    private LocalDateTime lastUsed;
}