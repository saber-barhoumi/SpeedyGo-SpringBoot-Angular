package com.ski.speedygobackend.Controller.PointsRelaisManagment;

import com.ski.speedygobackend.Entity.PointsRelaisManagment.PointsRelais;
import com.ski.speedygobackend.Service.ComfirmationTransfertServiceManagment.IComfirmationTransfertService;
import com.ski.speedygobackend.Service.PointsRelaisService.IPointsRelaisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pointsrelais")
@RequiredArgsConstructor
public class PointsRelaisRestController {

    private final IPointsRelaisService pointsRelaisService;
    private final IComfirmationTransfertService comfirmationTransfertService;

    // Récupérer tous les points relais
    @GetMapping
    public List<PointsRelais> getAllPointsRelais() {
        return pointsRelaisService.getAllPointsRelais();
    }

    // Récupérer un point relais par ID
    @GetMapping("/{id}")
    public ResponseEntity<PointsRelais> getPointRelaisById(@PathVariable Long id) {
        PointsRelais pointRelais = pointsRelaisService.getPointRelaisById(id);
        return pointRelais != null ? ResponseEntity.ok(pointRelais) : ResponseEntity.notFound().build();
    }

    // Ajouter un nouveau point relais
    @PostMapping
    public ResponseEntity<PointsRelais> addPointRelais(@RequestBody PointsRelais pointRelais) {
        PointsRelais createdPointRelais = pointsRelaisService.addPointRelais(pointRelais);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPointRelais);
    }

    // Supprimer un point relais par ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePointRelais(@PathVariable Long id) {
        pointsRelaisService.deletePointRelais(id);
        return ResponseEntity.noContent().build();
    }

    // Confirmer le transfert pour un point relais spécifique
    @PostMapping("/confirmer/{id}")
    public ResponseEntity<String> confirmerTransfert(@PathVariable Long id) {
        try {
            // Appeler le service pour confirmer le transfert avec l'ID du point relais
            comfirmationTransfertService.confirmerTransfert(id);
            return ResponseEntity.status(HttpStatus.OK).body("Transfert confirmé pour le point relais ID " + id);
        } catch (RuntimeException e) {
            // En cas d'erreur (ex. point relais non trouvé)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Point relais non trouvé pour l'ID " + id);
        }
    }
}
