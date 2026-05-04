import { Injectable } from '@angular/core';
//import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CanActivate, Router } from '@angular/router';
// import { Observable } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { SocialApiService } from '../services/social/api/api.service';
// import Swal from 'sweetalert2';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor( 
    private router: Router,
    private sesion_serv: SocialApiService
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
      // Swal.fire({
      //   title: 'Warning',
      //   text: 'Acceso denegado, es necesario iniciar sesión para acceder a esta página.',
      //   icon: 'warning'
      // });
      this.router.navigateByUrl('/pagessimples/loginf');
      return false;
    }
 
  }
  
}
