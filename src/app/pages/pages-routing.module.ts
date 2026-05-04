import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [{
    path: 'dashboard',
    component: DashboardComponent,
  },{
    path: 'home',
    loadChildren: './home/home.module#HomeModule',
  },{
    path: 'social',
    loadChildren: './social/social.module#SocialModule',
    // canActivate: [AuthGuard],
  },{
    path: 'facturacion',
    loadChildren: './facturacion/facturacion.module#FacturacionModule',
  },
  {
    path: 'plaza_vestido',
    loadChildren: './plaza_vestido/plaza_vestido.module#PlazaVestidoModule',
    // canActivate: [AuthGuard],
  },
  {
    path: 'publications',                                                      
    loadChildren: './publications/publications.module#PublicationsModule',
    // canActivate: [AuthGuard],
  },


  {
    path: '',
    redirectTo: 'publications',
    pathMatch: 'full',
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
