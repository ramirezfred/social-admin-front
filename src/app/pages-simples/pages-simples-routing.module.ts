import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesSimplesComponent } from './pages-simples.component';
import { LoginfComponent } from './loginf/loginf.component';
import { CotizacionComponent } from './cotizacion/cotizacion.component';
import { WhatsappComponent } from './whatsapp/whatsapp.component';

const routes: Routes = [{
  path: '',
  component: PagesSimplesComponent,
  children: [
  {
    path: 'loginf',
    component: LoginfComponent,
  }, 
  {
    path: 'cotizacion/:id',
    component: CotizacionComponent
  },
  {
    path: 'whatsapp',
    component: WhatsappComponent
  },
  {
    path: '',
    redirectTo: 'loginf',
    pathMatch: 'full',
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesSimplesRoutingModule {
}
