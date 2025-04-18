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
import { RecruitmentFormComponent } from './recruitment-form/recruitment-form.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { RecruitmentDetailComponent } from './recruitment-detail/recruitment-detail.component';
import { VehicleDetailComponent } from './vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './vehicle-form/vehicle-form.component';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { BodyComponent } from './FrontOffices/body/body.component';
import { RecruitmentManagementComponent } from './BackOffices/recruitment-management/recruitment-management.component';
import { RoleGuard } from './FrontOffices/guards/role.guard';

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
      { path: 'add-user', component: AddUserComponent ,canActivate: [BackofficeAuthGuard]},
      { path: 'recruitment', component: RecruitmentManagementComponent },  


  ] },
  {path: 'loginAdmin', component:LoginComponent,},
  {path: 'login', component:LoginclientComponent},
  {path: 'register', component:RegisterComponent},
  {path: 'registerAdmin', component:RegisterAdminComponent},
    // New vehicle routes
    { path: 'vehicles', component: VehicleListComponent },
    { path: 'vehicles/add', component: VehicleFormComponent },
    { path: 'vehicles/edit/:id', component: VehicleFormComponent },
    { path: 'vehicles/:id', component: VehicleDetailComponent },
  {
    path: 'recruitment',component: AllTemplateFrontComponent, canActivate: [authGuard, RoleGuard],
    data: { allowedRoles: ['DELEVERY', 'DELIVERY', 'ADMIN'] },
    children: [
      {
        path: 'home',
        component: BodyComponent,
      },
      {
        
        path: 'apply',
        component: RecruitmentFormComponent,
       
        data: { title: 'Apply for Delivery Driver Position' }
      },
      {
        path: 'edit/:id',
        component: RecruitmentFormComponent,
        data: { title: 'Edit Application' }
      },
      {
        path: 'my-applications',
        component: MyApplicationsComponent,
      
        data: { title: 'My Applications' }
      },
      {
        path: 'view/:id',
        component: RecruitmentDetailComponent,
  
        data: { title: 'Application Details' }
      },
      {
        path: '',
        redirectTo: 'my-applications',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
