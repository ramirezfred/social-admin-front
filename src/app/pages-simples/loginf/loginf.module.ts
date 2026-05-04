import { NgModule } from '@angular/core';

//Mis imports
import { ThemeModule } from '../../@theme/theme.module';
import { LoginfComponent } from './loginf.component';

import { HttpClientModule } from '@angular/common/http';

import { ToasterModule } from 'angular2-toaster';

import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';

@NgModule({
  imports: [
  	ToasterModule,
    ThemeModule,
    LoadingModule.forRoot({
        animationType: ANIMATION_TYPES.chasingDots,
        backdropBackgroundColour: 'rgba(0,0,0,0.7)', 
        backdropBorderRadius: '4px',
        primaryColour: '#ffffff', 
        secondaryColour: '#ffffff', 
        tertiaryColour: '#ffffff',
        fullScreenBackdrop: true
    })
  ],
  declarations: [
    LoginfComponent,
    
  ],
})
export class LoginfModule { }
