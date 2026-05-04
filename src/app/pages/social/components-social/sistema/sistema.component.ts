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
  selector: 'social-sistema',
  templateUrl: './sistema.component.html',
  styleUrls: ['./sistema.component.scss']
})
export class SocialSistemaComponent implements OnInit {

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

  selectImg : any = null;
  selectImgIndex : number = null;
  selectImgUrl = '';

  key_1 = null;
  key_2 = null;
  key_3 = null;
  costo_marca = null;
  sistema_id = null;

  prompt_textos = null;
  prompt_escenaA = null;
  prompt_escenaB = null;
  prompt_imagenesA = null;
  prompt_imagenesB = null;

  selectedTab1 = true;
  selectedTab2 = false;
  selectedTab3 = false;

  dalle = null;

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

    this.key_1 = null;
    this.key_2 = null;
    this.key_3 = null;
    this.costo_marca = null;
    this.sistema_id = null;
    this.prompt_textos = null;
    this.prompt_escenaA = null;
    this.prompt_escenaB = null;
    this.dalle = null;

    this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`sistema`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.loading = false;   
        
        that.key_1 = data.sistema.key_1;
        that.key_2 = data.sistema.key_2;
        that.key_3 = data.sistema.key_3;
        that.costo_marca = data.sistema.costo_marca;
        that.sistema_id = data.sistema.id;
        that.prompt_textos = data.sistema.prompt_textos;
        that.prompt_escenaA = data.sistema.prompt_escenaA;
        that.prompt_escenaB = data.sistema.prompt_escenaB;
        that.prompt_imagenesA = data.sistema.prompt_imagenesA;
        that.prompt_imagenesB = data.sistema.prompt_imagenesB;
        that.dalle = data.sistema.dalle;
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  selectTab(index){
    if(index == 1){
      this.selectedTab1 = true;
      this.selectedTab2 = false;
      this.selectedTab3 = false;
    }else if(index == 2){
      this.selectedTab1 = false;
      this.selectedTab2 = true;
      this.selectedTab3 = false;
    }else if(index == 3){
      this.selectedTab1 = false;
      this.selectedTab2 = false;
      this.selectedTab3 = true;
    }

  }

  updateKey1(){

    var datos = {
      key_1 : this.key_1
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.key_1 = data.sistema.key_1; 
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

  updateKey2(){

    var datos = {
      key_2 : this.key_2
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.key_2 = data.sistema.key_2; 
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

  updateKey3(){

    var datos = {
      key_3 : this.key_3
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.key_3 = data.sistema.key_3; 
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

  updateCostoMarca(){

    var datos = {
      costo_marca : this.costo_marca
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.costo_marca = data.sistema.costo_marca; 
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

  updatePromptTextos(){

    var datos = {
      prompt_textos : this.prompt_textos
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.prompt_textos = data.sistema.prompt_textos; 
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

  updatePromptEscenaA(){

    var datos = {
      prompt_escenaA : this.prompt_escenaA
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.prompt_escenaA = data.sistema.prompt_escenaA; 
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

  updatePromptEscenaB(){

    var datos = {
      prompt_escenaB : this.prompt_escenaB
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.prompt_escenaB = data.sistema.prompt_escenaB; 
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

  updatePromptImagenA(){

    var datos = {
      prompt_imagenesA : this.prompt_imagenesA
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.prompt_imagenesA = data.sistema.prompt_imagenesA; 
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

  updatePromptImagenB(){

    var datos = {
      prompt_imagenesB : this.prompt_imagenesB
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.prompt_imagenesB = data.sistema.prompt_imagenesB; 
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

  ChangeDalle(){
    //console.log(this.dalle);
    this.updateDalle();
  }

  updateDalle(){

    let status_aux = null;

    if(!this.dalle){
      status_aux = 0;
    }else if(this.dalle){
      status_aux = 1;
    }

    this.loading = true;
    
    var datos = {
      dalle : status_aux,
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`sistema/${this.sistema_id}`,datos)
    .subscribe({
      next(data : any) {
        //console.log(data);

        that.dalle = data.sistema.dalle; 
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

 


}
