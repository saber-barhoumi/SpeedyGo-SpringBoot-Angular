package com.ski.speedygobackend.Controller.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.CongeStatus;
import com.ski.speedygobackend.Entity.RecrutementManagement.DemandeConge;
import com.ski.speedygobackend.Service.RecrutementManagement.DemandeCongeService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/demandes-conge")
public class DemandeCongeController {

    private final DemandeCongeService demandeCongeService;

    public DemandeCongeController(DemandeCongeService demandeCongeService) {
        this.demandeCongeService = demandeCongeService;
    }

    @PostMapping("/create")
    public ResponseEntity<DemandeConge> createDemande(@RequestParam Long deliveryVehicleId,
                                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
                                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(demandeCongeService.createDemande(deliveryVehicleId, dateDebut, dateFin));
    }

    @GetMapping("/delivery-vehicle/{deliveryVehicleId}")
    public ResponseEntity<List<DemandeConge>> getDemandesByDeliveryVehicle(@PathVariable Long deliveryVehicleId) {
        return ResponseEntity.ok(demandeCongeService.getDemandesByDeliveryVehicle(deliveryVehicleId));
    }

    @PutMapping("/update-status/{demandeId}")
    public ResponseEntity<DemandeConge> updateStatus(@PathVariable Long demandeId,
                                                     @RequestParam CongeStatus status) {
        return ResponseEntity.ok(demandeCongeService.updateStatus(demandeId, status));
    }
}

