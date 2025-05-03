import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { GoogleMapsModule } from '@angular/google-maps';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// Angular Material Modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Interceptors
import { JwtInterceptor } from './interceptors/jwt.interceptor';

// Services
import { ChatService } from './services/user/Chat/chat.service';
import { AuthService } from './FrontOffices/services/user/auth.service';

// Pipes
import { PriceFormatterPipe } from './pipes/price-formatter.pipe';

// App Root
import { AppComponent } from './app.component';

// Front Office Components
import { AllTemplateFrontComponent } from './FrontOffices/all-template-front/all-template-front.component';
import { FooterFrontComponent } from './FrontOffices/footer-front/footer-front.component';
import { HeaderFrontComponent } from './FrontOffices/header-front/header-front.component';
import { BodyComponent } from './FrontOffices/body/body.component';
import { LoginclientComponent } from './FrontOffices/login/login.component';
import { RegisterComponent } from './FrontOffices/register/register.component';
import { CustomerComponent } from './FrontOffices/pages/customer/customer.component';
import { DeliveryComponent } from './FrontOffices/pages/delivery/delivery.component';
import { PartnerComponent } from './FrontOffices/pages/partner/partner.component';
import { RecruitmentPageComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-page.component';
import { RecruitmentFormComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-form/recruitment-form.component';
import { RecruitmentDetailComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-detail/recruitment-detail.component';
import { CarpoolingComponent } from './FrontOffices/pages/delivery/carpooling/carpooling.component';
import { InternationalShippingComponent } from './FrontOffices/pages/customer/international-shipping/international-shipping.component';
import { UserProfileComponent } from './FrontOffices/pages/user-profile/user-profile.component';
import { FormReportComponent } from './FrontOffices/pages/customer/formreport/formreport.component';
import { ReturnFormComponent } from './FrontOffices/pages/customer/returnform/returnform.component';
import { AffichmapComponent } from './FrontOffices/pages/customer/affichmap/affichmap.component';
import { ChatbotComponent } from './FrontOffices/pages/chatbot/chatbot.component';
import { ChatButtonComponent } from './FrontOffices/pages/SpeedyChat/chat-button/chat-button.component';
import { ChatDialogComponent } from './FrontOffices/pages/components/chat-dialog/chat-dialog.component';
import { ChatComponent } from './FrontOffices/pages/chat/chat/chat.component';

// Vehicle
import { VehicleFormComponent } from './FrontOffices/pages/vehicle/vehicle-form/vehicle-form.component';
import { VehicleListComponent } from './FrontOffices/pages/vehicle/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './FrontOffices/pages/vehicle/vehicle-detail/vehicle-detail.component';

// Trips
import { TripFormComponent } from './FrontOffices/modules/trips/trip-form/trip-form.component';
import { TripListComponent } from './FrontOffices/modules/trips/trip-list/trip-list.component';
import { TripDetailComponent } from './FrontOffices/modules/trips/trip-detail/trip-detail.component';
import { TripEditDialogComponent } from './FrontOffices/modules/trips/trip-edit-dialog/trip-edit-dialog.component';
import { SpecificTripFormComponent } from './FrontOffices/modules/trips/specific-trip-form/specific-trip-form.component';
import { SpecificTripDetailComponent } from './FrontOffices/modules/trips/specific-trip-detail/specific-trip-detail.component';
import { TrakingComponent } from './FrontOffices/modules/trips/traking/traking.component';

// Store
import { AddOfferComponent } from './FrontOffices/modules/store/Component/add-offer/add-offer.component';
import { addstoreComponent } from './FrontOffices/modules/store/Component/add-store/add-store.component';
import { DiscountOfferComponent } from './FrontOffices/modules/store/Component/discount/discount.component';
import { StoreListComponent } from './FrontOffices/modules/store/store/store.component';
import { OffresComponent } from './FrontOffices/modules/store/offres/offres.component';
import { StoreFilterComponent } from './FrontOffices/modules/store/Component/store-filter/store-filter.component';

// Statistics
import { OffersByStoreChartComponent } from './FrontOffices/modules/statistique/statistique/components/offers-by-store-chart/offers-by-store-chart.component';
import { StatCardComponent } from './FrontOffices/modules/statistique/statistique/components/stat-card/stat-card.component';
import { StatDashboardComponent } from './FrontOffices/modules/statistique/statistique/components/stat-dashboard/stat-dashboard.component';

// Route Analyzer
import { TunisiaRouteAnalyzerComponent } from './FrontOffices/modules/tunisia-route/tunisia-route-analyzer.component';

// Back Office Components
import { AllTemplateBackComponent } from './BackOffices/all-template-back/all-template-back.component';
import { FooterBackComponent } from './BackOffices/footer-back/footer-back.component';
import { NavbarBackComponent } from './BackOffices/navbar-back/navbar-back.component';
import { SidebarBackComponent } from './BackOffices/sidebar-back/sidebar-back.component';
import { BodyBackComponent } from './BackOffices/body-back/body-back.component';
import { LoginComponent } from './BackOffices/login/login.component';
import { RegisterAdminComponent } from './BackOffices/register-admin/register-admin.component';
import { GestionUserComponent } from './BackOffices/gestion-user/gestion-user.component';
import { UpdateUserComponent } from './BackOffices/update-user/update-user.component';
import { AddUserComponent } from './BackOffices/add-user/add-user.component';
import { RecruitmentManagementComponent } from './BackOffices/recruitment-management/recruitment-management.component';
import { ListreportComponent } from './BackOffices/listreport/listreport.component';
import { ListreturnsComponent } from './BackOffices/listreturns/listreturns.component';
import { MapPointsRelaisComponent } from './BackOffices/map-points-relais/map-points-relais.component';
import { CarbonFootprintComponent } from './BackOffices/carbonfootprint/carbonfootprint.component';

// Misc
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { QrScannerComponent } from './qrscanner/qrscanner.component';
import { TimelineAllModule } from '@syncfusion/ej2-angular-layouts';
import { TimelineComponent } from './timeline/timeline.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { CartComponent } from './FrontOffices/cart/cart.component';

@NgModule({
  declarations: [
    AppComponent,
    AllTemplateFrontComponent,
    FooterFrontComponent,
    HeaderFrontComponent,
    BodyComponent,
    LoginclientComponent,
    RegisterComponent,
    CustomerComponent,
    DeliveryComponent,
    PartnerComponent,
    RecruitmentPageComponent,
    RecruitmentFormComponent,
    RecruitmentDetailComponent,
    CarpoolingComponent,
    InternationalShippingComponent,
    UserProfileComponent,
    FormReportComponent,
    ReturnFormComponent,
    AffichmapComponent,
    VehicleFormComponent,
    VehicleListComponent,
    VehicleDetailComponent,
    TripFormComponent,
    TripListComponent,
    TripDetailComponent,
    TripEditDialogComponent,
    SpecificTripFormComponent,
    SpecificTripDetailComponent,
    TrakingComponent,
    AddOfferComponent,
    addstoreComponent,
    DiscountOfferComponent,
    StoreListComponent,
    OffresComponent,
    TrackingComponent,
    TimelineComponent,
    TunisiaRouteAnalyzerComponent,
    AllTemplateBackComponent,
    FooterBackComponent,
    NavbarBackComponent,
    SidebarBackComponent,
    BodyBackComponent,
    LoginComponent,
    RegisterAdminComponent,
    GestionUserComponent,
    UpdateUserComponent,
    AddUserComponent,
    RecruitmentManagementComponent,
    ListreportComponent,
    ListreturnsComponent,
    MapPointsRelaisComponent,
    CarbonFootprintComponent,
    MyApplicationsComponent,
    QrScannerComponent,
    ChatbotComponent,
    ChatButtonComponent,
    ChatDialogComponent,
    ChatComponent,
    PriceFormatterPipe,
    CartComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    GoogleMapsModule,
    ZXingScannerModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    StoreFilterComponent,
    TimelineAllModule,
    FontAwesomeModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  providers: [
    ChatService,
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
