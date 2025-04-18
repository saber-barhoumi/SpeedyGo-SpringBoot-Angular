package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Service.CarpoolingManagement.ICarpoolingServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/carpoolings")
public class CarpoolingRestController {

    private final ICarpoolingServices carpoolingServices;

    // Injection du service via le constructeur
    public CarpoolingRestController(ICarpoolingServices carpoolingServices) {
        this.carpoolingServices = carpoolingServices;
    }

    @GetMapping
    public List<Carpooling> getAllCarpoolings() {
        return carpoolingServices.getAllCarpoolings();
    }

    @GetMapping("/{id}")
    public Carpooling getCarpooling(@PathVariable Long id) {
        return carpoolingServices.getCarpoolingById(id);
    }

    @PostMapping("/add")
    public Carpooling createCarpooling(@RequestBody Carpooling carpooling) {
        return carpoolingServices.saveCarpooling(carpooling);
    }

    @PutMapping("/update/{id}")
    public Carpooling updateCarpooling(@PathVariable Long id, @RequestBody Carpooling carpooling) {
        return carpoolingServices.saveCarpooling(carpooling);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteCarpooling(@PathVariable Long id) {
        carpoolingServices.deleteCarpooling(id);
    }
}