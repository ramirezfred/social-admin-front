import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FacturacionComponent } from './facturacion.component';

const routes: Routes = [{
  path: '',
  component: FacturacionComponent,
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class FacturacionRoutingModule {

}

export const routedComponents = [
  FacturacionComponent,
];
