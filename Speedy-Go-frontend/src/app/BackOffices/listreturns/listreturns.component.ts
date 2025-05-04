import { Component, OnInit } from '@angular/core';
import { ReturnService } from 'src/app/services/return.service';
import { Returns } from 'src/app/models/return';

@Component({
  selector: 'app-listreturns',
  templateUrl: './listreturns.component.html',
  styleUrls: ['./listreturns.component.css']
})
export class ListreturnsComponent implements OnInit {
  returns: Returns[] = [];  // Liste des retours
  errorMessage: string = '';  // Message d'erreur

  constructor(private returnService: ReturnService) {}

  ngOnInit(): void {
    // Obtenez les retours dès que le composant est initialisé
    this.loadReturns();
  }

  // Charger les retours depuis le service
  loadReturns(): void {
    this.returnService.getAllReturns().subscribe({
      next: (data) => {
        this.returns = data;  // Mettez à jour la liste des retours
      },
      error: (err) => {
        this.errorMessage = 'Une erreur est survenue lors de la récupération des retours.';
        console.error('Erreur lors de la récupération des retours :', err);
      }
    });
  }

  // Mettre à jour le statut d'un retour
  updateReturnStatus(returnData: Returns): void {
    const { returnID, retourstatus } = returnData;
    if (returnID) {
      this.returnService.updateReturnStatus(returnID, retourstatus).subscribe({
        next: () => {
          console.log(`Statut du retour ${returnID} mis à jour`);
          this.loadReturns();  // Recharge les retours après mise à jour
        },
        error: (err) => {
          this.errorMessage = 'Une erreur est survenue lors de la mise à jour du statut.';
          console.error('Erreur lors de la mise à jour du statut :', err);
        }
      });
    } else {
      console.error('ID du retour invalide', returnData);
    }
  }
}
