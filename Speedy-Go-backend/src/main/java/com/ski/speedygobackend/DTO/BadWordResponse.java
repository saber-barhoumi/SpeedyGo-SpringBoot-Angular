package com.ski.speedygobackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BadWordResponse {
    private String text;
    private String sentiment;
    private String language;
    private String model_used;
}