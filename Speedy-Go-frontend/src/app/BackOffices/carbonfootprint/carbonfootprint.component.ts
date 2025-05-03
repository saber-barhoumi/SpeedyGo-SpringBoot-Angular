import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CarbonFootprintService } from 'src/app/services/carbon-footprint.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-carbonfootprint',
  templateUrl: './carbonfootprint.component.html',
  styleUrls: ['./carbonfootprint.component.css']
})
export class CarbonFootprintComponent implements OnInit {

  @ViewChild('myChart', { static: false }) myChart!: ElementRef;

  loading: boolean = false;
  error: boolean = false;
  predictions: number[] = [];
  advice: string[] = [];
  chart: any;

  constructor(private carbonFootprintService: CarbonFootprintService) { }

  ngOnInit(): void {
    this.getPrediction();
  }

  getPrediction() {
    this.loading = true;  // Démarrer le chargement
    this.carbonFootprintService.getPrediction().subscribe(
      (response) => {
        this.loading = false;  // Arrêter le chargement
        this.predictions = response.prediction;
        this.advice = response.advice;

        console.log('Réponse de l\'API:', response);  // Pour vérifier la réponse
        
        // Ajout des labels pour chaque véhicule
        const labels = this.predictions.map((_, index) => `Véhicule ${index + 1}`);

        setTimeout(() => {
          // Si le graphique existe déjà, le détruire avant de créer un nouveau
          if (this.chart) this.chart.destroy();

          // Créer un nouveau graphique avec les données et options
          this.chart = new Chart(this.myChart.nativeElement, {
            type: 'bar',  // Type de graphique (barres ici)
            data: {
              labels: labels,  // Labels des véhicules
              datasets: [{
                label: 'Empreinte carbone (kg CO₂)',
                data: this.predictions,  // Les données à afficher
                backgroundColor: this.predictions.map(p =>
                  p > 300 ? 'rgba(255, 99, 132, 0.6)' : 'rgba(75, 192, 192, 0.6)' // Couleur en fonction des valeurs
                ),
                borderColor: 'rgba(0,0,0,0.1)',  // Bordure des barres
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,  // Rendre le graphique responsive
              plugins: {
                legend: {
                  display: true,  // Afficher la légende
                  position: 'top'
                },
                tooltip: {
                  enabled: true  // Activer les tooltips (info au survol)
                }
              },
              scales: {
                y: {
                  beginAtZero: true,  // Commencer l'axe Y à 0
                  title: {
                    display: true,
                    text: 'Kg CO₂'  // Titre de l'axe Y
                  }
                }
              }
            }
          });
        }, 100); // Attendre que le DOM soit prêt pour créer le graphique

      },
      (error) => {
        this.loading = false;  // Arrêter le chargement en cas d'erreur
        this.error = true;  // Afficher l'erreur
        console.error('Erreur lors de la récupération des prédictions:', error);
      }
    );
  }
}
