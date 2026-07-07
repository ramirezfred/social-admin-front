// whatsapp.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class WhatsappService {
  private apiUrl = 'http://localhost:3000/api/whatsapp'; 

  constructor(private http: HttpClient) { }

  // 1. Iniciar sesión
  login(): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {});
  }

  // 2. Consultar estado
  getStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status`);
  }

  // 3. Enviar mensajes masivos
  sendBulkMessages(contactos: any[], mensaje: string, files?: any[]): Observable<any> {
    const body = {
      numeros: contactos,
      mensaje: mensaje,
      files: files || []
    };
    return this.http.post(`${this.apiUrl}/send-bulk`, body);
  }

  // 4. Reiniciar sesión
  resetSession(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, {});
  }

  // 5. Detener sesión
  stopSession(): Observable<any> {
    return this.http.post(`${this.apiUrl}/stop`, {});
  }
}