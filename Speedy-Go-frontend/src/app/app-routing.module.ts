// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from 'src/app/FrontOffices/cart/cart.component'; // Adjust path
import { PaidParcelsComponent } from './FrontOffices/paid-parcels/paid-parcels.component';
import { AllPaidParcelsComponent } from './FrontOffices/all-paid-parcels/all-paid-parcels.component';


// Import Components
import { LoginComponent } from './BackOffices/login/login.component';
import { LoginClientComponent } from './FrontOffices/login/login.component';
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
import { TrackingComponent } from './pages/tracking/tracking.component';
import { AffichePaymentComponent } from 'src/app/BackOffices/affiche-payment/affiche-payment/affiche-payment.component';
import { EditPaymentComponent } from 'src/app/BackOffices/affiche-payment/edit-payment/edit-payment.component';

// Import Delivery, Partner, Customer Components
import { DeliveryComponent } from './FrontOffices/pages/delivery/delivery.component';
import { PartnerComponent } from './FrontOffices/pages/partner/partner.component';
import { CustomerComponent } from './FrontOffices/pages/customer/customer.component';

// Import Carpooling Component
import { CarpoolingComponent } from './FrontOffices/pages/delivery/carpooling/carpooling.component'; // Import CarpoolingComponent

// Import InternationalShippingComponent
import { InternationalShippingComponent as FrontOfficeInternationalShippingComponent } from './FrontOffices/pages/customer/international-shipping/international-shipping.component';
import { ChatbotComponent } from './FrontOffices/pages/chatbot/chatbot.component';
import { ResetPasswordComponent } from './FrontOffices/pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './FrontOffices/pages/forgot-password/forgot-password.component';
import { InternationalShippingBackComponent } from './BackOffices/pages-back/Delivery/international-shipping-back/international-shipping-back';

import { FormReportComponent } from './FrontOffices/pages/customer/formreport/formreport.component';
import { ListreportComponent } from './BackOffices/listreport/listreport.component';
import { ReturnFormComponent } from './FrontOffices/pages/customer/returnform/returnform.component';
import { ListreturnsComponent } from './BackOffices/listreturns/listreturns.component';
import { MapPointsRelaisComponent } from './BackOffices/map-points-relais/map-points-relais.component';
import { QrScannerComponent } from './qrscanner/qrscanner.component';
import { AffichmapComponent } from './FrontOffices/pages/customer/affichmap/affichmap.component';
import { CarbonFootprintComponent } from './BackOffices/carbonfootprint/carbonfootprint.component';
// Add these imports
import { CarpoolingCustomerComponent } from './FrontOffices/pages/customer/carpooling/carpooling-customer/carpooling-customer.component';
import { ServiceListComponent } from './FrontOffices/pages/customer/international-shipping/service-list/service-list.component';
import { ShippingOrderComponent } from './FrontOffices/pages/customer/international-shipping/shipping-order/shipping-order.component';
import { MyOrdersComponent } from './FrontOffices/pages/customer/international-shipping/my-orders/my-orders.component';





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


import { TunisiaRouteAnalyzerComponent } from './FrontOffices/modules/tunisia-route/tunisia-route-analyzer.component';
import { TrakingComponent } from './FrontOffices/modules/trips/traking/traking.component';
import { LivraisonListComponent } from '../app/FrontOffices/pages/delivery/livraison/livraison-management/livraison-list/livraison-list.component';
import { LivraisonFormComponent } from '../app/FrontOffices/pages/delivery/livraison/livraison-management/livraison-form/livraison-form.component';
import { LivraisonViewComponent } from '../app/FrontOffices/pages/delivery/livraison/livraison-management/livraison-view/livraison-view.component';





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
 

   


  { path: 'qrscanner', component:QrScannerComponent},


  {
    path: 'admin',
    component: AllTemplateBackComponent,
    children: [
      { path: 'users', component: GestionUserComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'home', component: BodyBackComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'update-user/:id', component: UpdateUserComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'add-user', component: AddUserComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'recruitment', component: RecruitmentManagementComponent },
      { path: 'reportlist', component: ListreportComponent},
      { path: 'maprelais', component:MapPointsRelaisComponent},
      { path: 'returnlist', component:ListreturnsComponent},
      { path: 'carbon', component:CarbonFootprintComponent},
      { path: 'statistique', loadChildren: () => import('./FrontOffices/modules/statistique/statistique/statistique.module').then(m => m.StatistiqueModule), canActivate: [BackofficeAuthGuard] },
      { path: 'trip-dashboard', loadChildren: () => import('./FrontOffices/modules/dashboard/dashboard.module').then(m => m.DashboardModule) } ,// New Trip Dashboard route
      { path: 'international-shipping', component: InternationalShippingBackComponent },
      { path: 'carpooling', component: CarpoolingComponent, canActivate: [BackofficeAuthGuard] },
      { path: 'affiche_payment', component: AffichePaymentComponent, canActivate: [authGuard], data: { roles: ['ROLE_ADMIN'] } },
      { path: 'edit-payment/:id', component: EditPaymentComponent, canActivate: [authGuard] }




      

    ]
  },
  { path: 'loginadmin', component: LoginComponent, },
  { path: 'login', component: LoginClientComponent }, // Use the new LoginclientComponent
  { path: 'register', component: RegisterComponent }, // Use the new RegisterComponent
  { path: 'registerAdmin', component: RegisterAdminComponent },
  // New vehicle routes
  { path: 'vehicles', component: VehicleListComponent },
  { path: 'vehicles/add', component: VehicleFormComponent },
  { path: 'vehicles/edit/:id', component: VehicleFormComponent },
  { path: 'vehicles/:id', component: VehicleDetailComponent },

  {
    path: 'livraison-management',
    children: [
      { path: '', component: LivraisonListComponent },
      { path: 'create', component: LivraisonFormComponent },
      { path: 'edit/:id', component: LivraisonFormComponent },
      { path: 'view/:id', component: LivraisonViewComponent }
    ]
  },


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
      children: [
        { path: 'report', component: FormReportComponent },
        { path: 'returnform', component: ReturnFormComponent },
        { path: 'affichmap', component:AffichmapComponent},


      ]
    },
    
    // Add InternationalShippingComponent route
    


    {
      path: 'tunisia-route',
      component: TunisiaRouteAnalyzerComponent,
     },
     {
      path: 'tracking',
      component: TrakingComponent,
     },








    {
      path: 'statistique',
      loadChildren: () => import('./FrontOffices/modules/statistique/statistique/statistique.module').then(m => m.StatistiqueModule)
     },

    {
      path: 'fidelite',
      loadChildren: () => import('./FrontOffices/modules/cartes-fidelite/cartes-fidelite.module').then(m => m.CartesFideliteModule)
     }, 









    {
      path: 'SpeedyChat',
      component: ChatbotComponent,
      // You can add canActivate guards here if needed
    },
    {
      path: 'customer/carpooling',
      component: CarpoolingCustomerComponent,
      canActivate: [authGuard, RoleGuard],
    },

    {
      path: 'customer/international-shipping',
      component: FrontOfficeInternationalShippingComponent, // Use the FrontOffice component
      // You can add canActivate guards here if needed
    },
    {
      path: 'customer/international-shipping',


      component: FrontOfficeInternationalShippingComponent,
      canActivate: [authGuard, RoleGuard],
      data: { allowedRoles: ['CUSTOMER','DELEVERY', 'DELIVERY', 'ADMIN'] },
      children: [
        {
          path: '',
          redirectTo: 'services',
          pathMatch: 'full'
        },
        {
          path: 'services',
          component: ServiceListComponent,
          canActivate: [authGuard]
        },
        {
          path: 'shipping-order',
          component: ShippingOrderComponent,
          canActivate: [authGuard]
        },
        {
          path: 'shipping-order/:id',
          component: ShippingOrderComponent,
          canActivate: [authGuard]
        },
        {
          path: 'my-orders',
          component: MyOrdersComponent, // Replace with your actual component 
          canActivate: [authGuard]
        },
        {
          path: 'service-details/:id',
          // You might want to create a service details component
          component: ServiceListComponent, // Placeholder, replace with actual details component
          canActivate: [authGuard]
        }
      ]
    },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },


///////////////////////

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
  path: 'partner',
  component: StoreListComponent,
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
 { path: 'tracking/:parcelId', component: TrackingComponent },
  { path: 'smart-route', loadChildren: () => import('./pages/smart-route/smart-route.module').then(m => m.SmartRouteModule) },
  { path: 'cart', component: CartComponent },

  { path: 'customer/paid-parcels', component: PaidParcelsComponent },


  { path: 'all-paid-parcels', component: AllPaidParcelsComponent }















];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
