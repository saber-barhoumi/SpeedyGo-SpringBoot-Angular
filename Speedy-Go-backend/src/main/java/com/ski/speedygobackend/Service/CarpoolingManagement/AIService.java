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

@Service
public class AIService {
    private Evaluator evaluator;

    @PostConstruct
    public void init() throws Exception {
        // Load PMML model from resources
        InputStream pmmlStream = new ClassPathResource("models/trip_price_model.pmml").getInputStream();
        this.evaluator = new LoadingModelEvaluatorBuilder()
                .load(pmmlStream)
                .build();
        evaluator.verify();
    }

    public double calculatePrice(Carpooling carpooling) {
        // Prepare input data from Carpooling entity
        Map<String, Object> inputData = new LinkedHashMap<>();
        inputData.put("departure_city", carpooling.getDepartureLocation());
        inputData.put("arrival_city", carpooling.getDestination());
        inputData.put("distance_km", carpooling.getDistanceKm());
        inputData.put("vehicle_type", carpooling.getVehicleType());
        inputData.put("fuel_type", carpooling.getFuelType());
        inputData.put("wifi", 0); // Default value, adjust as needed
        inputData.put("air_conditioning", 1); // Default value, adjust as needed
        inputData.put("weather_type", "Clear"); // Default value, adjust as needed

        // Prepare PMML input
        Map<FieldName, FieldValue> arguments = new LinkedHashMap<>();
        for (InputField inputField : evaluator.getInputFields()) {
            FieldName fieldName = inputField.getName();
            Object rawValue = inputData.get(fieldName.getValue());

            // Convert raw value to PMML-compatible value
            FieldValue fieldValue = inputField.prepare(rawValue);
            arguments.put(fieldName, fieldValue);
        }

        // Evaluate model
        Map<FieldName, ?> results = evaluator.evaluate(arguments);

        // Get prediction result
        TargetField targetField = evaluator.getTargetFields().get(0);
        Object targetValue = results.get(targetField.getName());

        Object decodedValue = EvaluatorUtil.decode(targetValue);

        if (decodedValue instanceof Number) {
            return ((Number) decodedValue).doubleValue();
        } else {
            throw new IllegalStateException("Prediction result is not a numeric value: " + decodedValue);
        }

    }
}