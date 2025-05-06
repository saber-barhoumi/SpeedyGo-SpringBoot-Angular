import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { WebcamModule } from 'ngx-webcam';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { GoogleMapsModule } from '@angular/google-maps';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BackOfficesModule } from './BackOffices/back-offices.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { QrScannerComponent } from './qrscanner/qrscanner.component';
import { HeaderFrontComponent } from './FrontOffices/header-front/header-front.component';
import { FooterFrontComponent } from './FrontOffices/footer-front/footer-front.component';
import { AllTemplateFrontComponent } from './FrontOffices/all-template-front/all-template-front.component';
import { BodyComponent } from './FrontOffices/body/body.component';
import { LoginClientComponent } from './FrontOffices/login/login.component';
import { RegisterComponent } from './FrontOffices/register/register.component';
import { CustomerComponent } from './FrontOffices/pages/customer/customer.component';
import { DeliveryComponent } from './FrontOffices/pages/delivery/delivery.component';
import { PartnerComponent } from './FrontOffices/pages/partner/partner.component';
import { RecruitmentPageComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-page.component';
import { RecruitmentFormComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-form/recruitment-form.component';
import { RecruitmentDetailComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-detail/recruitment-detail.component';
import { CarpoolingComponent } from './FrontOffices/pages/delivery/carpooling/carpooling.component';
import { CarpoolingCustomerComponent } from './FrontOffices/pages/customer/carpooling/carpooling-customer/carpooling-customer.component';
import { InternationalShippingComponent } from './FrontOffices/pages/customer/international-shipping/international-shipping.component';
import { ServiceListComponent } from './FrontOffices/pages/customer/international-shipping/service-list/service-list.component';
import { ShippingOrderComponent } from './FrontOffices/pages/customer/international-shipping/shipping-order/shipping-order.component';
import { MyOrdersComponent } from './FrontOffices/pages/customer/international-shipping/my-orders/my-orders.component';
import { UserProfileComponent } from './FrontOffices/pages/user-profile/user-profile.component';
import { FormReportComponent } from './FrontOffices/pages/customer/formreport/formreport.component';
import { ReturnFormComponent } from './FrontOffices/pages/customer/returnform/returnform.component';
import { AffichmapComponent } from './FrontOffices/pages/customer/affichmap/affichmap.component';
import { ChatbotComponent } from './FrontOffices/pages/chatbot/chatbot.component';
import { ChatButtonComponent } from './FrontOffices/pages/SpeedyChat/chat-button/chat-button.component';
import { ChatDialogComponent } from './FrontOffices/pages/components/chat-dialog/chat-dialog.component';
import { ChatComponent } from './FrontOffices/pages/chat/chat/chat.component';
import { ForgotPasswordComponent } from './FrontOffices/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './FrontOffices/pages/reset-password/reset-password.component';
import { VehicleFormComponent } from './FrontOffices/pages/vehicle/vehicle-form/vehicle-form.component';
import { VehicleListComponent } from './FrontOffices/pages/vehicle/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './FrontOffices/pages/vehicle/vehicle-detail/vehicle-detail.component';
import { LivraisonListComponent } from '../app/FrontOffices/pages/delivery/livraison/livraison-management/livraison-list/livraison-list.component';
import { LivraisonFormComponent } from './FrontOffices/pages/delivery/livraison/livraison-management/livraison-form/livraison-form.component';
import { AiVehicleSuggestionDialogComponent } from '../app/FrontOffices/pages/delivery/livraison/livraison-management/ai-vehicle-suggestion-dialog/ai-vehicle-suggestion-dialog.component';
import { LivraisonViewComponent } from '../app/FrontOffices/pages/delivery/livraison/livraison-management/livraison-view/livraison-view.component';
import { TripFormComponent } from './FrontOffices/modules/trips/trip-form/trip-form.component';
import { TripListComponent } from './FrontOffices/modules/trips/trip-list/trip-list.component';
import { TripDetailComponent } from './FrontOffices/modules/trips/trip-detail/trip-detail.component';
import { TripEditDialogComponent } from './FrontOffices/modules/trips/trip-edit-dialog/trip-edit-dialog.component';
import { SpecificTripFormComponent } from './FrontOffices/modules/trips/specific-trip-form/specific-trip-form.component';
import { SpecificTripDetailComponent } from './FrontOffices/modules/trips/specific-trip-detail/specific-trip-detail.component';
import { TrakingComponent } from './FrontOffices/modules/trips/traking/traking.component';
import { AddOfferComponent } from './FrontOffices/modules/store/Component/add-offer/add-offer.component';
import { addstoreComponent } from './FrontOffices/modules/store/Component/add-store/add-store.component';
import { DiscountOfferComponent } from './FrontOffices/modules/store/Component/discount/discount.component';
import { StoreListComponent } from './FrontOffices/modules/store/store/store.component';
import { OffresComponent } from './FrontOffices/modules/store/offres/offres.component';
import { StoreFilterComponent } from './FrontOffices/modules/store/Component/store-filter/store-filter.component';
import { TunisiaRouteAnalyzerComponent } from './FrontOffices/modules/tunisia-route/tunisia-route-analyzer.component';
import { AllTemplateBackComponent } from './BackOffices/all-template-back/all-template-back.component';
import { FooterBackComponent } from './BackOffices/footer-back/footer-back.component';
import { NavbarBackComponent } from './BackOffices/navbar-back/navbar-back.component';
import { SidebarBackComponent } from './BackOffices/sidebar-back/sidebar-back.component';
import { BodyBackComponent } from './BackOffices/body-back/body-back.component';
import { LoginComponent } from './BackOffices/login/login.component';
import { GestionUserComponent } from './BackOffices/gestion-user/gestion-user.component';
import { UpdateUserComponent } from './BackOffices/update-user/update-user.component';
import { AddUserComponent } from './BackOffices/add-user/add-user.component';
import { RecruitmentManagementComponent } from './BackOffices/recruitment-management/recruitment-management.component';
import { ListreportComponent } from './BackOffices/listreport/listreport.component';
import { ListreturnsComponent } from './BackOffices/listreturns/listreturns.component';
import { MapPointsRelaisComponent } from './BackOffices/map-points-relais/map-points-relais.component';
import { CarbonFootprintComponent } from './BackOffices/carbonfootprint/carbonfootprint.component';
import { AffichePaymentComponent } from './BackOffices/affiche-payment/affiche-payment/affiche-payment.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { EditPaymentComponent } from './BackOffices/affiche-payment/edit-payment/edit-payment.component';
import { AllPaidParcelsComponent } from './FrontOffices/all-paid-parcels/all-paid-parcels.component';
import { CartComponent } from './FrontOffices/cart/cart.component';
import { PaidParcelsComponent } from './FrontOffices/paid-parcels/paid-parcels.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { TimelineComponent } from './timeline/timeline.component';
import { PdfService } from './FrontOffices/services/pdf/pdf.service';
import { ImageAnalysisService } from './FrontOffices/services/image-analysis/image-analysis.service';
import { RecommendationService } from './FrontOffices/services/recommendation/recommendation.service';
import { ChatService } from './services/user/Chat/chat.service';
import { AuthService } from './FrontOffices/services/user/auth.service';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { CarpoolingService } from './services/delivery/carpooling/carpooling.service';
import { DeliveryService } from './services/delivery/international-shipping/delivery.service';
import { LivraisonService } from 'src/app/services/livraison.service';
import { PriceFormatterPipe } from './pipes/price-formatter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    QrScannerComponent,
    HeaderFrontComponent,
    AllTemplateFrontComponent,
    FooterFrontComponent,
    BodyComponent,
    LoginClientComponent,
    RegisterComponent,
    CustomerComponent,
    DeliveryComponent,
    PartnerComponent,
    RecruitmentPageComponent,
    RecruitmentFormComponent,
    RecruitmentDetailComponent,
    CarpoolingCustomerComponent,
    ShippingOrderComponent,
    UserProfileComponent,
    FormReportComponent,
    ReturnFormComponent,
    AffichmapComponent,
    ChatbotComponent,
    ChatButtonComponent,
    ChatDialogComponent,
    ChatComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    VehicleFormComponent,
    VehicleListComponent,
    VehicleDetailComponent,
    LivraisonListComponent,
    LivraisonFormComponent,
    LivraisonViewComponent,
    AiVehicleSuggestionDialogComponent,
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
    TunisiaRouteAnalyzerComponent,
    AllTemplateBackComponent,
    FooterBackComponent,
    NavbarBackComponent,
    SidebarBackComponent,
    BodyBackComponent,
    LoginComponent,
    GestionUserComponent,
    UpdateUserComponent,
    AddUserComponent,
    RecruitmentManagementComponent,
    ListreportComponent,
    ListreturnsComponent,
    MapPointsRelaisComponent,
    CarbonFootprintComponent,
    AffichePaymentComponent,
    MyApplicationsComponent,
    EditPaymentComponent,
    AllPaidParcelsComponent,
    CartComponent,
    PaidParcelsComponent,
    TrackingComponent,
    TimelineComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    ZXingScannerModule,
    WebcamModule,
    MatTableModule,
    MatIconModule,
    BrowserAnimationsModule,
    GoogleMapsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    FontAwesomeModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    BackOfficesModule
  ],
  providers: [
    PdfService,
    ImageAnalysisService,
    RecommendationService,
    ChatService,
    AuthService,
    CarpoolingService,
    DeliveryService,
    LivraisonService,
    PriceFormatterPipe,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}