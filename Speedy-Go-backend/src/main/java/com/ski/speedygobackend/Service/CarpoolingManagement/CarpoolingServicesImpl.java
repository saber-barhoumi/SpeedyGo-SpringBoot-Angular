package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Repository.ICarpoolingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarpoolingServicesImpl implements ICarpoolingServices {

    private final ICarpoolingRepository carpoolingRepository;
    private final AIService aiService;

    @Autowired
    public CarpoolingServicesImpl(ICarpoolingRepository carpoolingRepository, AIService aiService) {
        this.carpoolingRepository = carpoolingRepository;
        this.aiService = aiService;
    }

    @Override
    public List<Carpooling> getAllCarpoolings() {
        return carpoolingRepository.findAll();
    }

    @Override
    public Carpooling getCarpoolingById(Long id) {
        return carpoolingRepository.findById(id).orElse(null);
    }

    @Override
    public Carpooling saveCarpooling(Carpooling carpooling) {
        // Calculate price using AI model
        double price = aiService.calculatePrice(carpooling);
        carpooling.setPricePerSeat(price);

        return carpoolingRepository.save(carpooling);
    }

    @Override
    public void deleteCarpooling(Long id) {
        carpoolingRepository.deleteById(id);
    }

    @Override
    public double calculatePrice(Carpooling carpooling) {
        return aiService.calculatePrice(carpooling);
    }
}