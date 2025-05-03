import { ComponentFixture, TestBed } from '@angular/core/testing';

import { addstoreComponent } from './add-store.component';

describe('addstoreComponent', () => {
  let component: addstoreComponent;
  let fixture: ComponentFixture<addstoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [addstoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(addstoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
