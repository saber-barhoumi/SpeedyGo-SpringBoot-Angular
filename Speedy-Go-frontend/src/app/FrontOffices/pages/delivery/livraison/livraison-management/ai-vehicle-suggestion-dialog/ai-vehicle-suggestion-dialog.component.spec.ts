import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiVehicleSuggestionDialogComponent } from './ai-vehicle-suggestion-dialog.component';

describe('AiVehicleSuggestionDialogComponent', () => {
  let component: AiVehicleSuggestionDialogComponent;
  let fixture: ComponentFixture<AiVehicleSuggestionDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AiVehicleSuggestionDialogComponent]
    });
    fixture = TestBed.createComponent(AiVehicleSuggestionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
