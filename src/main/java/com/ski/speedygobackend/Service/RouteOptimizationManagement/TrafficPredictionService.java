package com.ski.speedygobackend.Service.RouteOptimizationManagement;

import com.ski.speedygobackend.Dto.TrafficPredictionResult;
import com.ski.speedygobackend.Enum.TrafficLevel;
import com.ski.speedygobackend.model.TripHistory;
import com.ski.speedygobackend.Repository.TripHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrafficPredictionService {

    private final TripHistoryRepository tripHistoryRepository;

    public TrafficPredictionResult predictTraffic(String start, String end, LocalDateTime dateTime) {
        List<TripHistory> histories = tripHistoryRepository
                .findByFromLabelAndToLabel(start, end);

        if (histories.isEmpty()) {
            return new TrafficPredictionResult(TrafficLevel.MEDIUM, 0.0); // confiance 0 si aucun historique
        }

        DayOfWeek dayOfWeek = dateTime.getDayOfWeek();
        LocalTime time = dateTime.toLocalTime();

        long similarCount = histories.stream()
                .filter(h -> isSimilarTime(h.getStartTime(), time, dayOfWeek))
                .count();

        long highCount = histories.stream()
                .filter(h -> h.getTrafficLevel().equalsIgnoreCase("high"))
                .filter(h -> isSimilarTime(h.getStartTime(), time, dayOfWeek))
                .count();

        long mediumCount = histories.stream()
                .filter(h -> h.getTrafficLevel().equalsIgnoreCase("medium"))
                .filter(h -> isSimilarTime(h.getStartTime(), time, dayOfWeek))
                .count();

        long lowCount = similarCount - highCount - mediumCount;

        // Déterminer le niveau dominant
        TrafficLevel level;
        long max = Math.max(Math.max(highCount, mediumCount), lowCount);
        if (max == highCount) {
            level = TrafficLevel.HIGH;
        } else if (max == mediumCount) {
            level = TrafficLevel.MEDIUM;
        } else {
            level = TrafficLevel.LOW;
        }

        // Calcul de la confiance : proportion du niveau dominant
        double confidence = similarCount > 0 ? (double) max / similarCount : 0.0;

        return new TrafficPredictionResult(level, confidence);
    }

    private boolean isSimilarTime(LocalDateTime historyTime, LocalTime currentTime, DayOfWeek currentDay) {
        return historyTime.getDayOfWeek() == currentDay &&
                Math.abs(historyTime.toLocalTime().getHour() - currentTime.getHour()) <= 1;
    }
}
