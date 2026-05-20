import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AdminGuard } from '../guards/admin.guard';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [{
    path: 'dashboard',
    component: DashboardComponent,
  },{
    path: 'social',
    loadChildren: './social/social.module#SocialModule',
    canActivate: [AdminGuard],
  },
  {
    path: 'plaza_vestido',
    loadChildren: './plaza_vestido/plaza_vestido.module#PlazaVestidoModule',
  },
  {
    path: 'publications',                                                      
    loadChildren: './publications/publications.module#PublicationsModule',
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
