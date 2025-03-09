package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.ReservationCarpoo;
import com.ski.speedygobackend.Repository.IReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationCarpooServicesImpl implements IReservationCarpooServices {

    private final IReservationRepository reservationRepository;

    @Autowired
    public ReservationCarpooServicesImpl(IReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Override
    public ReservationCarpoo saveReservation(ReservationCarpoo reservationCarpoo) {
        return reservationRepository.save(reservationCarpoo);
    }

    @Override
    public ReservationCarpoo getReservationById(Long id) {
        return reservationRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
    @Override
    public List<ReservationCarpoo> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

}