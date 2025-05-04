package com.ski.speedygobackend.Service.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.CongeStatus;
import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Entity.RecrutementManagement.DemandeConge;
import com.ski.speedygobackend.Repository.IDeliveryVehicleRepository;
import com.ski.speedygobackend.Repository.IDemandeCongeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DemandeCongeService {

    private final IDemandeCongeRepository demandeCongeRepository;
    private final IDeliveryVehicleRepository deliveryVehicleRepository;

    // Constructeur avec injection des bons repositories
    public DemandeCongeService(IDemandeCongeRepository demandeCongeRepository, IDeliveryVehicleRepository deliveryVehicleRepository) {
        this.demandeCongeRepository = demandeCongeRepository;
        this.deliveryVehicleRepository = deliveryVehicleRepository;
    }

    // Créer une nouvelle demande de congé
    public DemandeConge createDemande(Long deliveryVehicleId, LocalDate dateDebut, LocalDate dateFin) {
        DeliveryVehicle deliveryVehicle = deliveryVehicleRepository.findById(deliveryVehicleId)
                .orElseThrow(() -> new RuntimeException("DeliveryVehicle introuvable"));

        DemandeConge demande = new DemandeConge();
        demande.setDateDebut(dateDebut);
        demande.setDateFin(dateFin);
        demande.setStatus(CongeStatus.PENDING);
        demande.setDeliveryVehicle(deliveryVehicle);

        return demandeCongeRepository.save(demande);
    }

    // Récupérer les demandes de congé d'un véhicule
    public List<DemandeConge> getDemandesByDeliveryVehicle(Long deliveryVehicleId) {
        return demandeCongeRepository.findByDeliveryVehicleVehicleId(deliveryVehicleId);
    }

    // Mettre à jour le statut d'une demande de congé
    public DemandeConge updateStatus(Long demandeId, CongeStatus status) {
        DemandeConge demande = demandeCongeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        demande.setStatus(status);
        return demandeCongeRepository.save(demande);
    }
}
