import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { PublicationsRoutingModule, routedComponents } from './publications-routing.module';

import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';

import { ListaComponent } from './components/lista/lista.component';
import { CrearComponent } from './components/crear/crear.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';

import { WaSenderComponent } from './components/wa-sender/wa-sender.component';

// import { PublicationService } from '../../services/publications/publication.service';
// import { SupplierService } from '../../services/publications/supplier.service';
// import { OfflineQueueService } from '../../services/publications/offline-queue.service';

@NgModule({
  imports: [
    ToasterModule,
    ThemeModule,
    PublicationsRoutingModule,
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
    ListaComponent,
    CrearComponent,
    CatalogoComponent,
    WaSenderComponent
  ],
  providers: [
    // PublicationService,
    // SupplierService,
    // OfflineQueueService
  ],
})
export class PublicationsModule { }