package com.ski.speedygobackend.Controller.ReturnManagment;

import com.ski.speedygobackend.Entity.ReturnManagment.Returns;
import com.ski.speedygobackend.Service.ReturnManagment.ReturnsServicesImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/returns")
public class ReturnRestController {

    private final ReturnsServicesImpl returnService;

    public ReturnRestController(ReturnsServicesImpl returnService) {
        this.returnService = returnService;
    }

    @GetMapping
    public List<Returns> getAllReturns() {
        return returnService.getAllReturns();
    }

    @GetMapping("/{id}")
    public Returns getReturn(@PathVariable Long id) {
        return returnService.getReturnsById(id);
    }

    @PostMapping
    public Returns createReturn(@RequestBody Returns returns) {
        return returnService.saveReturns(returns);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Returns> updateReturn(@PathVariable Long id, @RequestBody Returns updatedReturn) {
        // Récupérer le retour existant par ID
        Returns existingReturn = returnService.getReturnsById(id);

        if (existingReturn == null) {
            // Si le retour n'existe pas, retourner une erreur 404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        // Mettre à jour les propriétés uniquement si elles sont non nulles
        if (updatedReturn.getRetourstatus() != null) {
            existingReturn.setRetourstatus(updatedReturn.getRetourstatus());
        }
        if (updatedReturn.getReason_description() != null) {
            existingReturn.setReason_description(updatedReturn.getReason_description());
        }
        if (updatedReturn.getRetourtype() != null) {
            existingReturn.setRetourtype(updatedReturn.getRetourtype());
        }
        if (updatedReturn.getParcel() != null) {
            existingReturn.setParcel(updatedReturn.getParcel());
        }

        // Sauvegarder les modifications
        Returns savedReturn = returnService.saveReturns(existingReturn);

        // Retourner la réponse avec le retour mis à jour
        return ResponseEntity.ok(savedReturn);
    }



    @DeleteMapping("/{id}")
    public void deleteReturn(@PathVariable Long id) {
        returnService.deleteReturns(id);
    }

    @PutMapping("/{returnId}/assignParcel/{parcelId}")
    public Returns assignParcelToReturn(@PathVariable Long returnId, @PathVariable Long parcelId) {
        return returnService.assignParcelToReturn(returnId, parcelId);
    }
    @PostMapping("/assignParcel/{parcelId}")
    public Returns assignParcelToReturn(@PathVariable Long parcelId, @RequestBody Returns returns) {
        return returnService.assignParcelToReturn(parcelId, returns.getReturnID());
    }

}
