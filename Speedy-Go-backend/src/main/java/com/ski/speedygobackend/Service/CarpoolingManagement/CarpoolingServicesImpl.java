package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Repository.ICarpoolingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarpoolingServicesImpl implements ICarpoolingServices {

    private final ICarpoolingRepository carpoolingRepository;

    // Injection du repository via le constructeur
    public CarpoolingServicesImpl(ICarpoolingRepository carpoolingRepository) {
        this.carpoolingRepository = carpoolingRepository;
    }

    @Override
    public List<Carpooling> getAllCarpoolings() {
        return carpoolingRepository.findAll(); // Récupérer tous les covoiturages
    }

    @Override
    public Carpooling getCarpoolingById(Long id) {
        return carpoolingRepository.findById(id).orElse(null); // Récupérer un covoiturage par son ID
    }

    @Override
    public Carpooling saveCarpooling(Carpooling carpooling) {
        return carpoolingRepository.save(carpooling); // Sauvegarder un covoiturage
    }

    @Override
    public void deleteCarpooling(Long id) {
        carpoolingRepository.deleteById(id); // Supprimer un covoiturage par son ID
    }

}