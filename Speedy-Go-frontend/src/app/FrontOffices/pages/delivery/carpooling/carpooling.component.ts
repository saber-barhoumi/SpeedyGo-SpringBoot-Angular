// src/app/carpooling/carpooling.component.ts
import { Component, OnInit } from '@angular/core';
import { Carpooling } from 'src/app/FrontOffices/models/carpooling';
import { CarpoolingService } from 'src/app/FrontOffices/services/carpooling.service';
@Component({
  selector: 'app-carpooling',
  templateUrl: './carpooling.component.html',
  styleUrls: ['./carpooling.component.css']
})
export class CarpoolingComponent implements OnInit {
  currentView: string = 'list';
  selectedCarpool: Carpooling | null = null;
  newCarpooling: Carpooling = new Carpooling(); // Initialisation obligatoire

  constructor(private carpoolingService: CarpoolingService) {}

  ngOnInit(): void {
    // Éventuelle initialisation supplémentaire si nécessaire
  }

  // Ajouter un covoiturage
  addCarpooling() {
    this.carpoolingService.addCarpooling(this.newCarpooling).subscribe({
      next: (response) => {
        console.log('Covoiturage ajouté', response);
        this.currentView = 'list'; // Retour à la liste après ajout
        this.newCarpooling = new Carpooling(); // Réinitialisation du formulaire
      },
      error: (err) => console.error('Erreur lors de l\'ajout', err)
    });
  }

  // Afficher la vue liste
  showList() {
    this.currentView = 'list';
  }

  // Afficher la vue d'ajout
  showAdd() {
    this.currentView = 'add';
  }

  // Sélectionner un covoiturage pour voir ses détails ou le modifier
  onSelectCarpool(carpooling: Carpooling) {
    this.selectedCarpool = carpooling;
    this.currentView = 'details';
  }

  // Revenir à la liste des covoiturages
  onBack() {
    this.currentView = 'list';
  }

  // Annuler l'ajout ou la mise à jour et revenir à la liste
  onCancel() {
    this.currentView = 'list';
  }

  // Modifier un covoiturage
  onUpdateCarpool(carpooling: Carpooling) {
    this.selectedCarpool = carpooling;
    this.currentView = 'update';
  }
}
