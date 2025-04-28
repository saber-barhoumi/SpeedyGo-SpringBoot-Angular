package com.ski.speedygobackend.Config;

import com.ski.speedygobackend.Enum.ParcelStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ParcelStatusPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyStatusChange(Long parcelId, ParcelStatus status) {
        messagingTemplate.convertAndSend(
                "/topic/parcel/" + parcelId + "/status",
                new StatusResponse(status.name())
        );
    }

    @Data
    @AllArgsConstructor
    private static class StatusResponse {
        private String status;
    }
}
