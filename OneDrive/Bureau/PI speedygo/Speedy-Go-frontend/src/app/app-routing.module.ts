import { NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';

import { AllTemplateFrontComponent } from './FrontOffices/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffices/all-template-back/all-template-back.component'; 
import { ReturnsComponent } from './FrontOffices/Pages/returns/returns.component';
import { ReturnFormComponent } from "./FrontOffices/Pages/return-form/return-form.component";
import { ReportsformComponent } from "./FrontOffices/Pages/reportsform/reportsform.component";
import { ReportsComponent } from "./FrontOffices/Pages/reports/reports.component";

const routes: Routes = [
  {
    path: '',
    component: AllTemplateFrontComponent
  },
  {
    path: 'admin',
    component: AllTemplateBackComponent
  },
  {
    path: 'returns',
    component: ReturnsComponent
  },
  {
    path: 'returnsform',
    component: ReturnFormComponent
  },
  {
    path: 'reportsform',
    component: ReportsformComponent
  },
  {
    path: 'reports',
    component: ReportsComponent
  },
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
