package com.ski.speedygobackend.Service.TripManagement;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import com.ski.speedygobackend.Repository.ITripRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TripServicesImpl implements ITripServices {

    private final ITripRepository tripRepository;

    @Autowired
    public TripServicesImpl(ITripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    @Override
    public Trip addTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    @Override
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    @Override
    public Optional<Trip> getTripById(Long id) {
        return tripRepository.findById(id);
    }
    @Override
    public Trip updateTrip(Long id, Trip trip) {
        System.out.println("Trip ID: " + trip);
        return tripRepository.findById(id).map(existingTrip -> {
            existingTrip.setTripDate(trip.getTripDate());
            existingTrip.setDescription(trip.getDescription());
            existingTrip.setTripStatus(trip.getTripStatus());
            existingTrip.setParcels(trip.getParcels());


            existingTrip.setFeedbackAnalysis(trip.getFeedbackAnalysis());
            existingTrip.setSmartRoute(trip.getSmartRoute());
            existingTrip.setVehicles(trip.getVehicles());
            existingTrip.setStartLocation(trip.getStartLocation());
            existingTrip.setEndLocation(trip.getEndLocation());
            existingTrip.setPhoneNumber(trip.getPhoneNumber());

            return tripRepository.save(existingTrip);
        }).orElseThrow(() -> new EntityNotFoundException("Trip with ID " + id + " not found"));
    }


    @Override
    public void deleteTrip(Long id) {
        if (tripRepository.existsById(id)) {
            tripRepository.deleteById(id);
        }
    }
}