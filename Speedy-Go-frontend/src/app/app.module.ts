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
    AddUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, 
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },  
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
