import { Injectable } from '@angular/core';

//Mis imports
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

@Injectable()
export class SocialApiService {

  //Local freddy
  // public api_base = 'http://localhost/publicacionesIA/publicacionesIAAPI/public/api/';
  // public images_base = 'http://localhost/publicacionesIA/publicacionesIAAPI/public/images_uploads/';
  // public api_public = 'http://localhost/publicacionesIA/publicacionesIAAPI/public/';
  // public archivos_base = 'http://localhost/publicacionesIA/publicacionesIAAPI/public/archivos_uploads/';

  //Remoto vps
  // public api_base = `https://apisocial.internow.com.mx/api/`;
  // public images_base = `https://apisocial.internow.com.mx/images_uploads/`;
  // public api_public = `https://apisocial.internow.com.mx/`;
  // public archivos_base = `https://apisocial.internow.com.mx/archivos_uploads/`;

  public api_base = `${environment.apiUrl}/api/`;
  public images_base = `${environment.apiUrl}/images_uploads/`;
  public api_public = `${environment.apiUrl}/`;
  public archivos_base = `${environment.apiUrl}/archivos_uploads/`;

  constructor(private http: HttpClient) { }

  getRutaApi(){
    return this.api_base;
  }

  getRutaImages(){
    return this.images_base;
  }

  getRutaArchivos(){
    return this.archivos_base;
  }

  getToken(){
    if (localStorage.getItem('social_token')) {
      return localStorage.getItem("social_token");
    }else{
      return '';
    }

    // return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpc29jaWFsLmludGVybm93LmNvbS5teFwvYXBpXC9hdXRoXC9sb2dpblwvd2ViIiwiaWF0IjoxNjc5MjY2MTA0LCJleHAiOjE2NzkyODQxMDQsIm5iZiI6MTY3OTI2NjEwNCwianRpIjoiM1Bsc0tScUFTaW83ekJUZCIsInN1YiI6MSwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.lXE-KLeRxSNDaaQaG_4NHiK7EX-mM0IBWgb-PyRHe7g";
  }

  setToken( token : string, expires_in : number ){
    localStorage.setItem('social_token', token);   // localStorage.setItem('id', noOfClicks);
    
    /* let hoy = new Date();
      hoy.setSeconds( 3600 );

      localStorage.setItem('expira', hoy.getTime().toString() ); */

    let hoy = new Date();
      hoy.setSeconds( expires_in );

    localStorage.setItem('social_expires_in', hoy.getTime().toString());   // localStorage.setItem('id', noOfClicks);
  }

  resetToken( ){
    localStorage.removeItem('social_token');    // localStorage.removeItem('id');
    localStorage.removeItem('social_expires_in');    // localStorage.removeItem('id');
  }

  postQuery( query : string, datos ){
    
    const url = this.api_base + query;

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization' : 'Bearer '+this.getToken(),
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Accept': 'application/json, text/plain'
      })
      };

    //console.log('token serv '+this.getToken());  

    return this.http.post(url, datos, httpOptions);
  }

  postQueryUpload( query : string, datos ){
    
    const url = this.api_base + query;

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization' : 'Bearer '+this.getToken(),
        //'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Accept': 'application/json, text/plain',
        'enctype': 'multipart/form-data'
      })
      };

    //console.log('token serv '+this.getToken());  

    return this.http.post(url, datos, httpOptions);
  }

  postQueryUploadV2( query : string, datos ){
    
    const url = this.api_public + query;

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization' : 'Bearer '+this.getToken(),
        //'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Accept': 'application/json, text/plain',
        'enctype': 'multipart/form-data'
      })
      };

    //console.log('token serv '+this.getToken());  

    return this.http.post(url, datos, httpOptions);
  }

  getQuery( query : string ){
    
    const url = this.api_base + query;

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization' : 'Bearer '+this.getToken(),
      })
      };
    
    //console.log('token serv '+this.getToken()); 

    return this.http.get(url, httpOptions);
  }

  deleteQuery( query : string ){
    
    const url = this.api_base + query;

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization' : 'Bearer '+this.getToken(),
      })
      };
    
    //console.log('token serv '+this.getToken()); 

    return this.http.delete(url, httpOptions);
  }

  putQuery( query : string, datos ){
    
    const url = this.api_base + query;

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization' : 'Bearer '+this.getToken(),
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Accept': 'application/json, text/plain'
      })
      };

    //console.log('token serv '+this.getToken());  

    return this.http.put(url, datos, httpOptions);
  }

  getQueryUser( query : string, token : string ){
    
    const url = this.api_base + query;

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization' : 'Bearer '+token,
      })
    };
    
    //console.log('token serv '+this.getToken()); 

    return this.http.get(url, httpOptions);
  }

}
