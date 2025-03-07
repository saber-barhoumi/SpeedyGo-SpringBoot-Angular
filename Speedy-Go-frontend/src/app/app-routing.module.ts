import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
import { RecruitmentDetailComponent } from './FrontOffices/pages/recruitement/recruitment-detail/recruitment-detail.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { VehicleDetailComponent } from './FrontOffices/pages/vehicle/vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './FrontOffices/pages/vehicle/vehicle-form/vehicle-form.component';
import { VehicleListComponent } from './FrontOffices/pages/vehicle/vehicle-list/vehicle-list.component';
import { BodyComponent } from './FrontOffices/body/body.component';
import { RecruitmentManagementComponent } from './BackOffices/recruitment-management/recruitment-management.component';
import { RoleGuard } from './FrontOffices/guards/role.guard';
import { AllTemplateBackComponent } from './BackOffices/all-template-back/all-template-back.component';
import { AllTemplateFrontComponent } from './FrontOffices/all-template-front/all-template-front.component';
import { RecruitmentFormComponent } from './FrontOffices/pages/recruitement/recruitment-form/recruitment-form.component';

// Import Delivery, Partner, Customer Components
import { DeliveryComponent } from './FrontOffices/pages/delivery/delivery.component';
import { PartnerComponent } from './FrontOffices/pages/partner/partner.component';
import { CustomerComponent } from './FrontOffices/pages/customer/customer.component';

const routes: Routes = [
  {
    path: '',
    component: AllTemplateFrontComponent,
    //canActivate: [authGuard] // Remove authGuard from default route
  },
  {
    path: 'home',
    component: AllTemplateFrontComponent,
  },

  {
    path: 'admin',
    component: AllTemplateBackComponent, children: [
      { path: 'users', component: GestionUserComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'home', component: BodyBackComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'update-user/:id', component: UpdateUserComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'add-user', component: AddUserComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'recruitment', component: RecruitmentManagementComponent },
    ]
  },
  { path: 'loginAdmin', component: LoginComponent, },
  { path: 'login', component: LoginclientComponent }, // Use the new LoginclientComponent
  { path: 'register', component: RegisterComponent }, // Use the new RegisterComponent
  { path: 'registerAdmin', component: RegisterAdminComponent },
  // New vehicle routes
  { path: 'vehicles', component: VehicleListComponent },
  { path: 'vehicles/add', component: VehicleFormComponent },
  { path: 'vehicles/edit/:id', component: VehicleFormComponent },
  { path: 'vehicles/:id', component: VehicleDetailComponent },
  {
    path: 'recruitment', component: AllTemplateFrontComponent, canActivate: [authGuard, RoleGuard],
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
  },
    // New routes for delivery, partner and customer
    {
      path: 'delivery',
      component: DeliveryComponent,
      canActivate: [authGuard]
    },
    {
      path: 'partner',
      component: PartnerComponent,
      canActivate: [authGuard]
    },
    {
      path: 'customer',
      component: CustomerComponent,
      canActivate: [authGuard]
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }