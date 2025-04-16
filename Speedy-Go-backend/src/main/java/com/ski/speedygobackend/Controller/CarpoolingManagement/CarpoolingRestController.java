package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Service.CarpoolingManagement.ICarpoolingServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/carpoolings")
public class CarpoolingRestController {

    private final ICarpoolingServices carpoolingServices;

    @Autowired
    public CarpoolingRestController(ICarpoolingServices carpoolingServices) {
        this.carpoolingServices = carpoolingServices;
    }

    @GetMapping
    public ResponseEntity<List<Carpooling>> getAllCarpoolings() {
        return ResponseEntity.ok(carpoolingServices.getAllCarpoolings());
    }

    @GetMapping("/my-carpoolings")
    public ResponseEntity<List<Carpooling>> getMyCarpoolings(Principal principal) {
        return ResponseEntity.ok(carpoolingServices.getCarpoolingsByUser(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carpooling> getCarpooling(@PathVariable Long id) {
        return ResponseEntity.ok(carpoolingServices.getCarpoolingById(id));
    }

    @PostMapping("/create")
    public ResponseEntity<Carpooling> createCarpooling(
            @RequestBody Carpooling carpooling,
            Principal principal
    ) {
        return ResponseEntity.ok(carpoolingServices.createCarpooling(carpooling, principal.getName()));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Carpooling> updateCarpooling(
            @PathVariable Long id,
            @RequestBody Carpooling carpooling,
            Principal principal
    ) {
        return ResponseEntity.ok(carpoolingServices.updateCarpooling(id, carpooling, principal.getName()));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCarpooling(
            @PathVariable Long id,
            Principal principal
    ) {
        carpoolingServices.deleteCarpooling(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Carpooling> acceptCarpooling(
            @PathVariable Long id,
            Principal principal
    ) {
        return ResponseEntity.ok(carpoolingServices.acceptCarpooling(id, principal.getName()));
    }

    @PostMapping("/calculate-price")
    public ResponseEntity<Double> calculatePrice(@RequestBody Carpooling carpooling) {
        return ResponseEntity.ok(carpoolingServices.calculatePrice(carpooling));
    }
}