// TripHistoryRepository.java
package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.model.TripHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripHistoryRepository extends JpaRepository<TripHistory, Long> {
    List<TripHistory> findByFromLabelAndToLabel(String fromLabel, String toLabel);
}
