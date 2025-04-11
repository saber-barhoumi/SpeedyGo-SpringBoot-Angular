package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AIServiceTest {

    @Test
    public void testPricePredictionWithoutSpring() throws Exception {
        // Instancier le service manuellement
        AIService aiService = new AIService();
        aiService.init(); // Appeler manuellement la méthode @PostConstruct

        // Préparer un objet Carpooling fictif
        Carpooling carpooling = new Carpooling();
        carpooling.setDepartureLocation("Sfax");
        carpooling.setDestination("Tunis");
        carpooling.setDistanceKm(270.0);
        carpooling.setDurationMinutes(180);
        carpooling.setVehicleType("sedan");
        carpooling.setFuelType("diesel");

        // Calculer le prix
        double price = aiService.calculatePrice(carpooling);

        System.out.println("Prix prédit : " + price);

        // Vérification
        assertTrue(price > 0, "Le prix devrait être positif");
    }
}