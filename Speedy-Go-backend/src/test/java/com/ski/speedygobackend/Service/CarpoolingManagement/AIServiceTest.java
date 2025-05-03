package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AIServiceTest {

    private AIService aiService;

    @BeforeEach
    public void setUp() throws Exception {
        aiService = new AIService();
       // aiService.init();
    }

    @Test
    public void testPricePrediction() {
        Carpooling carpooling = new Carpooling();
        carpooling.setDepartureLocation("Tunis");
        carpooling.setDestination("Sfax");
        carpooling.setDistanceKm(270.0);
        carpooling.setDurationMinutes(180);
        carpooling.setVehicleType("sedan");
        carpooling.setFuelType("diesel");
        carpooling.setWifi(0);
        carpooling.setAirConditioning(1);
        carpooling.setWeatherType("Clear");

        double price = aiService.calculatePrice(carpooling);
        System.out.println("Predicted price: " + price);
        assertTrue(price > 0, "Price should be positive");
        assertTrue(price < 1000, "Price should be reasonable");
    }
}