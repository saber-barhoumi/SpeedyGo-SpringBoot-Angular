package com.ski.speedygobackend.Controller.LoyaltyManagement;

import com.ski.speedygobackend.Entity.LoyaltyManagement.LoyaltyCard;
import com.ski.speedygobackend.Service.LoyaltyManagement.ILoyaltyCardServices;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/loyalty-cards")
public class LoyaltyCardRestController {

    private final ILoyaltyCardServices loyaltyCardServices;

    public LoyaltyCardRestController(ILoyaltyCardServices loyaltyCardServices) {
        this.loyaltyCardServices = loyaltyCardServices;
    }

    @PostMapping
    public ResponseEntity<LoyaltyCard> addLoyaltyCard(@RequestBody LoyaltyCard loyaltyCard) {
        LoyaltyCard savedLoyaltyCard = loyaltyCardServices.addLoyaltyCard(loyaltyCard);
        return new ResponseEntity<>(savedLoyaltyCard, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LoyaltyCard>> getAllLoyaltyCards() {
        List<LoyaltyCard> loyaltyCards = loyaltyCardServices.getAllLoyaltyCards();
        return new ResponseEntity<>(loyaltyCards, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoyaltyCard> getLoyaltyCardById(@PathVariable Long id) {
        Optional<LoyaltyCard> loyaltyCard = loyaltyCardServices.getLoyaltyCardById(id);
        return loyaltyCard.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoyaltyCard(@PathVariable Long id) {
        loyaltyCardServices.deleteLoyaltyCard(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
