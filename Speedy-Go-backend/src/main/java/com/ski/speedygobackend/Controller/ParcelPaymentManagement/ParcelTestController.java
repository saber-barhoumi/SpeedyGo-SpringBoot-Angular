package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Config.ParcelStatusPublisher;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Enum.ParcelStatus;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequestMapping("/parcel")
@RequiredArgsConstructor
public class ParcelTestController {

    private final ParcelStatusPublisher publisher;
    private final IParcelServices parcelServices;

    @PostMapping("/{id}/next-status")
    public ResponseEntity<Map<String, Object>> simulateStatusUpdate(@PathVariable Long id) {
        Optional<Parcel> parcelOpt = parcelServices.findById(id);
        if (!parcelOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parcel not found"));
        }

        Parcel parcel = parcelOpt.get();
        ParcelStatus currentStatus = parcel.getParcelstatus();
        ParcelStatus[] allStatuses = ParcelStatus.values();
        int nextIndex = currentStatus.ordinal() + 1;

        if (nextIndex < allStatuses.length) {
            ParcelStatus newStatus = allStatuses[nextIndex];
            parcelServices.changeParcelStatus(parcel, newStatus);
            return ResponseEntity.ok(Map.of("status", newStatus.name()));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Final status already reached"));
    }
}