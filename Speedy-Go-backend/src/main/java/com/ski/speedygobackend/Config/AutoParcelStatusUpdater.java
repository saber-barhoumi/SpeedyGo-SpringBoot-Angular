package com.ski.speedygobackend.Config;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Enum.ParcelStatus;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AutoParcelStatusUpdater {

    private final IParcelServices parcelServices;

    @Scheduled(fixedRate = 10000) // toutes les 10 secondes
    public void simulateParcelProgression() {
        List<Parcel> allParcels = parcelServices.retrieveAll();

        for (Parcel parcel : allParcels) {
            ParcelStatus currentStatus = parcel.getParcelstatus();
            int nextIndex = currentStatus.ordinal() + 1;
            ParcelStatus[] allStatuses = ParcelStatus.values();

            if (nextIndex < allStatuses.length) {
                ParcelStatus newStatus = allStatuses[nextIndex];
                parcelServices.changeParcelStatus(parcel, newStatus);
                log.info("✅ Statut du colis #{} avancé à {}", parcel.getParcelId(), newStatus);
            } else {
                log.info("⏹️ Colis #{} déjà livré, pas de changement", parcel.getParcelId());
            }
        }
    }
}
