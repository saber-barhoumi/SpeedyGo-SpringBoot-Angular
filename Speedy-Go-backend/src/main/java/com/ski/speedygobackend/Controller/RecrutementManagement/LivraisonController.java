package com.ski.speedygobackend.Controller.RecrutementManagement;


import com.ski.speedygobackend.Entity.RecrutementManagement.Livraison;
import com.ski.speedygobackend.Enum.LivraisonStatus;
import com.ski.speedygobackend.Service.RecrutementManagement.ILivraisonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/livraisons")
@CrossOrigin(origins = "http://localhost:4200")
public class LivraisonController {

    private final ILivraisonService livraisonService;

    @Autowired
    public LivraisonController(ILivraisonService livraisonService) {
        this.livraisonService = livraisonService;
    }

    @GetMapping
    public ResponseEntity<List<Livraison>> getAllLivraisons() {
        return ResponseEntity.ok(livraisonService.getAllLivraisons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livraison> getLivraisonById(@PathVariable Long id) {
        return ResponseEntity.ok(livraisonService.getLivraisonById(id));
    }

    @PostMapping
    public ResponseEntity<?> createLivraison(@RequestBody Livraison livraison) {
        try {
            Livraison createdLivraison = livraisonService.createLivraison(livraison);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdLivraison);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/ai-suggestion")
    public ResponseEntity<?> createLivraisonWithAiSuggestion(@RequestBody Livraison livraison) {
        try {
            Map<String, Object> result = livraisonService.createLivraisonWithAiVehicleSuggestion(livraison);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLivraison(@PathVariable Long id, @RequestBody Livraison livraisonDetails) {
        try {
            Livraison updatedLivraison = livraisonService.updateLivraison(id, livraisonDetails);
            return ResponseEntity.ok(updatedLivraison);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLivraison(@PathVariable Long id) {
        try {
            livraisonService.deleteLivraison(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Livraison>> getLivraisonsByStatus(@PathVariable LivraisonStatus status) {
        return ResponseEntity.ok(livraisonService.getLivraisonsByStatus(status));
    }

    @PostMapping("/{id}/assign-vehicle/{vehicleId}")
    public ResponseEntity<?> assignVehicle(@PathVariable Long id, @PathVariable Long vehicleId) {
        try {
            Livraison livraison = livraisonService.assignVehicle(id, vehicleId);
            return ResponseEntity.ok(livraison);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Gets AI suggestion for a vehicle and automatically assigns it to the delivery
     */
    @GetMapping("/{id}/suggest-vehicle")
    public ResponseEntity<?> suggestAndAssignBestVehicle(@PathVariable Long id) {
        try {
            Map<String, Object> result = livraisonService.suggestAndAssignBestVehicle(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @GetMapping("/{id}/preview-vehicle-suggestion")
    public ResponseEntity<?> previewVehicleSuggestion(@PathVariable Long id) {
        try {
            Map<String, Object> suggestion = livraisonService.suggestBestVehicle(id);
            return ResponseEntity.ok(suggestion);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

}