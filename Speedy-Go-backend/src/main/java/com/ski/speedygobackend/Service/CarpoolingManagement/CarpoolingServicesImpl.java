package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Entity.CarpoolingManagement.ReservationCarpoo;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.ICarpoolingRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CarpoolingServicesImpl implements ICarpoolingServices {

    private final ICarpoolingRepository carpoolingRepository;
    private final IUserRepository userRepository;
    private final AIService aiService;
    private final NotificationService notificationService; // Added for notifications
    private static final Logger logger = LoggerFactory.getLogger(CarpoolingServicesImpl.class);

    @Autowired
    public CarpoolingServicesImpl(
            ICarpoolingRepository carpoolingRepository,
            IUserRepository userRepository,
            AIService aiService,
            NotificationService notificationService // Injected notification service
    ) {
        this.carpoolingRepository = carpoolingRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Carpooling> getAllCarpoolings() {
        return carpoolingRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Carpooling> getUpcomingCarpoolings() {
        LocalDateTime now = LocalDateTime.now();
        return carpoolingRepository.findByStartTimeAfter(now);
    }

    @Override
    @Transactional(readOnly = true)
    public Carpooling getCarpoolingById(Long id) {
        return carpoolingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Carpooling not found with id: " + id));
    }

    @Override
    @Transactional
    public Carpooling createCarpooling(Carpooling carpooling, String username) {
        logger.info("Creating carpooling with data: " + carpooling);

        // Find user by username
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        logger.info("Found user: " + user.getUserId());

        // Set user ID
        carpooling.setUserId(user.getUserId());

        // Print all input fields to debug
        logger.info("Departure: " + carpooling.getDepartureLocation());
        logger.info("Destination: " + carpooling.getDestination());
        logger.info("Distance: " + carpooling.getDistanceKm());
        logger.info("Duration: " + carpooling.getDurationMinutes());
        logger.info("Vehicle Type: " + carpooling.getVehicleType());
        logger.info("Fuel Type: " + carpooling.getFuelType());
        logger.info("Available Seats: " + carpooling.getAvailableSeats());
        logger.info("Start Time: " + carpooling.getStartTime());

        // Set default values if they're null
        if (carpooling.getDistanceKm() == null) {
            logger.info("Setting default distance to 1.0");
            carpooling.setDistanceKm(1.0); // Default to 1 km
        }

        if (carpooling.getDurationMinutes() == null) {
            logger.info("Setting default duration to 10 minutes");
            carpooling.setDurationMinutes(10); // Default to 10 minutes
        }

        // Make sure startTime is set if it's null
        if (carpooling.getStartTime() == null) {
            logger.info("Setting default start time to 1 hour from now");
            // Set default start time (1 hour from now)
            carpooling.setStartTime(LocalDateTime.now().plusHours(1));
        }

        // Validate carpooling details
        if (!aiService.validateCarpoolingDetails(carpooling)) {
            logger.error("Carpooling validation failed");
            throw new IllegalArgumentException("Invalid carpooling details");
        }

        // Calculate price
        double price = aiService.calculatePrice(carpooling);
        carpooling.setPricePerSeat(price);
        logger.info("Calculated price: " + price);

        // Set creation time
        carpooling.setArrivalTime(LocalDateTime.now());

        // Set initial status
        carpooling.setStatus("PENDING");

        logger.info("Saving carpooling: " + carpooling);
        return carpoolingRepository.save(carpooling);
    }

    @Override
    @Transactional
    public Carpooling updateCarpooling(Long id, Carpooling updatedCarpooling, String username) {
        // Find existing carpooling
        Carpooling existingCarpooling = getCarpoolingById(id);

        // Verify user ownership
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!existingCarpooling.getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("You are not authorized to update this carpooling");
        }

        // Update fields
        existingCarpooling.setDepartureLocation(updatedCarpooling.getDepartureLocation());
        existingCarpooling.setDestination(updatedCarpooling.getDestination());
        existingCarpooling.setStartTime(updatedCarpooling.getStartTime()); // Update start time
        existingCarpooling.setDistanceKm(updatedCarpooling.getDistanceKm());
        existingCarpooling.setDurationMinutes(updatedCarpooling.getDurationMinutes());
        existingCarpooling.setVehicleType(updatedCarpooling.getVehicleType());
        existingCarpooling.setFuelType(updatedCarpooling.getFuelType());
        existingCarpooling.setAvailableSeats(updatedCarpooling.getAvailableSeats());
        existingCarpooling.setWifi(updatedCarpooling.getWifi());
        existingCarpooling.setAirConditioning(updatedCarpooling.getAirConditioning());
        existingCarpooling.setWeatherType(updatedCarpooling.getWeatherType());
        existingCarpooling.setDescription(updatedCarpooling.getDescription());

        // Recalculate price
        double price = aiService.calculatePrice(existingCarpooling);
        existingCarpooling.setPricePerSeat(price);

        // Notify passengers about updated trip details
        if (existingCarpooling.getReservationCarpoos() != null && !existingCarpooling.getReservationCarpoos().isEmpty()) {
            for (ReservationCarpoo reservation : existingCarpooling.getReservationCarpoos()) {
                notificationService.sendNotification(
                        reservation.getUserId(),
                        "Trip Update",
                        "The details of your carpooling trip from " + existingCarpooling.getDepartureLocation() +
                                " to " + existingCarpooling.getDestination() + " have been updated."
                );
            }
        }

        return carpoolingRepository.save(existingCarpooling);
    }

    @Override
    @Transactional
    public void deleteCarpooling(Long id, String username) {
        // Find existing carpooling
        Carpooling existingCarpooling = getCarpoolingById(id);

        // Verify user ownership
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!existingCarpooling.getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("You are not authorized to delete this carpooling");
        }

        // Notify passengers about trip cancellation
        if (existingCarpooling.getReservationCarpoos() != null && !existingCarpooling.getReservationCarpoos().isEmpty()) {
            for (ReservationCarpoo reservation : existingCarpooling.getReservationCarpoos()) {
                notificationService.sendNotification(
                        reservation.getUserId(),
                        "Trip Cancelled",
                        "The carpooling trip from " + existingCarpooling.getDepartureLocation() +
                                " to " + existingCarpooling.getDestination() + " has been cancelled."
                );
            }
        }

        carpoolingRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public double calculatePrice(Carpooling carpooling) {
        return aiService.calculatePrice(carpooling);
    }

    @Override
    @Transactional
    public Carpooling acceptCarpooling(Long id, String username) {
        // Find existing carpooling
        Carpooling carpooling = getCarpoolingById(id);

        // Verify user
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user is the owner of the carpooling
        if (!carpooling.getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("You are not authorized to accept this carpooling");
        }

        // Check if carpooling is already accepted
        if ("ACCEPTED".equals(carpooling.getStatus())) {
            throw new IllegalArgumentException("Carpooling is already accepted");
        }

        // Update status
        carpooling.setStatus("ACCEPTED");

        // Notify passengers that trip is confirmed
        if (carpooling.getReservationCarpoos() != null && !carpooling.getReservationCarpoos().isEmpty()) {
            for (ReservationCarpoo reservation : carpooling.getReservationCarpoos()) {
                notificationService.sendNotification(
                        reservation.getUserId(),
                        "Trip Confirmed",
                        "Your carpooling trip from " + carpooling.getDepartureLocation() +
                                " to " + carpooling.getDestination() + " has been confirmed."
                );
            }
        }

        return carpoolingRepository.save(carpooling);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Carpooling> getCarpoolingsByUser(String username) {
        // Find user
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Find carpoolings by user ID
        return carpoolingRepository.findByUserId(user.getUserId());
    }

    // Method to check for imminent trips and send notifications
    @Transactional(readOnly = true)
    public void checkAndSendTripStartNotifications() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourFromNow = now.plusHours(1);

        List<Carpooling> imminentTrips = carpoolingRepository.findByStartTimeBetween(now, oneHourFromNow);

        for (Carpooling trip : imminentTrips) {
            // Notify driver
            notificationService.sendNotification(
                    trip.getUserId(),
                    "Trip Starting Soon",
                    "Your carpooling trip from " + trip.getDepartureLocation() +
                            " to " + trip.getDestination() + " is starting soon."
            );

            // Notify passengers
            if (trip.getReservationCarpoos() != null && !trip.getReservationCarpoos().isEmpty()) {
                for (ReservationCarpoo reservation : trip.getReservationCarpoos()) {
                    notificationService.sendNotification(
                            reservation.getUserId(),
                            "Trip Starting Soon",
                            "Your carpooling trip from " + trip.getDepartureLocation() +
                                    " to " + trip.getDestination() + " is starting soon."
                    );
                }
            }
        }
    }

    
}