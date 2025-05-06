package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Entity.CarpoolingManagement.ReservationCarpoo;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Service.CarpoolingManagement.ICarpoolingServices;
import com.ski.speedygobackend.Service.CarpoolingManagement.IReservationCarpooServices;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/carpoolings")
public class CarpoolingRestController {

    private final ICarpoolingServices carpoolingService;
    private final IReservationCarpooServices reservationService;
    private final IUserRepository userRepository;

    @Autowired
    public CarpoolingRestController(
            ICarpoolingServices carpoolingService,
            IReservationCarpooServices reservationService,
            IUserRepository userRepository) {
        this.carpoolingService = carpoolingService;
        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Carpooling> getAllCarpoolings() {
        return carpoolingService.getAllCarpoolings();
    }

    @GetMapping("/upcoming")
    public List<Carpooling> getUpcomingCarpoolings() {
        return carpoolingService.getUpcomingCarpoolings();
    }

    @GetMapping("/{id}")
    public Carpooling getCarpoolingById(@PathVariable Long id) {
        return carpoolingService.getCarpoolingById(id);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELEVERY')") // Add proper role authorization
    public ResponseEntity<Carpooling> createCarpooling(
            @RequestBody Carpooling carpooling,
            Principal principal,
            HttpServletRequest request) {

        // Debug logging
        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization Header: " + authHeader);
        System.out.println("Principal: " + (principal != null ? principal.getName() : "null"));

        try {
            Carpooling created = carpoolingService.createCarpooling(carpooling, principal.getName());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update/{id}")
    public Carpooling updateCarpooling(@PathVariable Long id, @RequestBody Carpooling carpooling, Principal principal) {
        return carpoolingService.updateCarpooling(id, carpooling, principal.getName());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCarpooling(@PathVariable Long id, Principal principal) {
        carpoolingService.deleteCarpooling(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/calculate-price")
    public double calculatePrice(@RequestBody Carpooling carpooling) {
        return carpoolingService.calculatePrice(carpooling);
    }

    @PostMapping("/{id}/accept")
    public Carpooling acceptCarpooling(@PathVariable Long id, Principal principal) {
        return carpoolingService.acceptCarpooling(id, principal.getName());
    }

    @PostMapping("/{id}/reserve")
    @PreAuthorize("hasAnyRole('DELEVERY', 'USER', 'CUSTOMER')")
    public ResponseEntity<?> reserveCarpooling(@PathVariable Long id, Principal principal) {
        try {
            // Get the current user
            String username = principal.getName();

            // Get user ID from the authenticated user
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Long userId = user.getUserId();

            // Get the carpooling
            Carpooling carpooling = carpoolingService.getCarpoolingById(id);

            // Create and save reservation
            ReservationCarpoo reservation = new ReservationCarpoo();
            reservation.setCarpooling(carpooling);
            reservation.setUserId(userId);
            reservation.setSeatsReserved(1);

            // Save the reservation
            ReservationCarpoo savedReservation = reservationService.saveReservation(reservation);

            return ResponseEntity.ok(savedReservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error reserving carpooling: " + e.getMessage());
        }
    }


    @GetMapping("/reservations/me")
    @PreAuthorize("hasAnyRole('DELEVERY', 'USER', 'CUSTOMER' , 'ROLE_CUSTOMER')")    public ResponseEntity<?> getMyReservations(Principal principal) {
        try {
            String username = principal.getName();
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            List<ReservationCarpoo> reservations = reservationService.getReservationsByUserId(user.getUserId());
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving reservations: " + e.getMessage());
        }
    }


    @GetMapping("/reservations/me/upcoming")
    @PreAuthorize("hasAnyRole('DELEVERY', 'USER')") // Add role-based access
    public ResponseEntity<?> getMyUpcomingReservations(Principal principal) {
        try {
            String username = principal.getName();
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            List<ReservationCarpoo> reservations = reservationService.getUpcomingReservationsByUserId(user.getUserId());
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving upcoming reservations: " + e.getMessage());
        }
    }



    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id, Principal principal) {
        try {
            // Get user for validation
            String username = principal.getName();
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Get reservation
            ReservationCarpoo reservation = reservationService.getReservationById(id);

            // Verify ownership (optional security check)
            if (!reservation.getUserId().equals(user.getUserId())) {
                return ResponseEntity.badRequest().body("You are not authorized to delete this reservation");
            }

            // Delete reservation
            reservationService.deleteReservation(id);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting reservation: " + e.getMessage());
        }
    }
}