package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Entity.CarpoolingManagement.ReservationCarpoo;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Service.CarpoolingManagement.ICarpoolingServices;
import com.ski.speedygobackend.Service.CarpoolingManagement.IReservationCarpooServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/carpoolings")
public class CarpoolingRestController {

    private final ICarpoolingServices carpoolingServices;
    private final IReservationCarpooServices reservationServices;
    private final IUserRepository userRepository;

    @Autowired
    public CarpoolingRestController(ICarpoolingServices carpoolingServices, IReservationCarpooServices reservationServices, IUserRepository userRepository) {
        this.carpoolingServices = carpoolingServices;
        this.reservationServices = reservationServices;
        this.userRepository = userRepository;
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
    @PostMapping("/{carpoolingId}/reserve")
    public ResponseEntity<?> reserveCarpooling(@PathVariable Long carpoolingId, @RequestBody Long userId) {
        Carpooling carpooling = carpoolingServices.getCarpoolingById(carpoolingId);
        if (carpooling == null) {
            return new ResponseEntity<>("Carpooling not found", HttpStatus.NOT_FOUND);
        }

        // Create a new reservation
        ReservationCarpoo reservationCarpoo = new ReservationCarpoo();
        reservationCarpoo.setCarpooling(carpooling);
        reservationCarpoo.setUserId(userId);

        // Save the reservation using the reservation service
        reservationServices.saveReservation(reservationCarpoo);

        // Return a JSON response
        Map<String, String> response = new HashMap<>();
        response.put("message", "Carpooling reserved successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Update an existing carpooling
    @PutMapping("/update/{id}")
    public ResponseEntity<Carpooling> updateCarpooling(@PathVariable Long id, @RequestBody Carpooling carpooling) {
        Carpooling existingCarpooling = carpoolingServices.getCarpoolingById(id);
        if (existingCarpooling != null) {
            carpooling.setCarpoolingId(id);
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
    }

    @GetMapping("/reservations/me")
    public ResponseEntity<List<ReservationCarpoo>> getMyReservations(Principal principal) {
        // Get the username of the logged-in user
        String username = principal.getName();

        // Get the user ID from the username (you might need to fetch the user from the database)
        Optional<User> userOptional = userRepository.findByEmail(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Long userId = user.getUserId();

            // Get the reservations for the user
            List<ReservationCarpoo> reservations = reservationServices.getReservationsByUserId(userId);
            return new ResponseEntity<>(reservations, HttpStatus.OK);
        } else {
            // Handle the case where the user is not found
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/reservations/{reservationId}/delete")
    public ResponseEntity<?> deleteReservation(@PathVariable Long reservationId, Principal principal) {
        // Check if the reservation exists
        Optional<ReservationCarpoo> reservationOptional = Optional.ofNullable(reservationServices.getReservationById(reservationId));
        if (reservationOptional.isEmpty()) {
            return new ResponseEntity<>("Reservation not found", HttpStatus.NOT_FOUND);
        }

        ReservationCarpoo reservation = reservationOptional.get();

        // Get the user ID from the authenticated user
        String username = principal.getName();
        Optional<User> userOptional = userRepository.findByEmail(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Long userId = user.getUserId();

            // Check if the user is authorized to delete the reservation
            if (!reservation.getUserId().equals(userId)) {
                return new ResponseEntity<>("You are not authorized to delete this reservation", HttpStatus.FORBIDDEN);
            }

            // Delete the reservation
            reservationServices.deleteReservation(reservationId);

            // Return a success message
            Map<String, String> response = new HashMap<>();
            response.put("message", "Reservation deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            // Handle the case where the user is not found
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}