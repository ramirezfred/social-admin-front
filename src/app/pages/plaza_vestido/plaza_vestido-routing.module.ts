import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlazaVestidoComponent } from './plaza_vestido.component';

const routes: Routes = [{
  path: '',
  component: PlazaVestidoComponent,
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class PlazaVestidoRoutingModule {

}

export const routedComponents = [
  PlazaVestidoComponent,
];
