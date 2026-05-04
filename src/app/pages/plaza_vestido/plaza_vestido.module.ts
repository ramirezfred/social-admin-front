import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { PlazaVestidoRoutingModule, routedComponents } from './plaza_vestido-routing.module';

//Mis imports
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';

import { QuotesComponent } from './components/quotes/quotes.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { HistoryComponent } from './components/history/history.component';
import { ReportsComponent } from './components/reports/reports.component';

@NgModule({
  imports: [
    ToasterModule,
    ThemeModule,
    PlazaVestidoRoutingModule,
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
    QuotesComponent,
    SuppliersComponent,
    HistoryComponent,
    ReportsComponent
  ],
   providers: [

  ],
})
export class PlazaVestidoModule { }
