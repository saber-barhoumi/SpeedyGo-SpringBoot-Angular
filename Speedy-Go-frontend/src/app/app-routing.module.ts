import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AllTemplateFrontComponent } from './FrontOffices/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffices/all-template-back/all-template-back.component'; // Ajout de l'importation
import { LoginComponent } from './BackOffices/login/login.component';
import { LoginclientComponent } from './FrontOffices/login/login.component';
import { authGuard } from './FrontOffices/guards/auth.guard';
import { RegisterComponent } from './FrontOffices/register/register.component';
import { RegisterAdminComponent } from './BackOffices/register-admin/register-admin.component';
import { GestionUserComponent } from './BackOffices/gestion-user/gestion-user.component';
import { BodyBackComponent } from './BackOffices/body-back/body-back.component';
import { UpdateUserComponent } from './BackOffices/update-user/update-user.component';
import { AddUserComponent } from './BackOffices/add-user/add-user.component';
import { BackofficeAuthGuard } from './backoffice-auth.guard';
import { DeliveryComponent } from './FrontOffices/pages/delivery/delivery.component'; 
import { PartnerComponent } from './FrontOffices/pages/partner/partner.component'; 
import { CustomerComponent } from './FrontOffices/pages/customer/customer.component';   


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: AllTemplateFrontComponent },
  { path: 'login', component: LoginclientComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'loginAdmin', component: LoginComponent },
  { path: 'registerAdmin', component: RegisterAdminComponent },

  {
    path: 'delivery',
    component: DeliveryComponent,
    canActivate: [authGuard],


  },
  {
    path: 'partner',
    component: PartnerComponent,
    canActivate: [authGuard],

  },
  {
    path: 'customer',
    component: CustomerComponent,
    canActivate: [authGuard],

  },
  {
    path: 'admin',
    component: AllTemplateBackComponent,
    canActivate: [BackofficeAuthGuard],
    children: [
      { path: 'users', component: GestionUserComponent },
      { path: 'home', component: BodyBackComponent },
      { path: 'update-user/:id', component: UpdateUserComponent },
      { path: 'add-user', component: AddUserComponent }
    ]
  },
  { path: 'loginAdmin', component: LoginComponent },
  { path: 'login', component: LoginclientComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'registerAdmin', component: RegisterAdminComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
