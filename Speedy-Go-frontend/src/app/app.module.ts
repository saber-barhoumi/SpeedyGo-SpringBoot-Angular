import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
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

// Import CustomerComponent (and other missing components)
import { CustomerComponent } from './FrontOffices/pages/customer/customer.component';
import { DeliveryComponent } from './FrontOffices/pages/delivery/delivery.component';
import { PartnerComponent } from './FrontOffices/pages/partner/partner.component';
import { RecruitmentPageComponent } from './FrontOffices/pages/delivery/recruitment-page/recruitment-page.component';
import { CarpoolingComponent } from './FrontOffices/pages/delivery/carpooling/carpooling.component';
import { InternationalShippingComponent } from './FrontOffices/pages/customer/international-shipping/international-shipping.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserProfileComponent } from './FrontOffices/pages/user-profile/user-profile.component';
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

// Components and Services
import { ChatComponent } from './FrontOffices/pages/chat/chat/chat.component';
import { ChatService } from './services/user/Chat/chat.service';
import { AuthService } from './FrontOffices/services/user/auth.service';
// Import FontAwesomeModule
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PriceFormatterPipe } from './pipes/price-formatter.pipe';

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
    VehicleFormComponent,
    VehicleListComponent,
    VehicleDetailComponent,
    RecruitmentManagementComponent,
    CarpoolingComponent,
    CustomerComponent,
    DeliveryComponent,
    PartnerComponent,
    RecruitmentPageComponent,
    InternationalShippingComponent,
    UserProfileComponent,
    ChatbotComponent,
    ChatButtonComponent,
    ChatDialogComponent,
    ChatComponent,
    PriceFormatterPipe 

  ],
  imports: [
    
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    FontAwesomeModule, // Add FontAwesomeModule here
    MatButtonModule,    // Add material modules
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    ChatService,  // Fixed position of ChatService
    AuthService   // Added AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }