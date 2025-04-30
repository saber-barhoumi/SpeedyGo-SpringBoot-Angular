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
import { VehicleFormComponent } from './FrontOffices/pages/vehicle/vehicle-form/vehicle-form.component';
import { VehicleListComponent } from './FrontOffices/pages/vehicle/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './FrontOffices/pages/vehicle/vehicle-detail/vehicle-detail.component';
import { RecruitmentManagementComponent } from './BackOffices/recruitment-management/recruitment-management.component';
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Importer MatSnackBarModule


// Import CustomerComponent (and other missing components)
import { CustomerComponent } from './FrontOffices/pages/customer/customer.component';
import { DeliveryComponent } from './FrontOffices/pages/delivery/delivery.component';
import { PartnerComponent } from './FrontOffices/pages/partner/partner.component';
import { RecruitmentPageComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-page.component';
import { CarpoolingComponent } from './FrontOffices/pages/delivery/carpooling/carpooling.component';
import { InternationalShippingComponent } from './FrontOffices/pages/customer/international-shipping/international-shipping.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserProfileComponent } from './FrontOffices/pages/user-profile/user-profile.component';
<<<<<<< HEAD
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


import { TunisiaRouteAnalyzerComponent } from './FrontOffices/modules/tunisia-route/tunisia-route-analyzer.component';
import { TrakingComponent } from './FrontOffices/modules/trips/traking/traking.component';


=======
import { FormReportComponent } from './FrontOffices/pages/customer/formreport/formreport.component';
import { ListreportComponent } from './BackOffices/listreport/listreport.component';
import { ReturnFormComponent } from './FrontOffices/pages/customer/returnform/returnform.component';
import { ListreturnsComponent } from './BackOffices/listreturns/listreturns.component';
import { MapPointsRelaisComponent } from './BackOffices/map-points-relais/map-points-relais.component';
import { QrScannerComponent } from './qrscanner/qrscanner.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AffichmapComponent } from './FrontOffices/pages/customer/affichmap/affichmap.component';
import { CarbonFootprintComponent } from './BackOffices/carbonfootprint/carbonfootprint.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';



import { ChatbotComponent } from './FrontOffices/pages/chatbot/chatbot.component';
import { ChatButtonComponent } from './FrontOffices/pages/SpeedyChat/chat-button/chat-button.component';
import { ChatDialogComponent } from './FrontOffices/pages/components/chat-dialog/chat-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { DeliveryVehicle} from 'src/app/models/vehicle.model'

// Components and Services
import { ChatComponent } from './FrontOffices/pages/chat/chat/chat.component';
import { ChatService } from './services/user/Chat/chat.service';
import { AuthService } from './FrontOffices/services/user/auth.service';
// Import FontAwesomeModule
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PriceFormatterPipe } from './pipes/price-formatter.pipe';
>>>>>>> 85f04647e497d007b768b34df8b8b6f4314aaffa

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
<<<<<<< HEAD
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
    AddOfferComponent,
    TunisiaRouteAnalyzerComponent,
    TrakingComponent,
=======
    FormReportComponent,
    ListreportComponent,
    ReturnFormComponent,
    ListreturnsComponent,
    MapPointsRelaisComponent,
    QrScannerComponent,
    AffichmapComponent,
    CarbonFootprintComponent,
    VehicleFormComponent,
    VehicleListComponent,
    VehicleDetailComponent,






    ChatbotComponent,
    ChatButtonComponent,
    ChatDialogComponent,
    ChatComponent,
    PriceFormatterPipe

>>>>>>> 85f04647e497d007b768b34df8b8b6f4314aaffa
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
    ZXingScannerModule,
    BrowserAnimationsModule,
<<<<<<< HEAD
  
    GoogleMapsModule,
    
=======
    
    MatDialogModule,
    FontAwesomeModule, // Add FontAwesomeModule here
    MatButtonModule,    // Add material modules
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatSnackBarModule,
>>>>>>> 85f04647e497d007b768b34df8b8b6f4314aaffa
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
<<<<<<< HEAD
    VehicleModule,
    GoogleMapsModule
    
=======


    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),




    BrowserAnimationsModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,


>>>>>>> 85f04647e497d007b768b34df8b8b6f4314aaffa
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    ChatService,  // Fixed position of ChatService
    AuthService,   // Added AuthService
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
