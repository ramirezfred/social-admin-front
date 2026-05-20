import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesSimplesComponent } from './pages-simples.component';
import { LoginfComponent } from './loginf/loginf.component';

const routes: Routes = [{
  path: '',
  component: PagesSimplesComponent,
  children: [
  {
    path: 'loginf',
    component: LoginfComponent,
  }, 
  {
    path: '',
    redirectTo: 'loginf',
    pathMatch: 'full',
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesSimplesRoutingModule {
}
