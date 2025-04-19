import { NgModule } from '@angular/core';

import { MatDialogModule } from '@angular/material/dialog';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AllTemplateFrontComponent } from './FrontOffices/all-template-front/all-template-front.component';
import { FooterFrontComponent } from './FrontOffices/footer-front/footer-front.component';
import { HeaderFrontComponent } from './FrontOffices/header-front/header-front.component';
import { BodyComponent } from './FrontOffices/body/body.component';
import { AllTemplateBackComponent } from './BackOffices/all-template-back/all-template-back.component';
import { FooterBackComponent } from './BackOffices/footer-back/footer-back.component';
import { NavbarBackComponent } from './BackOffices/navbar-back/navbar-back.component';
import { SidebarBackComponent } from './BackOffices/sidebar-back/sidebar-back.component';
import { BodyBackComponent } from './BackOffices/body-back/body-back.component';
import { LoginComponent } from './BackOffices/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'; // Update this line
import { LoginclientComponent } from './FrontOffices/login/login.component';
import { RegisterComponent } from './FrontOffices/register/register.component';
import { RegisterAdminComponent } from './BackOffices/register-admin/register-admin.component';
import { GestionUserComponent } from './BackOffices/gestion-user/gestion-user.component';
import { UpdateUserComponent } from './BackOffices/update-user/update-user.component';
import { AddUserComponent } from './BackOffices/add-user/add-user.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { RecruitmentFormComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-form/recruitment-form.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { RecruitmentDetailComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-detail/recruitment-detail.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RecruitmentManagementComponent } from './BackOffices/recruitment-management/recruitment-management.component';
import { CustomerComponent } from './FrontOffices/pages/customer/customer.component';
import { DeliveryComponent } from './FrontOffices/pages/delivery/delivery.component';
import { PartnerComponent } from './FrontOffices/pages/partner/partner.component';
import { RecruitmentPageComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-page.component';
import { CarpoolingComponent } from './FrontOffices/pages/delivery/carpooling/carpooling.component';
import { InternationalShippingComponent } from './FrontOffices/pages/customer/international-shipping/international-shipping.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserProfileComponent } from './FrontOffices/pages/user-profile/user-profile.component';
import { VehicleModule } from './FrontOffices/pages/vehicle/vehicle.module';
import { OffersByStoreChartComponent } from './FrontOffices/modules/statistique/statistique/components/offers-by-store-chart/offers-by-store-chart.component';
import { StatCardComponent } from './FrontOffices/modules/statistique/statistique/components/stat-card/stat-card.component';
import { StatDashboardComponent } from './FrontOffices/modules/statistique/statistique/components/stat-dashboard/stat-dashboard.component';
import { AddOfferComponent } from './FrontOffices/modules/store/Component/add-offer/add-offer.component';
import { TripFormComponent } from './FrontOffices/modules/trips/trip-form/trip-form.component';
import { TripListComponent } from './FrontOffices/modules/trips/trip-list/trip-list.component';
import { TripDetailComponent } from './FrontOffices/modules/trips/trip-detail/trip-detail.component';
import { TripEditDialogComponent } from './FrontOffices/modules/trips/trip-edit-dialog/trip-edit-dialog.component';
import { SpecificTripDetailComponent } from './FrontOffices/modules/trips/specific-trip-detail/specific-trip-detail.component';
import { SpecificTripFormComponent } from './FrontOffices/modules/trips/specific-trip-form/specific-trip-form.component';

import { addstoreComponent } from './FrontOffices/modules/store/Component/add-store/add-store.component';
import {  DiscountOfferComponent } from './FrontOffices/modules/store/Component/discount/discount.component';
import { OffresComponent } from './FrontOffices/modules/store/offres/offres.component';
import { StoreListComponent } from "./FrontOffices/modules/store/store/store.component";
import { StoreFilterComponent } from './FrontOffices/modules/store/Component/store-filter/store-filter.component';



@NgModule({
  declarations: [
    AppComponent,
    AllTemplateFrontComponent,
    FooterFrontComponent,
    HeaderFrontComponent,
    BodyComponent,
    AllTemplateBackComponent,
    FooterBackComponent,
    NavbarBackComponent,
    SidebarBackComponent,
    BodyBackComponent,
    LoginComponent,
    LoginclientComponent,
    RegisterComponent,
    RegisterAdminComponent,
    GestionUserComponent,
    UpdateUserComponent,
    AddUserComponent,
    RecruitmentFormComponent,
    MyApplicationsComponent,
    RecruitmentDetailComponent,
    RecruitmentManagementComponent,
    CarpoolingComponent,
    CustomerComponent,
    DeliveryComponent,
    PartnerComponent,
    RecruitmentPageComponent,
    InternationalShippingComponent,
    UserProfileComponent,
    TripFormComponent,
    TripListComponent,
    TripDetailComponent,
    TripEditDialogComponent,
    SpecificTripFormComponent ,
    SpecificTripDetailComponent,
    StoreListComponent,
    OffresComponent,
    DiscountOfferComponent,
    addstoreComponent,
    AddOfferComponent,
    AddOfferComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    FormsModule,
    MatDialogModule,
    HttpClientModule,
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    BrowserAnimationsModule,
    
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    VehicleModule,
    GoogleMapsModule
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }, // Now this will work
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }