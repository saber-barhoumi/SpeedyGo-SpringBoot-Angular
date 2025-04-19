import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FideliteListComponent } from './fidelite-list/fidelite-list.component';
import { FideliteDetailComponent } from './fidelite-detail/fidelite-detail.component';

const routes: Routes = [
  { path: '', component: FideliteListComponent },
  { path: 'detail/:id', component: FideliteDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartesFideliteRoutingModule { }
