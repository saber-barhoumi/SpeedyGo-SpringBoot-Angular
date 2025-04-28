import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SmartRouteRoutingModule } from './smart-route-routing.module';
import { SmartRouteComponent } from './smart-route.component';
import { SmartRouteMapComponent } from './components/smart-route-map/smart-route-map.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SmartRouteComponent,
    SmartRouteMapComponent
  ],
  imports: [
    CommonModule,
    SmartRouteRoutingModule,
    FormsModule
  ]
})
export class SmartRouteModule { }
