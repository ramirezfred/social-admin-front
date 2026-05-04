import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { RutaBaseService } from '../../services/ruta-base/ruta-base.service';

import { Location } from '@angular/common';

@Component({
  selector: 'app-validar-password',
  templateUrl: './validar-password.component.html',
  styleUrls: ['./validar-password.component.scss']
})
export class ValidarPasswordComponent implements OnInit {

  //----Alertas---<
  config: ToasterConfig;

  position = 'toast-top-right';
  animationType = 'fade';
  title = 'HI there!';
  content = `I'm cool toaster!`;
  timeout = 5000;
  toastsLimit = 5;
  type = 'default'; // 'default', 'info', 'success', 'warning', 'error'

  isNewestOnTop = true;
  isHideOnClick = true;
  isDuplicatesPrevented = false;
  isCloseButton = true;
  //----Alertas--->

  modalActiva : any;

  //@Input() operacion : any = null;
  operacion = null;

  @ViewChild('modalPassGeneral') modalPassGeneral : ElementRef;

  password_general = null;

  operador = null;

  @ViewChild('modalPassOperador') modalPassOperador : ElementRef;

  password_operador = null;

  ciudad_id = localStorage.getItem('mouvers_user_ciudad_id');

  public loading = false;

  @Output() autorizado_event : EventEmitter<boolean> = new EventEmitter();

  password_seccion = null;

  @ViewChild('modalPassSeccion') modalPassSeccion : ElementRef;

  constructor(private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private rutaService: RutaBaseService,
      private _location: Location
      ) { }

  ngOnInit() {
  }

  private showToast(type: string, title: string, body: string) {
      this.config = new ToasterConfig({
        positionClass: this.position,
        timeout: this.timeout,
        newestOnTop: this.isNewestOnTop,
        tapToDismiss: this.isHideOnClick,
        preventDuplicates: this.isDuplicatesPrevented,
        animation: this.animationType,
        limit: this.toastsLimit,
      });
      const toast: Toast = {
        type: type,
        title: title,
        body: body,
        timeout: this.timeout,
        showCloseButton: this.isCloseButton,
        bodyOutputType: BodyOutputType.TrustedHtml,
      };
      this.toasterService.popAsync(toast);
  }

  tratarError(msg : any){
    //token invalido/ausente o token expiro
    if(msg.status == 400 || msg.status == 401){ 
        this.showToast('warning', 'Warning!', msg.error.error);
    }
    else if(msg.status == 404){ 
        this.showToast('info', 'Info!', msg.error.error);
    }
    else{ 
        this.showToast('error', 'Erro!', msg.error.error);
    }
  }

  //Abrir modal estatica
  openModalPassGeneral(operacion) {
    let modal = this.modalPassGeneral;
    this.operacion = operacion;
    this.password_general = null;
    this.modalActiva = this.modalService.open(modal , { backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  //Abrir modal estatica
  openModalPassOperador() {
    let modal = this.modalPassOperador;
    this.operador = null;
    this.password_operador = null;
    this.modalActiva = this.modalService.open(modal , { backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  //Abrir modal estatica
  openModalPassSeccion() {
    let modal = this.modalPassSeccion;
    this.password_seccion = null;
    this.modalActiva = this.modalService.open(modal , { backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  goBack(){
    this._location.back();
  }

  /*Validar el password para acceder a la seccion*/
  validarPassSeccion(): void {

    this.loading = true;
    this.http.get(this.rutaService.getRutaApi()+'ciudades/'+this.ciudad_id+'/validar/pass/seccion?password_seccion='+this.password_seccion+'&token='+localStorage.getItem('mouvers_token'))
      .toPromise()
      .then(
        (data:any) => { // Success
          this.loading = false;
          this.showToast('success', 'Success!', data.message);
          this.autorizado_event.emit(true);
        },
        msg => { // Error
          this.loading = false;
          this.openModalPassSeccion();
          this.tratarError(msg);     
        }
      );
  }

  /*Validar el password general*/
  validarPassGeneral(): void {
    this.loading = true;
    this.http.get(this.rutaService.getRutaApi()+'ciudades/'+this.ciudad_id+'/validar/pass/general?password_general='+this.password_general+'&token='+localStorage.getItem('mouvers_token'))
      .toPromise()
      .then(
        (data:any) => { // Success       
          this.loading = false;
          this.showToast('success', 'Success!', data.message);
          this.openModalPassOperador();
        },
        msg => { // Error
          this.loading = false;
          this.openModalPassGeneral(this.operacion);
          this.tratarError(msg);     
        }
      );
  }

  /*Validar el password de operador*/
  validarPassOperador(): void {
    this.loading = true;

    var datos= {
      token: localStorage.getItem('mouvers_token'),
      password_operador: this.password_operador
    }

    this.http.post(this.rutaService.getRutaApi()+'operadores/validar/password',datos)
      .toPromise()
      .then(
        (data:any) => { // Success       
          this.loading = false;
          this.showToast('success', 'Success!', data.message);
          this.autorizado_event.emit(true);
          this.operador = data.operador;
          this.registrarOperacion();
        },
        msg => { // Error
          this.loading = false;
          this.openModalPassOperador();
          this.tratarError(msg);     
        }
      );
  }

  /*Registrar operacion en el historial*/
  registrarOperacion(): void {

    var datos= {
      token: localStorage.getItem('mouvers_token'),
      nombre: this.operador.nombre,
      password: this.operador.password,
      operacion: this.operacion,
    }

    this.http.post(this.rutaService.getRutaApi()+'historial',datos)
      .toPromise()
      .then(
        (data:any) => { // Success 
        },
        msg => { // Error    
        }
      );
  }

}
