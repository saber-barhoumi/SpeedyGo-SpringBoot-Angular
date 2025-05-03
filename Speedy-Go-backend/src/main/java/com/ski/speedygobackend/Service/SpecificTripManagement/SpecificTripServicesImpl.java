package com.ski.speedygobackend.Service.SpecificTripManagement;

import com.ski.speedygobackend.Entity.SpecificTripManagement.SpecifiqueTrip;
import com.ski.speedygobackend.Enum.VehicleType;
import com.ski.speedygobackend.Repository.ISpecificTripRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SpecificTripServicesImpl implements ISpecificTripServices {

    private static final Logger logger = LoggerFactory.getLogger(SpecificTripServicesImpl.class);
    private final ISpecificTripRepository tripRepository;

    @Override
    public List<SpecifiqueTrip> getAllTrips() {
        return tripRepository.findAll();
    }

    @Override
    public Optional<SpecifiqueTrip> getTripById(Long id) {
        return tripRepository.findById(id);
    }

    @Override
    @Transactional
    public SpecifiqueTrip createTrip(SpecifiqueTrip trip) {
        try {
            // Check if the reservation is valid when it's not null
            if (trip.getReservation() != null && trip.getReservation().getReservationDate() == null) {
                logger.warn("Attempt to create trip with invalid reservation (null ID)");
                trip.setReservation(null); // Set to null to avoid FK constraint issues
            }

            // Validate other required fields
            if (trip.getDepartureDate() == null) {
                logger.warn("Trip creation failed: departure date is null");
                throw new IllegalArgumentException("Departure date is required");
            }

            logger.debug("Saving trip: {}", trip);
            return tripRepository.save(trip);
        } catch (Exception e) {
            logger.error("Error creating trip", e);
            throw e;
        }
    }

    @Override
    @Transactional
    public SpecifiqueTrip updateTrip(Long id, SpecifiqueTrip updatedTrip) {
        return tripRepository.findById(id).map(trip -> {
            trip.setTripDetails(updatedTrip.getTripDetails());
            trip.setDepartureLocation(updatedTrip.getDepartureLocation());
            trip.setDescription(updatedTrip.getDescription());
            trip.setDepartureDate(updatedTrip.getDepartureDate());
            trip.setDepartureTime(updatedTrip.getDepartureTime());
            trip.setArrivalTime(updatedTrip.getArrivalTime());
            trip.setParcelType(updatedTrip.getParcelType());
            trip.setArrivalDate(updatedTrip.getArrivalDate());
            trip.setArrivalLocation(updatedTrip.getArrivalLocation());
            trip.setPassThroughLocation(updatedTrip.getPassThroughLocation());
            if (updatedTrip.getReservation() != null && updatedTrip.getReservation().getReservationDate() != null) {
                trip.setReservation(updatedTrip.getReservation());
            }

            return tripRepository.save(trip);
        }).orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
    }



    @Override
    @Transactional
    public void deleteTrip(Long id) {
        tripRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteAllTrips() {
        tripRepository.deleteAll();
    }


    // Implementations for advanced search methods





    @Override
    public List<SpecifiqueTrip> findTripsByDepartureDate(LocalDate departureDate) {
        return tripRepository.findByDepartureDate(departureDate);
    }
}