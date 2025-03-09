import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsformComponent } from './reportsform.component';

describe('ReportsformComponent', () => {
  let component: ReportsformComponent;
  let fixture: ComponentFixture<ReportsformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportsformComponent]
    });
    fixture = TestBed.createComponent(ReportsformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
