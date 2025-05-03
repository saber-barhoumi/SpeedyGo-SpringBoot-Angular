package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Config.ParcelStatusPublisher;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Enum.ParcelStatus;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/parcel")
@RequiredArgsConstructor
public class ParcelTestController {

    private final ParcelStatusPublisher publisher;
    private final IParcelServices parcelServices;

    private ParcelStatus[] statuses = ParcelStatus.values();
    private Map<Long, Integer> statusIndexMap = new HashMap<>();

    @PostMapping("/{id}/next-status")
    public void simulateStatusUpdate(@PathVariable Long id) {
        Parcel parcel = parcelServices.findById(id).orElseThrow(() -> new RuntimeException("Parcel not found"));

        int index = statusIndexMap.getOrDefault(id, 0);
        ParcelStatus newStatus = statuses[Math.min(index, statuses.length - 1)];

        parcel.setParcelstatus(newStatus);

        parcelServices.save(parcel);

        publisher.notifyStatusChange(id, newStatus);

        statusIndexMap.put(id, index + 1);
    }
}

