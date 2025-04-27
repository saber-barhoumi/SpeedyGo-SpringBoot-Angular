import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { AiVehicleSuggestion } from 'src/app/models/livraison.model';

@Component({
  selector: 'app-ai-vehicle-suggestion-dialog',
  templateUrl: './ai-vehicle-suggestion-dialog.component.html',
  styleUrls: ['./ai-vehicle-suggestion-dialog.component.css']
})
export class AiVehicleSuggestionDialogComponent implements OnChanges {
  @Input() suggestion: AiVehicleSuggestion | null = null;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  
  ngOnChanges(changes: SimpleChanges): void {
    // Log the suggestion when it changes to debug
    if (changes['suggestion'] && changes['suggestion'].currentValue) {
      console.log('AI Suggestion received:', this.suggestion);
    }
  }
  
  closeDialog(): void {
    this.visible = false;
    this.close.emit();
  }
}