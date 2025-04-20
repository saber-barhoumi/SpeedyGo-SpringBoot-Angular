package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.ReservationCarpoo;

import java.util.List;

public interface IReservationCarpooServices {
    ReservationCarpoo saveReservation(ReservationCarpoo reservationCarpoo);
    ReservationCarpoo getReservationById(Long id);
    void deleteReservation(Long id);
    List<ReservationCarpoo> getReservationsByUserId(Long userId);



}