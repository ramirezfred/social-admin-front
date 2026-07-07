import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BulkMessageComponent } from './bulk-message.component';

const routes: Routes = [{
  path: '',
  component: BulkMessageComponent,
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class BulkMessageRoutingModule {

}

export const routedComponents = [
  BulkMessageComponent,
];
