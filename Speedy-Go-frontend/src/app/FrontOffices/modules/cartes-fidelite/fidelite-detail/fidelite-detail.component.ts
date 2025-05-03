import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MockLoyaltyCardService } from '../services/mock-loyalty-card.service';

@Component({
  selector: 'app-fidelite-detail',
  templateUrl: './fidelite-detail.component.html',
  styleUrls: ['./fidelite-detail.component.scss']
})
export class FideliteDetailComponent implements OnInit {
  card: any;

  constructor(
    private route: ActivatedRoute,
    private mockService: MockLoyaltyCardService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.card = this.mockService.getLoyaltyCardById(id);
  }
}