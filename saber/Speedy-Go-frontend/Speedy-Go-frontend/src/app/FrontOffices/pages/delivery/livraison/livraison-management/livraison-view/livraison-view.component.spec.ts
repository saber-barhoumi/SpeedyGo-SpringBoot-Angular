import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisonViewComponent } from './livraison-view.component';

describe('LivraisonViewComponent', () => {
  let component: LivraisonViewComponent;
  let fixture: ComponentFixture<LivraisonViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LivraisonViewComponent]
    });
    fixture = TestBed.createComponent(LivraisonViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
