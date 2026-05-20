import { Injectable } from '@angular/core';
//import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CanActivate, Router } from '@angular/router';

import { SesionService } from '../services/sesion/sesion.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor( 
    private router: Router,
    private sesion_serv: SesionService
  ) {}

  /* canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  } */

  canActivate(): boolean  {

    if ( this.sesion_serv.estaAutenticado() ) {
      return true;
    } else {
      this.router.navigateByUrl('/pagessimples/loginf');
      return false;
    }
 
  }
  
}
