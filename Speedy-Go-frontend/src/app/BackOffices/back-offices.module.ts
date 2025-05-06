// src/app/BackOffices/back-offices.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterAdminComponent } from './register-admin/register-admin.component';

@NgModule({
  declarations: [
    RegisterAdminComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    RegisterAdminComponent
  ]
})
export class BackOfficesModule { }