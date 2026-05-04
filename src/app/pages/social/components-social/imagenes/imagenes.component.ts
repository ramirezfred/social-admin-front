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

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'social-imagenes',
  templateUrl: './imagenes.component.html',
  styleUrls: ['./imagenes.component.scss']
})
export class SocialImagenesComponent implements OnInit {

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

  imagenes = [];
  imgPostBase64 = null;

  marca_id = null;

  public previsualizacion: string;
  public archivos: any = [];
  imagen : any = null;

  constructor(private modalService: NgbModal,
         private toasterService: ToasterService,
         private router: Router,
         public fb: FormBuilder,
         public themeService:NbThemeService,
         private api_serv: SocialApiService,
         private sanitizer: DomSanitizer,
         private ngZone: NgZone,
         private http: HttpClient,) { 

    

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

  getMarcos(): void {

    this.imagenes = [];
    this.selectImgIndex = null;
    this.imgPostBase64 = null;

    this.loading = true;
  
    var that = this;

    this.api_serv.getQuery(`brand_images/marca/${this.selectObj.id}/activas`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.imagenes = data.imagenes; 
        that.loading = false;

        if(that.imagenes.length > 0){
          that.selectImgIndex = 0;
          that.imgPostBase64 = that.imagenes[0].url;
        }else{
          that.showToast('info', 'Info!', 'Esta Marca no posee imagenes.');
        }

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
    

  }

  changeMarca(value){
    for (var i = 0; i < this.listado.length; ++i) {
      if(value == this.listado[i].id){
        this.selectObj = this.listado[i];
        this.getMarcos();
      }
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

    this.marca_id = null;
    this.imagenes = [];
    this.selectImgIndex = null;
    this.imgPostBase64 = null;

    this.selectObj = null;
    this.selectObjIndex = null;

    this.listado = [];

    this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`marcas/index/basico`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.marcas; 
        that.loading = false;    

        if(that.listado.length > 0){
          that.selectObj = that.listado[0];
          that.selectObjIndex = 0;
          that.marca_id = that.selectObj.id;
          that.getMarcos();
        }

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  imagenSiguiente(){
    if(this.selectImgIndex < this.imagenes.length-1){

      this.selectImgIndex++;
      this.imgPostBase64 = this.imagenes[this.selectImgIndex].url;

    }else{
      //this.showToast('info', 'Info!', 'Imagen final');
    }
  }

  imagenAnterior(){
    if(this.selectImgIndex > 0){

      this.selectImgIndex--;
      this.imgPostBase64 = this.imagenes[this.selectImgIndex].url;

    }else{
      //this.showToast('info', 'Info!', 'Imagen inicial');
    }
  }

  eliminarMarco(){
    this.loading = true;
    
    var that = this;

    this.api_serv.deleteQuery(`brand_images/${this.imagenes[this.selectImgIndex].id}`)
    .subscribe({
      next(data : any) {
        console.log(data);

        that.loading = false;   
        //that.showToast('success', 'Success!', data.message); 

        that.imagenes.splice(that.selectImgIndex, 1);

        that.getMarcos();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  capturarFile(event): any {
    const archivoCapturado = event.target.files[0]
    this.extraerBase64(archivoCapturado).then((imagen: any) => {
      this.previsualizacion = imagen.base;
      console.log(imagen);

    })
    this.archivos.push(archivoCapturado)
    // 
    // console.log(event.target.files);

    // setTimeout(()=>{
    //   this.subirArchivo();
    // },200);

  }

  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        });
      };

    } catch (e) {
      return null;
    }
  })


  /**
   * Limpiar imagen
   */
  clearImage(): any {
    this.previsualizacion = '';
    this.archivos = [];
    this.imagen = null;
  }

  /**
   * Subir archivo
   */
  subirArchivo(): any {
    try {
      this.loading = true;
      const formularioDeDatos = new FormData();
      /* this.archivos.forEach(archivo => {
        formularioDeDatos.append('files', archivo)
      }) */

      if (this.archivos.length > 0) {
        formularioDeDatos.append('archivo', this.archivos[0]); 
        formularioDeDatos.append('brand_id', this.selectObj.id);       

        this.loading = true;

        var that = this;
      
        this.api_serv.postQueryUpload('brand_images', formularioDeDatos)
        .subscribe({
          next(data : any) {
            console.log(data);
            //console.log('Respuesta del servidor', data);
            that.imagenes.push(data.marco);
            that.loading = false;

            //that.showToast('success', 'Success!', data.message);
            if(that.imagenes.length == 1){
              that.selectImgIndex = 0;
            }else{
              that.selectImgIndex++;
            }
            
            that.imgPostBase64 = that.imagenes[that.selectImgIndex].url;
            
          },
          error(msg) {
            console.log(msg);
            that.loading = false;

            that.tratarError(msg);
    
          }
        });


      }else{

        this.showToast('warning', 'Warning!', 'Seleccione una imagen');

      }


    } catch (e) {
      this.loading = false;
      console.log('ERROR', e);
    }
  }


}
