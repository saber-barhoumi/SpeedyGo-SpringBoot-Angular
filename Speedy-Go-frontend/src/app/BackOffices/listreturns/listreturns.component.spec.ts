import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListreturnsComponent } from './listreturns.component';

describe('ListreturnsComponent', () => {
  let component: ListreturnsComponent;
  let fixture: ComponentFixture<ListreturnsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListreturnsComponent]
    });
    fixture = TestBed.createComponent(ListreturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
