import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { FacturacionRoutingModule, routedComponents } from './facturacion-routing.module';

//Mis imports
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';

import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { PagosComponent } from './components/pagos/pagos.component';

@NgModule({
  imports: [
    ToasterModule,
    ThemeModule,
    FacturacionRoutingModule,
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
    UsuariosComponent,
    PagosComponent
  ],
   providers: [

  ],
})
export class FacturacionModule { }
