import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

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
import { ReturnsComponent } from './FrontOffices/Pages/returns/returns.component';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { ReturnFormComponent } from './FrontOffices/Pages/return-form/return-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ReportsformComponent } from './FrontOffices/Pages/reportsform/reportsform.component';
import { ReportsComponent } from './FrontOffices/Pages/reports/reports.component';



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
    ReturnsComponent,
    ReturnFormComponent,
    ReportsformComponent,
    ReportsComponent,
    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule ,
    

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
