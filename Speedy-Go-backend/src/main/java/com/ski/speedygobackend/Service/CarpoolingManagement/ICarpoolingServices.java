package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import java.util.List;

public interface ICarpoolingServices {
    List<Carpooling> getAllCarpoolings();
    List<Carpooling> getUpcomingCarpoolings(); // Added method for upcoming trips
    Carpooling getCarpoolingById(Long id);
    Carpooling createCarpooling(Carpooling carpooling, String username);
    Carpooling updateCarpooling(Long id, Carpooling carpooling, String username);
    void deleteCarpooling(Long id, String username);
    double calculatePrice(Carpooling carpooling);
    Carpooling acceptCarpooling(Long id, String username);
    List<Carpooling> getCarpoolingsByUser(String username);
    void checkAndSendTripStartNotifications(); // Added method for checking and sending notifications
}