package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Entity.CarpoolingManagement.ReservationCarpoo;
import com.ski.speedygobackend.Repository.ICarpoolingRepository;
import com.ski.speedygobackend.Repository.IReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationCarpooServicesImpl implements IReservationCarpooServices {

    private final IReservationRepository reservationRepository;
    private final ICarpoolingRepository carpoolingRepository;
    private final NotificationService notificationService;

    @Autowired
    public ReservationCarpooServicesImpl(
            IReservationRepository reservationRepository,
            ICarpoolingRepository carpoolingRepository,
            NotificationService notificationService) {
        this.reservationRepository = reservationRepository;
        this.carpoolingRepository = carpoolingRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public ReservationCarpoo saveReservation(ReservationCarpoo reservationCarpoo) {
        // Verify carpooling exists
        Carpooling carpooling = carpoolingRepository.findById(reservationCarpoo.getCarpooling().getCarpoolingId())
                .orElseThrow(() -> new IllegalArgumentException("Carpooling not found"));

        // Check if there are available seats
        if (carpooling.getAvailableSeats() <= 0) {
            throw new IllegalArgumentException("No available seats for this carpooling");
        }

        // Check if the start time is in the future
        if (carpooling.getStartTime() != null && carpooling.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot book a trip that has already started");
        }

        // Set seats_reserved if not already set - FIX FOR ERROR
        if (reservationCarpoo.getSeatsReserved() == null) {
            reservationCarpoo.setSeatsReserved(1); // Default to 1 seat
        }

        // Decrease available seats
        carpooling.setAvailableSeats(carpooling.getAvailableSeats() - 1);
        carpoolingRepository.save(carpooling);

        // Save reservation
        ReservationCarpoo saved = reservationRepository.save(reservationCarpoo);

        // Notify carpooling owner about new reservation
        notificationService.sendNotification(
                carpooling.getUserId(),
                "New Reservation",
                "Someone has booked a seat on your carpooling trip from " +
                        carpooling.getDepartureLocation() + " to " + carpooling.getDestination()
        );

        // Notify passenger about successful reservation
        notificationService.sendNotification(
                reservationCarpoo.getUserId(),
                "Reservation Confirmed",
                "Your seat has been reserved for the carpooling trip from " +
                        carpooling.getDepartureLocation() + " to " + carpooling.getDestination() +
                        ". Trip starts at: " + carpooling.getStartTime().toString()
        );

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationCarpoo getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with id: " + id));
    }

    @Override
    @Transactional
    public void deleteReservation(Long id) {
        ReservationCarpoo reservation = getReservationById(id);
        Carpooling carpooling = reservation.getCarpooling();

        // Increase available seats
        carpooling.setAvailableSeats(carpooling.getAvailableSeats() + 1);
        carpoolingRepository.save(carpooling);

        // Delete reservation
        reservationRepository.deleteById(id);

        // Notify carpooling owner about cancelled reservation
        notificationService.sendNotification(
                carpooling.getUserId(),
                "Reservation Cancelled",
                "A reservation for your carpooling trip from " +
                        carpooling.getDepartureLocation() + " to " + carpooling.getDestination() +
                        " has been cancelled."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationCarpoo> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationCarpoo> getUpcomingReservationsByUserId(Long userId) {
        return reservationRepository.findByUserIdAndCarpoolingStartTimeAfter(userId, LocalDateTime.now());
    }
}