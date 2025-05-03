package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import org.dmg.pmml.FieldName;
import org.jpmml.evaluator.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Service
public class AIService {
    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    private Evaluator evaluator;

    @Value("${ai.model.path}")
    private Resource modelResource;

    @PostConstruct
    public void initialize() {
        try {
            evaluator = new LoadingModelEvaluatorBuilder()
                    .load(modelResource.getInputStream())
                    .build();

            // Verify model
            evaluator.verify();
            logger.info("PMML model loaded successfully: {}", modelResource);
        } catch (Exception e) {
            logger.error("Error loading PMML model", e);
            throw new RuntimeException("Failed to load price prediction model", e);
        }
    }

    /**
     * Validates carpooling details to ensure they are within acceptable ranges
     * @param carpooling The carpooling object to validate
     * @return true if the carpooling details are valid, false otherwise
     */
    public boolean validateCarpoolingDetails(Carpooling carpooling) {
        logger.info("Validating carpooling details: {}", carpooling);

        // Example validation logic - you'll need to adjust based on your specific requirements
        if (carpooling.getDistanceKm() <= 0) {
            logger.warn("Invalid distance: {}", carpooling.getDistanceKm());
            return false;
        }

        if (carpooling.getDurationMinutes() <= 0) {
            logger.warn("Invalid duration: {}", carpooling.getDurationMinutes());
            return false;
        }

        if (carpooling.getAvailableSeats() <= 0) {
            logger.warn("Invalid available seats: {}", carpooling.getAvailableSeats());
            return false;
        }

        if (carpooling.getDepartureLocation() == null || carpooling.getDepartureLocation().trim().isEmpty()) {
            logger.warn("Missing departure location");
            return false;
        }

        if (carpooling.getDestination() == null || carpooling.getDestination().trim().isEmpty()) {
            logger.warn("Missing destination");
            return false;
        }

        logger.info("Carpooling details are valid");
        return true;
    }

    public double calculatePrice(Carpooling carpooling) {
        logger.info("Calculating price for carpooling: {}", carpooling);

        // Check for valid distance and duration
        if (carpooling.getDistanceKm() <= 0 || carpooling.getDurationMinutes() <= 0) {
            logger.warn("Invalid distance or duration values. Using fallback calculation.");
            return calculateFallbackPrice(carpooling);
        }

        // Prepare input data for the model
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("distanceKm", carpooling.getDistanceKm());
        arguments.put("durationMinutes", carpooling.getDurationMinutes());
        arguments.put("vehicleType", carpooling.getVehicleType());
        arguments.put("fuelType", carpooling.getFuelType());
        arguments.put("availableSeats", carpooling.getAvailableSeats());
        arguments.put("wifi", carpooling.getWifi());
        arguments.put("airConditioning", carpooling.getAirConditioning());
        arguments.put("weatherType", carpooling.getWeatherType());

        logger.debug("Model input arguments: {}", arguments);

        try {
            // Convert raw input values to PMML input values
            Map<FieldName, FieldValue> pmmlArguments = new LinkedHashMap<>();
            for (Map.Entry<String, Object> entry : arguments.entrySet()) {
                FieldName fieldName = FieldName.create(entry.getKey());
                Object rawValue = entry.getValue();

                // Skip null values to prevent model errors
                if (rawValue == null) {
                    continue;
                }

                // Create field value using the InputField
                List<? extends InputField> inputFields = evaluator.getInputFields();
                for (InputField inputField : inputFields) {
                    if (inputField.getName().equals(fieldName)) {
                        FieldValue fieldValue = inputField.prepare(rawValue);
                        pmmlArguments.put(fieldName, fieldValue);
                        break;
                    }
                }
            }

            // Evaluate model
            Map<FieldName, ?> results = evaluator.evaluate(pmmlArguments);

            // Get the result - updated to use getTargetFields() instead of getTargetField()
            List<? extends TargetField> targetFields = evaluator.getTargetFields();
            FieldName targetFieldName = targetFields.get(0).getName(); // Get the first target field
            Object targetValue = results.get(targetFieldName);

            double price;

            if (targetValue == null) {
                // If the model returned null, use a fallback calculation
                logger.warn("Model returned null value. Using fallback price calculation.");
                price = calculateFallbackPrice(carpooling);
            } else if (targetValue instanceof Computable) {
                price = ((Number) ((Computable) targetValue).getResult()).doubleValue();
            } else if (targetValue instanceof Number) {
                price = ((Number) targetValue).doubleValue();
            } else {
                price = Double.parseDouble(targetValue.toString());
            }

            // Round to 2 decimal places
            price = Math.round(price * 100.0) / 100.0;
            logger.info("Calculated price: {}", price);

            return price;
        } catch (Exception e) {
            logger.error("Error evaluating model", e);
            return calculateFallbackPrice(carpooling);
        }
    }

    /**
     * Calculates a fallback price when the model fails to produce a result
     * @param carpooling The carpooling object
     * @return A calculated price based on distance and duration
     */
    private double calculateFallbackPrice(Carpooling carpooling) {
        // Simple fallback calculation based on distance and duration
        double basePrice = 5.0; // Minimum base price
        double distanceRate = 0.5; // Price per km
        double timeRate = 0.1; // Price per minute

        double price = basePrice;

        if (carpooling.getDistanceKm() > 0) {
            price += carpooling.getDistanceKm() * distanceRate;
        }

        if (carpooling.getDurationMinutes() > 0) {
            price += carpooling.getDurationMinutes() * timeRate;
        }

        // Add extra for premium features
        if (carpooling.getWifi() == 1) {
            price += 2.0;
        }

        if (carpooling.getAirConditioning() == 1) {
            price += 1.5;
        }

        // Round to 2 decimal places
        price = Math.round(price * 100.0) / 100.0;
        logger.info("Fallback price calculation: {}", price);

        return price;
    }
}