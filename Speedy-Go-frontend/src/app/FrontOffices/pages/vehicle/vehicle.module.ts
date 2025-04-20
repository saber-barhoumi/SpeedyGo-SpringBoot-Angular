import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { VehicleFormComponent } from './vehicle-form/vehicle-form.component';
import { VehicleDetailComponent } from './vehicle-detail/vehicle-detail.component';

@NgModule({
  declarations: [
    VehicleListComponent,
    VehicleFormComponent,
    VehicleDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: VehicleListComponent },
      { path: 'add', component: VehicleFormComponent },
      { path: 'edit/:id', component: VehicleFormComponent },
      { path: ':id', component: VehicleDetailComponent }
    ])
  ],
  exports: [
    VehicleListComponent,
    VehicleFormComponent,
    VehicleDetailComponent
  ]
})
export class VehicleModule { }