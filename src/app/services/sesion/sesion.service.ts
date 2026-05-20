import { Injectable } from '@angular/core';
import { SocialApiService } from '../social/api/api.service';

@Injectable()
export class SesionService {

  constructor(private api_serv: SocialApiService,) { }

  setUser( user : any ){
		localStorage.setItem('user', JSON.stringify(user));
	}

  getUserId(){
		const storedUser = localStorage.getItem('user');
    if (storedUser !== null) {
      const user = JSON.parse(storedUser);
      return user.id;
    } else {
      return null;
    }
	}

  getUserEmail(){
    const storedUser = localStorage.getItem('user');
    if (storedUser !== null) {
      const user = JSON.parse(storedUser);
      return user.email;
    } else {
      return null;
    }
  }

  getUserRol(){
		const storedUser = localStorage.getItem('user');
    if (storedUser !== null) {
      const user = JSON.parse(storedUser);
      return user.tipo;
    } else {
      return null;
    }
	}

  getUserNombre(){
		const storedUser = localStorage.getItem('user');
    if (storedUser !== null) {
      const user = JSON.parse(storedUser);
      return user.nombre;
    } else {
      return null;
    }
	}

  getUserImagen(){
		const storedUser = localStorage.getItem('user');
    if (storedUser !== null) {
      const user = JSON.parse(storedUser);
      return user.imagen;
    } else {
      return null;
    }
	}

  setUserImagen( imagen : string ){
		const storedUser = localStorage.getItem('user');
    if (storedUser !== null) {
      const user = JSON.parse(storedUser);
      user.imagen = imagen;
      localStorage.setItem('user', JSON.stringify(user));
    } 
	}

  resetSesion(){

    let email : any = '';
    if(localStorage.getItem('email')){
      email = localStorage.getItem('email');
    }
    let password : any = '';
    if(localStorage.getItem('pass')){
      password = localStorage.getItem('pass');
    }

    let aviso_privacidad : any = null;
    if(localStorage.getItem('aviso_privacidad')){
      aviso_privacidad = localStorage.getItem('aviso_privacidad');
    }
    let terminos_condiciones : any = null;
    if(localStorage.getItem('terminos_condiciones')){
      terminos_condiciones = localStorage.getItem('terminos_condiciones');
    }

		//sessionStorage.removeItem('id');    // localStorage.removeItem('id');

    localStorage.clear();   // localStorage.clear();

    this.api_serv.resetToken();

    // localStorage.setItem('email', email);
    // localStorage.setItem('pass', password);

    // if(aviso_privacidad){
    //   localStorage.setItem('aviso_privacidad', '1');
    // }
    // if(terminos_condiciones){
    //   localStorage.setItem('terminos_condiciones', '1');
    // }
	}

  estaAutenticado(): boolean {

    if ( this.api_serv.getToken().length < 2 ) {
      return false;
    }else{
      return true;
    }

    // const expira = Number(localStorage.getItem('expires_in'));
    // const expiraDate = new Date();
    // expiraDate.setTime(expira);

    // if ( expiraDate > new Date() ) {
    //   return true;
    // } else {
    //   return false;
    // }


  }

}
