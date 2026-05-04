/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CoreModule } from './@core/core.module';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ThemeModule } from './@theme/theme.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//Mis imports
import { RutaBaseService } from './services/ruta-base/ruta-base.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';

// import { AgmCoreModule } from '@agm/core';


import { ToasterModule } from 'angular2-toaster';

import { UploadService } from './services/upload-service/upload.service';

import { ApiService } from './services/guias/api/api.service';
import { SocialApiService } from './services/social/api/api.service';
import { FacturacionApiService } from './services/facturacion/api/api.service';

import { PublicationService } from './services/publications/publication.service';
import { SupplierService } from './services/publications/supplier.service';
import { OfflineQueueService } from './services/publications/offline-queue.service';

import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [AppComponent],
  imports: [
    ToasterModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyAUHNJX9XMMKI_Fkzz3wq4dwi6LVYFY41Q',
    //   libraries: ["places"]
    // }),
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    ThemeModule.forRoot(),
    CoreModule.forRoot(),
    LoadingModule.forRoot({
        animationType: ANIMATION_TYPES.wanderingCubes,
        backdropBackgroundColour: 'rgba(0,0,0,0.7)', 
        backdropBorderRadius: '4px',
        primaryColour: '#ffffff', 
        secondaryColour: '#ffffff', 
        tertiaryColour: '#ffffff',
        fullScreenBackdrop: true
    })

  ],
  bootstrap: [AppComponent],
  providers: [
    AuthGuard,
    PublicationService,
    SupplierService,
    OfflineQueueService,
    UploadService,
    RutaBaseService,
    ApiService,
    SocialApiService,
    FacturacionApiService,
    { provide: APP_BASE_HREF, useValue: '/' },
  ],
})
export class AppModule {
}
