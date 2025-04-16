package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import org.dmg.pmml.FieldName;
import org.jpmml.evaluator.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class AIService {
    private static final Logger LOGGER = Logger.getLogger(AIService.class.getName());
    private Evaluator evaluator;

    @PostConstruct
    public void init() throws Exception {
        try {
            InputStream pmmlStream = new ClassPathResource("models/trip_price_model.pmml").getInputStream();
            this.evaluator = new LoadingModelEvaluatorBuilder()
                    .load(pmmlStream)
                    .build();
            evaluator.verify();
            LOGGER.info("AI Model loaded successfully");
        } catch (Exception e) {
            LOGGER.severe("Error loading AI model: " + e.getMessage());
            throw e;
        }
    }

    public double calculatePrice(Carpooling carpooling) {
        try {
            // Prepare input data for price calculation
            Map<String, Object> inputData = new LinkedHashMap<>();

            // Essential trip details
            inputData.put("departure_city", carpooling.getDepartureLocation());
            inputData.put("arrival_city", carpooling.getDestination());
            inputData.put("distance_km", carpooling.getDistanceKm());
            inputData.put("duration_minutes", carpooling.getDurationMinutes());

            // Vehicle and fuel specifics
            inputData.put("vehicle_type", carpooling.getVehicleType());
            inputData.put("fuel_type", carpooling.getFuelType());

            // Additional features
            inputData.put("wifi", carpooling.getWifi() != null ? carpooling.getWifi() : 0);
            inputData.put("air_conditioning", carpooling.getAirConditioning() != null ? carpooling.getAirConditioning() : 0);
            inputData.put("weather_type", carpooling.getWeatherType() != null ? carpooling.getWeatherType() : "Clear");

            // Prepare arguments for PMML model
            Map<FieldName, FieldValue> arguments = new LinkedHashMap<>();
            for (InputField inputField : evaluator.getInputFields()) {
                FieldName fieldName = inputField.getName();
                Object rawValue = inputData.get(fieldName.getValue());
                FieldValue fieldValue = inputField.prepare(rawValue);
                arguments.put(fieldName, fieldValue);
            }

            // Evaluate the model
            Map<FieldName, ?> results = evaluator.evaluate(arguments);
            TargetField targetField = evaluator.getTargetFields().get(0);
            Object targetValue = results.get(targetField.getName());
            Object decodedValue = EvaluatorUtil.decode(targetValue);

            // Validate and return price
            if (decodedValue instanceof Number) {
                double calculatedPrice = ((Number) decodedValue).doubleValue();

                // Apply some basic validation
                if (calculatedPrice < 0) {
                    LOGGER.warning("Negative price calculated. Returning 0.");
                    return 0.0;
                }

                return calculatedPrice;
            } else {
                LOGGER.severe("Prediction result is not a numeric value");
                throw new IllegalStateException("Prediction result is not a numeric value");
            }
        } catch (Exception e) {
            LOGGER.severe("Error in price calculation: " + e.getMessage());
            // Fallback pricing if AI model fails
            return calculateFallbackPrice(carpooling);
        }
    }

    // Fallback pricing method
    private double calculateFallbackPrice(Carpooling carpooling) {
        double basePrice = 10.0; // Base price

        // Factor in distance
        double distanceFactor = carpooling.getDistanceKm() / 100.0;

        // Factor in vehicle type
        double vehicleTypeFactor = switch(carpooling.getVehicleType().toLowerCase()) {
            case "suv" -> 1.5;
            case "sedan" -> 1.2;
            default -> 1.0;
        };

        // Factor in additional features
        double featuresFactor = 1.0;
        if (carpooling.getWifi() != null && carpooling.getWifi() == 1) featuresFactor += 0.1;
        if (carpooling.getAirConditioning() != null && carpooling.getAirConditioning() == 1) featuresFactor += 0.1;

        // Calculate final price
        return Math.max(10.0, basePrice * distanceFactor * vehicleTypeFactor * featuresFactor);
    }

    // Validate carpooling details
    public boolean validateCarpoolingDetails(Carpooling carpooling) {
        // Basic validation checks
        return carpooling.getDepartureLocation() != null &&
                carpooling.getDestination() != null &&
                carpooling.getDistanceKm() > 0 &&
                carpooling.getDurationMinutes() > 0 &&
                carpooling.getVehicleType() != null &&
                carpooling.getFuelType() != null;
    }
}