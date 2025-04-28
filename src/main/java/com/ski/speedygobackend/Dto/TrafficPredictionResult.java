package com.ski.speedygobackend.Dto;

import com.ski.speedygobackend.Enum.TrafficLevel;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TrafficPredictionResult {
    private TrafficLevel level;
    private double confidence; // entre 0.0 et 1.0
}
