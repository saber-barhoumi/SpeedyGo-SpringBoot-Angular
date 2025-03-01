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

const routes: Routes = [
  {
    path: '',
    component: AllTemplateFrontComponent,
    canActivate: [authGuard]
  },
  {
    path: 'home',
    component: AllTemplateFrontComponent,
  },
  
  {
    path: 'admin',
    component: AllTemplateBackComponent, children: [
      { path: 'users', component: GestionUserComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'home',component:BodyBackComponent,canActivate: [BackofficeAuthGuard]} ,
      { path: 'update-user/:id', component: UpdateUserComponent,canActivate: [BackofficeAuthGuard] },
      { path: 'add-user', component: AddUserComponent ,canActivate: [BackofficeAuthGuard]}  // Route to AddUserComponent


  ] },
  {path: 'loginAdmin', component:LoginComponent,},
  {path: 'login', component:LoginclientComponent},
  {path: 'register', component:RegisterComponent},
  {path: 'registerAdmin', component:RegisterAdminComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
