package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class NotificationService {

    private final IUserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    public NotificationService(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void sendNotification(Long userId, String title, String message) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Log the notification (in a real system, this would be persisted or sent)
            logger.info("Notification to {}: {} - {}", user.getEmail(), title, message);

            // In a real application, you would implement actual notification delivery here
            // For example: email, push notifications, SMS, etc.
        } else {
            logger.warn("Could not send notification to user ID {}: user not found", userId);
        }
    }

    // Method to schedule notifications based on trip start time
    public void scheduleStartTimeNotification(Long userId, String title, String message, LocalDateTime notificationTime) {
        // In a real implementation, this would use a task scheduler
        // For now, just log it
        logger.info("Scheduled notification for user {} at {}: {} - {}",
                userId, notificationTime, title, message);
    }
}