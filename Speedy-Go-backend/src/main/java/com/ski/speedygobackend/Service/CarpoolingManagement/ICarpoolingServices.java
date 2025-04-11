package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;

import java.util.List;



public interface ICarpoolingServices {
    List<Carpooling> getAllCarpoolings();
    Carpooling getCarpoolingById(Long id);
    Carpooling saveCarpooling(Carpooling carpooling);
    void deleteCarpooling(Long id);

    // New method to calculate price using AI service
    double calculatePrice(Carpooling carpooling);
}