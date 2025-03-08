package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Service.CarpoolingManagement.ICarpoolingServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carpoolings") // Updated base URL to include /api
public class CarpoolingRestController {

    private final ICarpoolingServices carpoolingServices;

    @Autowired
    public CarpoolingRestController(ICarpoolingServices carpoolingServices) {
        this.carpoolingServices = carpoolingServices;
    }

    // Get all carpoolings
    @GetMapping
    public ResponseEntity<List<Carpooling>> getAllCarpoolings() {
        List<Carpooling> carpoolings = carpoolingServices.getAllCarpoolings();
        return new ResponseEntity<>(carpoolings, HttpStatus.OK);
    }

    // Get a carpooling by ID
    @GetMapping("/{id}")
    public ResponseEntity<Carpooling> getCarpooling(@PathVariable Long id) {
        Carpooling carpooling = carpoolingServices.getCarpoolingById(id);
        if (carpooling != null) {
            return new ResponseEntity<>(carpooling, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Add a new carpooling
    @PostMapping("/add") // Endpoint for adding a carpooling
    public ResponseEntity<Carpooling> createCarpooling(@RequestBody Carpooling carpooling) {
        Carpooling savedCarpooling = carpoolingServices.saveCarpooling(carpooling);
        return new ResponseEntity<>(savedCarpooling, HttpStatus.CREATED);
    }

    // Update an existing carpooling
    @PutMapping("/update/{id}")
    public ResponseEntity<Carpooling> updateCarpooling(@PathVariable Long id, @RequestBody Carpooling carpooling) {
        Carpooling existingCarpooling = carpoolingServices.getCarpoolingById(id);
        if (existingCarpooling != null) {
            carpooling.setCarpoolingId(id); // Ensure the ID is set
            Carpooling updatedCarpooling = carpoolingServices.saveCarpooling(carpooling);
            return new ResponseEntity<>(updatedCarpooling, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a carpooling by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCarpooling(@PathVariable Long id) {
        Carpooling carpooling = carpoolingServices.getCarpoolingById(id);
        if (carpooling != null) {
            carpoolingServices.deleteCarpooling(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }}
