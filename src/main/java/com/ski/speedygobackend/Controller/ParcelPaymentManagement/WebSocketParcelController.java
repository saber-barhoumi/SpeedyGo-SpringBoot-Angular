package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Config.ParcelStatusPublisher;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketParcelController {

    private final IParcelServices parcelService;
    private final ParcelStatusPublisher statusPublisher;

    @MessageMapping("/track")
    public void trackParcel(String parcelId) {
        try {
            Long id = Long.parseLong(parcelId);
            Parcel parcel = parcelService.retrieveParcel(id);
            if (parcel != null) {
                statusPublisher.notifyStatusChange(id, parcel.getParcelstatus());
            }
        } catch (NumberFormatException e) {
            System.err.println("ID de colis invalide : " + parcelId);
        }
    }
}
