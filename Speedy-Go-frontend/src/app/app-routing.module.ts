// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import Components
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
import { RecruitmentDetailComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-detail/recruitment-detail.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { VehicleDetailComponent } from './FrontOffices/pages/vehicle/vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './FrontOffices/pages/vehicle/vehicle-form/vehicle-form.component';
import { VehicleListComponent } from './FrontOffices/pages/vehicle/vehicle-list/vehicle-list.component';
import { BodyComponent } from './FrontOffices/body/body.component';
import { RecruitmentManagementComponent } from './BackOffices/recruitment-management/recruitment-management.component';
import { RoleGuard } from './FrontOffices/guards/role.guard';
import { AllTemplateBackComponent } from './BackOffices/all-template-back/all-template-back.component';
import { AllTemplateFrontComponent } from './FrontOffices/all-template-front/all-template-front.component';
import { RecruitmentFormComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-form/recruitment-form.component';

// Import Delivery, Partner, Customer Components
import { DeliveryComponent } from './FrontOffices/pages/delivery/delivery.component';
import { PartnerComponent } from './FrontOffices/pages/partner/partner.component';
import { CustomerComponent } from './FrontOffices/pages/customer/customer.component';

// Import Carpooling Component
import { CarpoolingComponent } from './FrontOffices/pages/delivery/carpooling/carpooling.component'; // Import CarpoolingComponent

// Import InternationalShippingComponent
import { InternationalShippingComponent } from './FrontOffices/pages/customer/international-shipping/international-shipping.component'; 
import { TripListComponent } from './FrontOffices/modules/trips/trip-list/trip-list.component';
import { TripDetailComponent } from './FrontOffices/modules/trips/trip-detail/trip-detail.component';
import { TripFormComponent } from './FrontOffices/modules/trips/trip-form/trip-form.component';
import { SpecificTripDetailComponent } from './FrontOffices/modules/trips/specific-trip-detail/specific-trip-detail.component';
import { SpecificTripFormComponent } from './FrontOffices/modules/trips/specific-trip-form/specific-trip-form.component';

import { AddOfferComponent } from './FrontOffices/modules/store/Component/add-offer/add-offer.component';
import { StoreListComponent } from './FrontOffices/modules/store/store/store.component';
import { DiscountOfferComponent } from './FrontOffices/modules/store/Component/discount/discount.component';
import { OffresComponent } from './FrontOffices/modules/store/offres/offres.component';
import { addstoreComponent } from './FrontOffices/modules/store/Component/add-store/add-store.component'; 






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
    path: 'trips',
    component: TripListComponent,
   },

   {
    path: 'tripdetail/:id',
    component: TripDetailComponent,
   },
   {
    path: 'ajout_trip',
    component: TripFormComponent,
   },  

   {
    path: 'specific-trip-detail/:id',
    component: SpecificTripDetailComponent,
   }, 


   {
    path: 'spesific_trip',
    component: SpecificTripFormComponent,
   },


   {
    path: 'storlist',
    component: StoreListComponent,
   },

   {
    path: 'offres/:id',
    component: OffresComponent,
   },

 {
    path: 'add-offer',
    component: AddOfferComponent,
   },
   {
    path: 'add-store',
    component: addstoreComponent,
   },
   {
    path: 'edit-store/:id',
    component: addstoreComponent,
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
    path: 'recruitment',
    canActivate: [authGuard, RoleGuard],
    data: { allowedRoles: ['DELEVERY', 'DELIVERY', 'ADMIN'] },
    children: [
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
        redirectTo: 'apply',
        pathMatch: 'full'
      }
    ]
  },
    // New routes for delivery, partner and customer
    {
      path: 'delivery',
      component: DeliveryComponent,
      canActivate: [authGuard, RoleGuard],
      data: { allowedRoles: ['DELEVERY', 'DELIVERY', 'ADMIN'] }},
    {
      path: 'partner',
      component: PartnerComponent,
      canActivate: [authGuard, RoleGuard],
    },
    {
      path: 'customer',
      component: CustomerComponent,
      canActivate: [authGuard, RoleGuard],
    },
    {
      path: 'carpooling',
      component: CarpoolingComponent,
      canActivate: [authGuard, RoleGuard],
      data: { allowedRoles: ['DELEVERY', 'DELIVERY', 'ADMIN'] }
    },
    // Add InternationalShippingComponent route
    {
      path: 'international-shipping',
      component: InternationalShippingComponent,
      // You can add canActivate guards here if needed
    },  









    {
      path: 'statistique',
      loadChildren: () => import('./FrontOffices/modules/statistique/statistique/statistique.module').then(m => m.StatistiqueModule)
     },

    {
      path: 'fidelite',
      loadChildren: () => import('./FrontOffices/modules/cartes-fidelite/cartes-fidelite.module').then(m => m.CartesFideliteModule)
     }, 

    


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }