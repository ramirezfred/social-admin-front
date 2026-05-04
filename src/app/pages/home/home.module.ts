import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { HomeRoutingModule, routedComponents } from './home-routing.module';

//Mis imports
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';

import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';

@NgModule({
  imports: [
    ToasterModule,
    ThemeModule,
    HomeRoutingModule,
    LoadingModule.forRoot({
        animationType: ANIMATION_TYPES.chasingDots,
        backdropBackgroundColour: 'rgba(0,0,0,0.5)', 
        backdropBorderRadius: '4px',
        primaryColour: '#ffffff', 
        secondaryColour: '#ffffff', 
        tertiaryColour: '#ffffff',
        fullScreenBackdrop: true
    })
  ],
  declarations: [
    ...routedComponents,
    CotizacionesComponent,
  ],
   providers: [

  ],
})
export class HomeModule { }
