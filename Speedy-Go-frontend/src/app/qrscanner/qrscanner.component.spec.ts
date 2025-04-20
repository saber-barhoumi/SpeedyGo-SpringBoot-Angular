import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrscannerComponent } from './qrscanner.component';

describe('QrscannerComponent', () => {
  let component: QrscannerComponent;
  let fixture: ComponentFixture<QrscannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QrscannerComponent]
    });
    fixture = TestBed.createComponent(QrscannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
