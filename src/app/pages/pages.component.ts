import { Component, OnInit } from '@angular/core';

import { MENU_ADMIN, MENU_EMPLOYEE } from './pages-menu';

import { SesionService } from '../services/sesion/sesion.service';

@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-sample-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-sample-layout>  `,
})
export class PagesComponent implements OnInit {

  menu : any = [];

  constructor(private sesion_serv: SesionService){

  }

  ngOnInit() {
    const userRole = this.sesion_serv.getUserRol();

    if ( userRole === 1 ) {
      this.menu = MENU_ADMIN;
    } else if ( userRole === 4 ) {
      this.menu = MENU_EMPLOYEE;
    } else {
      this.menu = [];
    }
  }

  
}
