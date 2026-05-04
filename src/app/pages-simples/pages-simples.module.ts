import { NgModule } from '@angular/core';

//Mis imports
import { PagesSimplesComponent } from './pages-simples.component';
import { LoginfModule } from './loginf/loginf.module';
import { PagesSimplesRoutingModule } from './pages-simples-routing.module';
import { ThemeModule } from '../@theme/theme.module';

import { CotizacionModule } from './cotizacion/cotizacion.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

//import { ToasterModule } from 'angular2-toaster';

const PAGESSIMPLES_COMPONENTS = [
  PagesSimplesComponent,
];

@NgModule({
  imports: [
  	//ToasterModule,
    PagesSimplesRoutingModule,
    ThemeModule,
    LoginfModule,
    CotizacionModule,
    WhatsappModule
  ],
  declarations: [
    ...PAGESSIMPLES_COMPONENTS,
  ],
})
export class PagesSimplesModule {
}
