package com.ski.speedygobackend.Controller.ReturnManagment;

import com.ski.speedygobackend.Entity.ReturnManagment.Returns;
import com.ski.speedygobackend.Enum.RetourStatus;
import com.ski.speedygobackend.Service.ReturnManagment.IReturnsServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/returns")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ReturnRestController {

    private final IReturnsServices returnService;

    @GetMapping
    public List<Returns> getAllReturns() {
        return returnService.getAllReturns();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Returns> getReturnById(@PathVariable Long id) {
        Returns returns = returnService.getReturnsById(id);
        if (returns == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(returns);
    }

    @PostMapping
    public ResponseEntity<Returns> createReturn(@RequestBody Returns returns) {
        Returns savedReturns = returnService.saveReturns(returns);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReturns);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Returns> updateReturn(@PathVariable Long id, @RequestBody Returns updatedReturn) {
        Returns existingReturn = returnService.getReturnsById(id);
        if (existingReturn == null) {
            return ResponseEntity.notFound().build();
        }

        if (updatedReturn.getRetourstatus() != null) {
            existingReturn.setRetourstatus(updatedReturn.getRetourstatus());
        }
        if (updatedReturn.getReason_description() != null) {
            existingReturn.setReason_description(updatedReturn.getReason_description());
        }
        if (updatedReturn.getRetourtype() != null) {
            existingReturn.setRetourtype(updatedReturn.getRetourtype());
        }
        if (updatedReturn.getRetourdate() != null) {
            existingReturn.setRetourdate(updatedReturn.getRetourdate());
        }

        Returns savedReturn = returnService.saveReturns(existingReturn);
        return ResponseEntity.ok(savedReturn);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReturn(@PathVariable Long id) {
        returnService.deleteReturns(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateReturnStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("retourstatus");
        Returns returns = returnService.getReturnsById(id);

        if (returns == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            RetourStatus retourStatusEnum = RetourStatus.valueOf(newStatus.toUpperCase());
            returns.setRetourstatus(retourStatusEnum); // Mettre à jour uniquement le statut
            returnService.saveReturns(returns); // Sauvegarder les modifications

            // === VÉRIFICATION : si on change vers NOTDONE ===
            if (retourStatusEnum == RetourStatus.NOTDONE && returns.getUser() != null) {
                returnService.checkAndBanUser(returns.getUser().getUserId()); // Vérifier le bannissement
            }

            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Statut invalide : " + newStatus);
        }
    }




    @PostMapping("/check-and-ban/{userId}")
    public ResponseEntity<String> checkAndBanUser(@PathVariable Long userId) {
        try {
            returnService.checkAndBanUser(userId);
            return ResponseEntity.ok("Vérification terminée");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
