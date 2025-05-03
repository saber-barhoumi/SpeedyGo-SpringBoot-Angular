package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Config.ParcelStatusPublisher;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Enum.ParcelStatus;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RequestMapping("parcel")
@RestController
public class ParcelRestController {
    private final IParcelServices parcelServices;
    private final ParcelStatusPublisher statusPublisher;

    @Autowired // Explicitly tell Spring to inject this dependency
    public ParcelRestController(IParcelServices parcelServices, ParcelStatusPublisher statusPublisher) {
        this.parcelServices = parcelServices;
        this.statusPublisher = statusPublisher;
    }
    @PostMapping("/add")
    public Parcel addParcel(@RequestBody Parcel parcel) {
        return parcelServices.addParcel(parcel);
    }

    @PutMapping("/update/{parcelId}")
    public Parcel updateParcel(@PathVariable Long parcelId, @RequestBody Parcel parcel){
        return parcelServices.updateParcel(parcelId,parcel);
    }

    @GetMapping("get/{parcelId}")
    public Parcel getParcel (@PathVariable Long parcelId){
        return parcelServices.retrieveParcel(parcelId);
    }

    @GetMapping("/getAll")
    public List<Parcel> getAll(){
        return parcelServices.retrieveAll();
    }

    @DeleteMapping("/delete/{parcelId}")
    public void deleteParcel (@PathVariable Long parcelId){
        parcelServices.deleteParcel(parcelId);
    }

    @PostMapping("/rest/{id}/next-status")
    public ResponseEntity<Map<String, Object>> advanceParcelStatus(@PathVariable Long id) {
        Parcel parcel = parcelServices.retrieveParcel(id);
        if (parcel == null) throw new RuntimeException("Colis non trouvé");

        ParcelStatus currentStatus = parcel.getParcelstatus();
        ParcelStatus[] allStatuses = ParcelStatus.values();
        int nextIndex = currentStatus.ordinal() + 1;

        if (nextIndex < allStatuses.length) {
            ParcelStatus newStatus = allStatuses[nextIndex];

            // ✅ Utiliser la méthode centrale
            parcelServices.changeParcelStatus(parcel, newStatus);

            return ResponseEntity.ok(Map.of("status", newStatus.name()));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Statut final déjà atteint"));
    }


}

