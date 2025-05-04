import { Component, Input } from '@angular/core';
import { PointFidelite } from '../models/fidelite.model';

@Component({
  selector: 'app-fidelite-card',
  templateUrl: './fidelite-card.component.html',
  styleUrls: ['./fidelite-card.component.scss']
})
export class FideliteCardComponent {
  @Input() card!: PointFidelite;

  formatLastUsedDate(): string {
    if (!this.card.last_used || this.card.last_used.length < 3) {
      return 'Date not available';
    }
    
    // Format: YYYY-MM-DD
    const year = this.card.last_used[0];
    const month = this.card.last_used[1];
    const day = this.card.last_used[2];
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  // Calculate a progress percentage for display (just a sample implementation)
  getProgressPercentage(): number {
    // This is a simple example - in a real app, you might calculate this based on
    // points relative to some goal or threshold
    return Math.min(100, this.card.points);
  }
}