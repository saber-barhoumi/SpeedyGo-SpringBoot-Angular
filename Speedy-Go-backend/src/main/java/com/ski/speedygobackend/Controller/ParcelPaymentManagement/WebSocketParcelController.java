package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Config.ParcelStatusPublisher;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class WebSocketParcelController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketParcelController.class);

    private final IParcelServices parcelService;
    private final ParcelStatusPublisher statusPublisher;

    @MessageMapping("/track")
    public void trackParcel(String parcelId) {
        try {
            Long id = Long.parseLong(parcelId);
            Optional<Parcel> parcelOpt = parcelService.findById(id);
            parcelOpt.ifPresent(parcel ->
                    statusPublisher.notifyStatusChange(id, parcel.getParcelstatus())
            );
            if (!parcelOpt.isPresent()) {
                logger.warn("Parcel not found for ID: {}", id);
            }
        } catch (NumberFormatException e) {
            logger.error("Invalid parcel ID format: {}", parcelId, e);
        }
    }
}