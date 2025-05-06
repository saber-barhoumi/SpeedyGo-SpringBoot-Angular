import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisonListComponent } from './livraison-list.component';

describe('LivraisonListComponent', () => {
  let component: LivraisonListComponent;
  let fixture: ComponentFixture<LivraisonListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LivraisonListComponent]
    });
    fixture = TestBed.createComponent(LivraisonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
