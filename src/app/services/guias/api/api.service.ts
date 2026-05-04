import { Injectable } from '@angular/core';

//Mis imports
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ApiService {

  //Local freddy
  // public api_base = 'http://localhost/gitHub/Guias/guiasAPI/public/';
  // public images_base = 'http://localhost/gitHub/Guias/guiasAPI/public/images_uploads/';
  // public api_public = 'http://localhost/gitHub/Guias/guiasAPI/public/';

  //Remoto vps
  public api_base = `https://api.internow.com.mx/`;
  public images_base = `https://api.internow.com.mx/images_uploads/`;
  public api_public = `https://api.internow.com.mx/`;
  public archivos_base = `https://api.internow.com.mx/archivos_uploads/`;

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
    /*if (sessionStorage.getItem('token')) {
      return sessionStorage.getItem("token");
    }else{
      return '';
    }*/

    //cliente toni
    //let token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjUsImlzcyI6Imh0dHBzOlwvXC9hcGkuaW50ZXJub3cuY29tLm14XC9sb2dpblwvd2ViIiwiaWF0IjoxNjYzMTkyMTgxLCJleHAiOjE2OTQ3MjgxODEsIm5iZiI6MTY2MzE5MjE4MSwianRpIjoiMzcxYzU2NmE2OTg0M2JmOWUzZWU5YmI4MTRkYmZiZGYifQ.3b10YD3kh3-FrukV3Hv5uMgila6JVNQI-dn-ERaMHFo";
    let token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjYsImlzcyI6Imh0dHBzOlwvXC9hcGkuaW50ZXJub3cuY29tLm14XC9sb2dpblwvd2ViIiwiaWF0IjoxNjYzMTkyNzg0LCJleHAiOjE2OTQ3Mjg3ODQsIm5iZiI6MTY2MzE5Mjc4NCwianRpIjoiMWI0MjQzZGNhNWVkYzVlYTk5ZDg0ODA2ZDFhZGFiZDUifQ.X4Ts6iAPZimXSfo4vnbCX7h5bEM6VkD6jJVQ1KRd8Wo";
    return token;
  }

  setToken( token : string, expires_in : number ){
    sessionStorage.setItem('token', token);   // localStorage.setItem('id', noOfClicks);
    
    /* let hoy = new Date();
      hoy.setSeconds( 3600 );

      localStorage.setItem('expira', hoy.getTime().toString() ); */

    let hoy = new Date();
      hoy.setSeconds( expires_in );

    sessionStorage.setItem('expires_in', hoy.getTime().toString());   // localStorage.setItem('id', noOfClicks);
  }

  resetToken( ){
    sessionStorage.removeItem('token');    // localStorage.removeItem('id');
    sessionStorage.removeItem('expires_in');    // localStorage.removeItem('id');
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

}
