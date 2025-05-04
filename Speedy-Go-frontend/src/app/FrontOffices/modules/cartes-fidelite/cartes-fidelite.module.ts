import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
    
import { CartesFideliteRoutingModule } from './cartes-fidelite-routing.module';
import { FideliteListComponent } from './fidelite-list/fidelite-list.component';
import { FideliteCardComponent } from './fidelite-card/fidelite-card.component';
import { FideliteDetailComponent } from './fidelite-detail/fidelite-detail.component';



@NgModule({
  declarations: [
    FideliteListComponent,
    FideliteCardComponent,
    FideliteDetailComponent
   
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    CartesFideliteRoutingModule,
 
  ]
})
export class CartesFideliteModule {}
