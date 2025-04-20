package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.ICarpoolingRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CarpoolingServicesImpl implements ICarpoolingServices {

    private final ICarpoolingRepository carpoolingRepository;
    private final IUserRepository userRepository;
    private final AIService aiService;

    @Autowired
    public CarpoolingServicesImpl(
            ICarpoolingRepository carpoolingRepository,
            IUserRepository userRepository,
            AIService aiService
    ) {
        this.carpoolingRepository = carpoolingRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Carpooling> getAllCarpoolings() {
        return carpoolingRepository.findAll();
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
        // Find user by username
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Set user ID
        carpooling.setUserId(user.getUserId());

        // Validate carpooling details
        if (!aiService.validateCarpoolingDetails(carpooling)) {
            throw new IllegalArgumentException("Invalid carpooling details");
        }

        // Calculate price
        double price = aiService.calculatePrice(carpooling);
        carpooling.setPricePerSeat(price);

        // Set creation time
        carpooling.setArrivalTime(LocalDateTime.now());

        // Set initial status (optional)
        carpooling.setStatus("PENDING");

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
}