package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;

import java.util.List;

public interface ICarpoolingServices {
    List<Carpooling> getAllCarpoolings(); // Récupérer tous les covoiturages
    Carpooling getCarpoolingById(Long id); // Récupérer un covoiturage par son ID
    Carpooling saveCarpooling(Carpooling carpooling); // Sauvegarder un covoiturage
    void deleteCarpooling(Long id); // Supprimer un covoiturage par son ID
}