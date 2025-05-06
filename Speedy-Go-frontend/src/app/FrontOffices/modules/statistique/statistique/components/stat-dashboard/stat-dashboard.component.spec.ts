import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatDashboardComponent } from './stat-dashboard.component';

describe('StatDashboardComponent', () => {
  let component: StatDashboardComponent;
  let fixture: ComponentFixture<StatDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatDashboardComponent]
    });
    fixture = TestBed.createComponent(StatDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
