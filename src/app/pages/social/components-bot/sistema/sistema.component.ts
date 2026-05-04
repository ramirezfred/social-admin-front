import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, NgZone } from '@angular/core';

//Mis imports
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';

import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { NbSpinnerService, NbThemeService } from '@nebular/theme';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';

import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs/Subject';

import { SocialApiService } from '../../../../services/social/api/api.service';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'bot-sistema',
  templateUrl: './sistema.component.html',
  styleUrls: ['./sistema.component.scss']
})
export class BotSistemaComponent implements OnInit {

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

  private data:any;
  private datos:any;
  public loading = false;

  bandera_init = null;

  public listado = [];

  selectObj : any = null;
  selectObjIndex : number = null;

  costo_bot = null;
  sistema_id = null;

  access_token = null;
  access_tokenB = ''; 

  constructor(private modalService: NgbModal,
         private toasterService: ToasterService,
         private router: Router,
         public fb: FormBuilder,
         public themeService:NbThemeService,
         private api_serv: SocialApiService,
         private sanitizer: DomSanitizer,
         private ngZone: NgZone) { 

    

  }

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
      this.router.navigateByUrl('/pagessimples/loginf');
    }
    else if(msg.status == 404){ 
      this.showToast('info', 'Info!', msg.error.error);
    }
    else{ 
      this.showToast('error', 'Erro!', msg.error.error);
    }
  }

  //Abrir modal por defecto
  open(modal) {
    this.modalService.open(modal);
  }

  //Abrir modal larga
  open2(modal) {
    this.modalService.open(modal , { size: 'lg', backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  //Abrir modal estatica
  open3(modal) {
    this.modalService.open(modal , { size: 'sm', backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  initComponent(){
    if(!this.bandera_init){
      this.bandera_init = 1;
      this.getListado();
      //this.Ingresar();
      this.getAccessToken();
    }
  }

  Ingresar(){

    this.loading = true;
   
    var datos= {
      email: 'admin@correo.com',
      password: '12345'
    };

    var that = this;

    this.api_serv.postQuery('auth/login/web', datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.api_serv.setToken(data.access_token, data.expires_in);
        that.loading = false;
        that.getListado();
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  refreshTabla(){
    this.getListado();
  }

  getListado(): void {

    this.costo_bot = null;
    this.sistema_id = null;

    this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`sistema`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.loading = false;   
        
        that.costo_bot = data.sistema.costo_bot;
        that.sistema_id = data.sistema.id;
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  updateCostoBot(){

    var datos = {
      costo_bot : this.costo_bot
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.costo_bot = data.sistema.costo_bot; 
        that.loading = false;   
        //that.showToast('success', 'Success!', data.message); 

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  getAccessToken(): void {

    this.access_token = null;
    
    var that = this;

    this.api_serv.getQuery(`bots/get/access_token`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.loading = false;   
        
        that.access_token = data.access_token;
      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  updateAccessToken(){

    var datos = {
      access_token : this.access_tokenB
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`bots/update/access_token`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.access_token = data.access_token; 
        that.access_tokenB = ''; 
        that.loading = false;   
        that.showToast('success', 'Success!', data.message); 

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

}
