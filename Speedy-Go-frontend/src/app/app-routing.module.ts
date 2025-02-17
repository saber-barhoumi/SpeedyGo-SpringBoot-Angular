import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AllTemplateFrontComponent } from './FrontOffices/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffices/all-template-back/all-template-back.component'; // Ajout de l'importation

const routes: Routes = [
  {
    path: '',
    component: AllTemplateFrontComponent
  },
  {
    path: 'admin',
    component: AllTemplateBackComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
