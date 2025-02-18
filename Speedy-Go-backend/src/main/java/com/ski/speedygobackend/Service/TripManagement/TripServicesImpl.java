package com.ski.speedygobackend.Service.TripManagement;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import com.ski.speedygobackend.Repository.ITripRepository;
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
        if (tripRepository.existsById(id)) {
            // L'ID de la Trip est géré par la base de données, pas besoin de setter manuellement
            return tripRepository.save(trip); // Le trip sera mis à jour avec l'ID
        }
        return null; // Ou lancer une exception si tu préfères
    }

    @Override
    public void deleteTrip(Long id) {
        if (tripRepository.existsById(id)) {
            tripRepository.deleteById(id);
        }
    }
}