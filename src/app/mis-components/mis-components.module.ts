import { NgModule } from '@angular/core';

//Mis imports
import { FormsModule } from '@angular/forms';
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';

import { ValidarPasswordComponent } from './validar-password/validar-password.component';

@NgModule({
  imports: [
    FormsModule,
    ToasterModule,
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
  	ValidarPasswordComponent,
  ],
  exports: [
  	ValidarPasswordComponent,
  ],
})
export class MisComponentsModule { }
