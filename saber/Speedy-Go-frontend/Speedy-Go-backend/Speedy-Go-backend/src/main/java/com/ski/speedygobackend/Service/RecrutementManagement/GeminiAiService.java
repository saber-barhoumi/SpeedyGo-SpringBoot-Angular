package com.ski.speedygobackend.Service.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Entity.RecrutementManagement.Livraison;
import com.ski.speedygobackend.Enum.VehicleType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class GeminiAiService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiAiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Selects the best vehicle for a delivery based on AI recommendations
     * Returns a random car if no suitable vehicle exists
     */
    public Long selectBestVehicle(Livraison livraison, List<DeliveryVehicle> availableVehicles) {
        try {
            // Check if there are any vehicles available
            if (availableVehicles == null || availableVehicles.isEmpty()) {
                return null;
            }

            // Create a map of vehicle IDs for validation
            Set<Long> validVehicleIds = new HashSet<>();
            for (DeliveryVehicle vehicle : availableVehicles) {
                validVehicleIds.add(vehicle.getVehicleId());
            }

            // Format information about the delivery
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("I need to select the best vehicle for this delivery:\n\n");
            promptBuilder.append("Delivery Information:\n");
            promptBuilder.append("- Weight: ").append(livraison.getPackageWeightKg()).append(" kg\n");
            promptBuilder.append("- Volume: ").append(livraison.getPackageDimensions()).append(" cubic meters\n");
            promptBuilder.append("- Distance: ").append(livraison.getDistanceInKm()).append(" km\n");

            // Check if needsRefrigeration field exists and use it
            boolean needsRefrigeration = false;
            try {
                needsRefrigeration = livraison.getRequiresRefrigeration();
                promptBuilder.append("- Requires refrigeration: ").append(needsRefrigeration ? "Yes" : "No").append("\n");
            } catch (Exception e) {
                // Field might not exist, just skip it
            }

            // Format information about available vehicles
            promptBuilder.append("\nAvailable Vehicles:\n");
            for (DeliveryVehicle vehicle : availableVehicles) {
                promptBuilder.append("ID: ").append(vehicle.getVehicleId()).append("\n");
                promptBuilder.append("- Type: ").append(vehicle.getVehicleType()).append("\n");
                promptBuilder.append("- Brand: ").append(vehicle.getBrand()).append(" ").append(vehicle.getModel()).append("\n");
                promptBuilder.append("- Max Load: ").append(vehicle.getMaxLoadCapacity()).append(" kg\n");
                promptBuilder.append("- Has Refrigeration: ").append(vehicle.getHasRefrigeration()).append("\n\n");
            }

            // IMPROVED PROMPT: Make it very clear what format we expect
            promptBuilder.append("Based on the delivery requirements and available vehicles, return ONLY the ID number of the most suitable vehicle. ");
            promptBuilder.append("Your response should be EXACTLY one single number and nothing else. ");
            promptBuilder.append("Choose from one of these valid IDs: ");

            // List all valid IDs explicitly
            List<Long> idList = new ArrayList<>(validVehicleIds);
            for (int i = 0; i < idList.size(); i++) {
                promptBuilder.append(idList.get(i));
                if (i < idList.size() - 1) {
                    promptBuilder.append(", ");
                }
            }

            promptBuilder.append(". If no suitable vehicle exists, return 0.");

            // Send request to Gemini API
            String aiResponse = generateContent(promptBuilder.toString());

            // IMPROVED PARSING: Extract just the first number from the response
            Pattern pattern = Pattern.compile("\\b(\\d+)\\b");
            Matcher matcher = pattern.matcher(aiResponse);

            // Find the first number in the response
            if (matcher.find()) {
                String idStr = matcher.group(1);
                Long vehicleId = Long.parseLong(idStr);

                // Validate that it's a valid vehicle ID
                if (validVehicleIds.contains(vehicleId)) {
                    return vehicleId;
                }
                // If AI returned 0 (no suitable vehicle), find a random car
                else if (vehicleId == 0) {
                    return getRandomCarVehicleId(availableVehicles);
                }
                // Try to find the first valid ID in the response
                else {
                    matcher = pattern.matcher(aiResponse);
                    while (matcher.find()) {
                        idStr = matcher.group(1);
                        vehicleId = Long.parseLong(idStr);
                        if (validVehicleIds.contains(vehicleId)) {
                            return vehicleId;
                        }
                    }
                    // If no valid ID found, return a random car
                    return getRandomCarVehicleId(availableVehicles);
                }
            }

            // No number found in response, return a random car
            return getRandomCarVehicleId(availableVehicles);
        } catch (Exception e) {
            System.err.println("Error selecting best vehicle: " + e.getMessage());
            e.printStackTrace();
            // In case of error, return a random car
            return getRandomCarVehicleId(availableVehicles);
        }
    }

    /**
     * Returns a random car vehicle ID from the available vehicles.
     * If no car is available, returns a random vehicle ID from any type.
     */
    private Long getRandomCarVehicleId(List<DeliveryVehicle> availableVehicles) {
        if (availableVehicles == null || availableVehicles.isEmpty()) {
            return null;
        }

        // Filter to get only CAR type vehicles
        List<DeliveryVehicle> cars = availableVehicles.stream()
                .filter(v -> v.getVehicleType() == VehicleType.CAR)
                .collect(Collectors.toList());

        // If no cars available, use any vehicle
        List<DeliveryVehicle> vehiclesToChooseFrom = cars.isEmpty() ? availableVehicles : cars;

        // Select a random vehicle
        Random random = new Random();
        int randomIndex = random.nextInt(vehiclesToChooseFrom.size());
        return vehiclesToChooseFrom.get(randomIndex).getVehicleId();
    }

    public String generateContent(String prompt) {
        try {
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create request body exactly matching working curl format
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> textPart = new HashMap<>();

            textPart.put("text", prompt);
            parts.add(textPart);
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            // Add safety settings to improve response format
            List<Map<String, Object>> safetySettings = new ArrayList<>();
            Map<String, Object> safetySetting = new HashMap<>();
            safetySetting.put("category", "HARM_CATEGORY_DANGEROUS_CONTENT");
            safetySetting.put("threshold", "BLOCK_NONE");
            safetySettings.add(safetySetting);
            requestBody.put("safetySettings", safetySettings);

            // Add generation config to make responses more precise
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.1);  // Lower temperature for more precise responses
            generationConfig.put("maxOutputTokens", 20);  // Limit response length
            requestBody.put("generationConfig", generationConfig);

            // Create HTTP entity
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Create URL with API key
            String urlWithKey = apiUrl + "?key=" + apiKey;

            // Make API call
            Map response = restTemplate.postForObject(urlWithKey, request, Map.class);

            // Process response
            if (response != null && response.containsKey("candidates")) {
                List<?> candidates = (List<?>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> contentResponse = (Map<?, ?>) firstCandidate.get("content");
                    List<?> partsResponse = (List<?>) contentResponse.get("parts");
                    Map<?, ?> firstPart = (Map<?, ?>) partsResponse.get(0);
                    return (String) firstPart.get("text");
                }
            }

            return "Error processing the response from Gemini.";
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            e.printStackTrace();
            return "Error generating content: " + e.getMessage();
        }
    }

    /**
     * Fallback method that doesn't use AI
     * Returns a random car if no suitable vehicle exists
     */
    public Long selectBestVehicleWithoutAI(Livraison livraison, List<DeliveryVehicle> availableVehicles) {
        if (availableVehicles == null || availableVehicles.isEmpty()) {
            return null;
        }

        // Get delivery requirements
        double weight = livraison.getPackageWeightKg();
        boolean needsRefrigeration = false;
        try {
            needsRefrigeration = livraison.getRequiresRefrigeration();
        } catch (Exception e) {
            // Field might not exist
        }

        // Find suitable vehicles
        List<DeliveryVehicle> suitable = new ArrayList<>();
        for (DeliveryVehicle vehicle : availableVehicles) {
            if (vehicle.getMaxLoadCapacity() >= weight) {
                if (!needsRefrigeration || vehicle.getHasRefrigeration()) {
                    suitable.add(vehicle);
                }
            }
        }

        if (suitable.isEmpty()) {
            // If no suitable vehicle, return a random car
            return getRandomCarVehicleId(availableVehicles);
        }

        // Find most efficient vehicle (smallest that can handle the load)
        suitable.sort(Comparator.comparing(DeliveryVehicle::getMaxLoadCapacity));
        return suitable.get(0).getVehicleId();
    }
}