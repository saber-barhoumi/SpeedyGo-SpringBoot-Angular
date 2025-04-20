import { Component, OnInit } from '@angular/core';
import { ReturnService } from 'src/app/services/return.service';
import { Returns } from 'src/app/models/return';

@Component({
  selector: 'app-listreturns',
  templateUrl: './listreturns.component.html',
  styleUrls: ['./listreturns.component.css']
})
export class ListreturnsComponent implements OnInit {
  returns: Returns[] = [];

  constructor(private returnService: ReturnService) {}

  ngOnInit(): void {
    this.getReturns();
  }

  getReturns(): void {
    this.returnService.getAllReturns().subscribe({
      next: (data) => {
        this.returns = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des retours :', err);
      }
    });
  }
}
