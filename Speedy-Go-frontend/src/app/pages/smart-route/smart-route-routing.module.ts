import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmartRouteComponent } from './smart-route.component';

const routes: Routes = [{ path: '', component: SmartRouteComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmartRouteRoutingModule { }
