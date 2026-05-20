import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { SocialRoutingModule, routedComponents } from './social-routing.module';

//Mis imports
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';


//componentes de admin de social
import { SocialUsuariosComponent } from './components-social/usuarios/usuarios.component';
import { SocialPostsComponent } from './components-social/posts/posts.component';
import { SocialSistemaComponent } from './components-social/sistema/sistema.component';
import { SocialMarcosComponent } from './components-social/marcos/marcos.component';
import { SocialImagenesComponent } from './components-social/imagenes/imagenes.component';
import { SocialPostGeneralComponent } from './components-social/post-general/post-general.component';


@NgModule({
  imports: [
    ToasterModule,
    ThemeModule,
    SocialRoutingModule,
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
    SocialUsuariosComponent,
    SocialPostsComponent,
    SocialSistemaComponent,
    SocialMarcosComponent,
    SocialImagenesComponent,
    SocialPostGeneralComponent,
  ],
   providers: [

  ],
})
export class SocialModule { }
