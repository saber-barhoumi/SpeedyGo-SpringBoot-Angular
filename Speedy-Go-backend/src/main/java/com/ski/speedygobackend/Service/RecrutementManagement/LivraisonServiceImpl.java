package com.ski.speedygobackend.Service.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Entity.RecrutementManagement.Livraison;
import com.ski.speedygobackend.Enum.LivraisonStatus;
import com.ski.speedygobackend.Exception.ResourceNotFoundException;
import com.ski.speedygobackend.Repository.LivraisonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LivraisonServiceImpl implements ILivraisonService {

    private final LivraisonRepository livraisonRepository;
    private final IDeliveryVehicleService deliveryVehicleService;
    private final GeminiAiService geminiAiService;

    @Autowired
    public LivraisonServiceImpl(
            LivraisonRepository livraisonRepository,
            IDeliveryVehicleService deliveryVehicleService,
            GeminiAiService geminiAiService) {
        this.livraisonRepository = livraisonRepository;
        this.deliveryVehicleService = deliveryVehicleService;
        this.geminiAiService = geminiAiService;
    }

    @Override
    public List<Livraison> getAllLivraisons() {
        return livraisonRepository.findAll();
    }

    @Override
    public Livraison getLivraisonById(Long id) {
        return livraisonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livraison not found with id: " + id));
    }

    @Override
    public Livraison createLivraison(Livraison livraison) {
        livraison.setStatus(LivraisonStatus.PENDING);
        livraison.setCreatedAt(LocalDateTime.now());
        livraison.setUpdatedAt(LocalDateTime.now());
        return livraisonRepository.save(livraison);
    }

    @Override
    public Livraison updateLivraison(Long id, Livraison livraisonDetails) {
        Livraison livraison = getLivraisonById(id);

        // Update fields
        livraison.setTitle(livraisonDetails.getTitle());
        livraison.setDescription(livraisonDetails.getDescription());
        livraison.setOriginAddress(livraisonDetails.getOriginAddress());
        livraison.setDestinationAddress(livraisonDetails.getDestinationAddress());
        livraison.setDistanceInKm(livraisonDetails.getDistanceInKm());
        livraison.setPackageWeightKg(livraisonDetails.getPackageWeightKg());
        livraison.setRequiresRefrigeration(livraisonDetails.getRequiresRefrigeration());
        livraison.setPackageDimensions(livraisonDetails.getPackageDimensions());
        livraison.setScheduledPickupTime(livraisonDetails.getScheduledPickupTime());
        livraison.setScheduledDeliveryTime(livraisonDetails.getScheduledDeliveryTime());
        livraison.setStatus(livraisonDetails.getStatus());
        livraison.setUpdatedAt(LocalDateTime.now());

        // Only update the actual delivery time if provided
        if (livraisonDetails.getActualDeliveryTime() != null) {
            livraison.setActualDeliveryTime(livraisonDetails.getActualDeliveryTime());
        }

        return livraisonRepository.save(livraison);
    }

    @Override
    public void deleteLivraison(Long id) {
        Livraison livraison = getLivraisonById(id);
        livraisonRepository.delete(livraison);
    }

    @Override
    public List<Livraison> getLivraisonsByStatus(LivraisonStatus status) {
        return livraisonRepository.findByStatus(status);
    }

    @Override
    public Livraison assignVehicle(Long id, Long vehicleId) {
        Livraison livraison = getLivraisonById(id);
        DeliveryVehicle vehicle = deliveryVehicleService.getVehicleById(vehicleId);

        // Assign the vehicle
        livraison.setAssignedVehicle(vehicle);

        // Update status to IN_PROGRESS if it's currently PENDING
        if (livraison.getStatus() == LivraisonStatus.PENDING) {
            livraison.setStatus(LivraisonStatus.VEHICLE_ASSIGNED);
        }

        // Save changes
        return livraisonRepository.save(livraison);
    }

    @Override
    public Map<String, Object> suggestBestVehicle(Long livraisonId) {
        Livraison livraison = getLivraisonById(livraisonId);
        List<DeliveryVehicle> availableVehicles = deliveryVehicleService.getAllVehicles();

        // Try AI first, use fallback if it fails
        Long suggestedVehicleId = null;
        boolean usedFallback = false;

        try {
            suggestedVehicleId = geminiAiService.selectBestVehicle(livraison, availableVehicles);
        } catch (Exception e) {
            System.err.println("AI recommendation failed: " + e.getMessage());
            usedFallback = true;
        }

        // If AI failed or returned null, use fallback
        if (suggestedVehicleId == null) {
            suggestedVehicleId = geminiAiService.selectBestVehicleWithoutAI(livraison, availableVehicles);
            usedFallback = true;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("livraison", livraison);

        if (suggestedVehicleId != null && suggestedVehicleId > 0) {
            DeliveryVehicle suggestedVehicle = deliveryVehicleService.getVehicleById(suggestedVehicleId);
            response.put("suggestedVehicle", suggestedVehicle);
            response.put("suggestedVehicleId", suggestedVehicleId);
            if (usedFallback) {
                response.put("note", "This suggestion was generated using business logic, not AI.");
            }
        } else {
            response.put("message", "No suitable vehicle found for this delivery");
        }

        return response;
    }
    @Override
    public Map<String, Object> createLivraisonWithAiVehicleSuggestion(Livraison livraison) {
        // First create the delivery
        Livraison createdLivraison = createLivraison(livraison);

        // Then get and assign a vehicle
        Map<String, Object> result = suggestAndAssignBestVehicle(createdLivraison.getLivraisonId());

        return result;
    }
    @Override
    public Map<String, Object> suggestAndAssignBestVehicle(Long livraisonId) {
        // First get the suggestion
        Map<String, Object> suggestion = suggestBestVehicle(livraisonId);

        // Check if we have a suggestion
        if (suggestion.containsKey("suggestedVehicleId")) {
            Long vehicleId = (Long) suggestion.get("suggestedVehicleId");

            // Assign the vehicle
            Livraison updatedLivraison = assignVehicle(livraisonId, vehicleId);

            // Update the response to include the assigned status
            suggestion.put("livraison", updatedLivraison);
            suggestion.put("assigned", true);
            suggestion.put("assignedAt", LocalDateTime.now());
            suggestion.put("message", "Vehicle #" + vehicleId + " has been automatically assigned to this delivery.");
        } else {
            suggestion.put("assigned", false);
            suggestion.put("message", "Could not assign a vehicle: " + suggestion.get("message"));
        }

        return suggestion;
    }





}