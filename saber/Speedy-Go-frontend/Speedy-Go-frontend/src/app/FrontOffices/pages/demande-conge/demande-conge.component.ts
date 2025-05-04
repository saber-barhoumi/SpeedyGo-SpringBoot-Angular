import { Component, OnInit } from '@angular/core';
import { DemandeCongeService } from 'src/app/services/demande-conge/demande-conge.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-demande-conge',
  templateUrl: './demande-conge.component.html',
  styleUrls: ['./demande-conge.component.css']
})
export class DemandeCongeComponent implements OnInit {

  deliveryVehicleId: number = 0;  // Initialisation avec une valeur par défaut
  dateDebut: string = '';         // Initialisation avec une chaîne vide
  dateFin: string = '';           // Initialisation avec une chaîne vide
  demandes: any[] = [];

  constructor(private demandeCongeService: DemandeCongeService) { }

  ngOnInit(): void {
    // Initialisation avec un ID de véhicule (à ajuster en fonction de l'application)
    this.deliveryVehicleId = 1;  // Exemple d'ID
    this.getDemandes();
  }

  // Créer une nouvelle demande de congé
  createDemande(): void {
    this.demandeCongeService.createDemande(this.deliveryVehicleId, this.dateDebut, this.dateFin)
      .subscribe(response => {
        console.log('Demande créée:', response);
        this.getDemandes();  // Rafraîchir la liste des demandes
      });
  }

  // Récupérer les demandes de congé d'un véhicule
  getDemandes(): void {
    this.demandeCongeService.getDemandesByVehicle(this.deliveryVehicleId)
      .subscribe(demandes => {
        this.demandes = demandes;
      });
  }

  // Mettre à jour le statut de la demande de congé
  updateStatus(demandeId: number, status: string): void {
    this.demandeCongeService.updateStatus(demandeId, status)
      .subscribe(response => {
        console.log('Statut mis à jour:', response);
        this.getDemandes();  // Rafraîchir la liste des demandes
      });
  }
}
