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

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'social-post-general',
  templateUrl: './post-general.component.html',
  styleUrls: ['./post-general.component.scss']
})
export class SocialPostGeneralComponent implements OnInit {

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

  texto = '';

  generado = false;

  marcas = [];
  posts = [];

  @ViewChild('canvas') canvas: ElementRef;

  resized = null;

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
      //this.getListado();
      //this.Ingresar();
    }
  }

 

  refreshTabla(){
  }

 

  capturarFile(event): any {
    const archivoCapturado = event.target.files[0]
    this.extraerBase64(archivoCapturado).then((imagen: any) => {
      this.previsualizacion = imagen.base;
      this.imgPostBase64 = imagen.base;
      console.log(imagen);

    })
    this.archivos.push(archivoCapturado)
    // 
    // console.log(event.target.files);

    setTimeout(()=>{
      this.resizeImage();
    },200);

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
    this.imgPostBase64 = null;
    this.texto = '';
    this.generado = false;
  }

  fixBinary (bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
      arr[i] = bin.charCodeAt(i);
    }
    return buf;
  }

  /**
   * Subir archivo
   */
  subirArchivoVps(): any {

    this.loading = true;

    const httpOptions = {
      headers: new HttpHeaders({
        //'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Accept': 'application/json, text/plain',
        'enctype': 'multipart/form-data'
      })
      };

    this.posts = [];

    try {
      
      var jpg = this.imgPostBase64.split(',')[1];
      var binary = this.fixBinary(window.atob(jpg));// <-- Usamos la fn "fixBinary"
      var the_file = new Blob([binary], {type: 'image/jpeg'});// <-- Sacamos el encode
      var imagen_firma = new File([the_file], 'imagen_firma.jpeg', { type: 'image/jpeg' });

      const formularioDeDatos = new FormData();
      formularioDeDatos.append('archivo', imagen_firma); 
      formularioDeDatos.append('carpeta', 'post_generales');
      formularioDeDatos.append('marcas', JSON.stringify(this.marcas));

      var that = this;
      that.loading = true;
      
      this.http.post('https://api.goopy.app/internow_social/crear/posts_generales', formularioDeDatos, httpOptions)
      .subscribe({
        next(data : any) {
          console.log(data);
          that.loading = false;

          that.generado = true;

          that.posts = data.posts;

          that.storePostsGenerales();
          
        },
        error(msg) {
          console.log(msg);
          that.loading = false;

          that.tratarError(msg);
  
        }
      });

    } catch (e) {
      console.log('ERROR', e);
      that.loading = false;
      this.showToast('error', 'Erro!', 'Error al subir el post al VPS.');
    }
  }

  resizeImage() {   

    // Crea un elemento canvas
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    //const ctx = canvasEl.getContext('2d');

    const img1 = new Image();
    //img1.crossOrigin = 'Anonymous';
    //img1.crossOrigin = '';

    img1.src = this.imgPostBase64;
    img1.onload = () => {

      img1.width = 640;
      img1.height = 640;

      canvasEl.width = img1.width;
      canvasEl.height = img1.height;

      // Dibujar la imagen en el canvas
      var ctx = canvasEl.getContext("2d");
      
      ctx.drawImage(img1, 0, 0, img1.width, img1.height);

      // Obtiene la imagen redimensionada en formato base64
      var resizedImg = canvasEl.toDataURL("image/jpeg", 0.7);

      // Retorna la imagen redimensionada
      //return resizedImg;
      this.imgPostBase64 = resizedImg;
      //console.log(this.resized);
  
      
    };
  }

  consultarMarcas(): void {

    this.loading = true;

    this.marcas = [];

    var that = this;

    this.api_serv.getQuery(`posts_generales/marcas`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.marcas = data.marcas;

        if(that.marcas.length > 0){
          that.subirArchivoVps();
        }else{
          this.showToast('info', 'Info!', 'No hay marcas activas con redes asociadas.');
          that.loading = false;
        }

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
    
  }

  storePostsGenerales(): void {

    var datos= {
      texto : this.texto,
      posts: JSON.stringify(this.posts)
    };

    this.api_serv.postQuery(`posts_generales/publicar/posts`,datos)
    .subscribe({
      next(data : any) {
        console.log(data);
      },
      error(msg) {
        console.log(msg);
      }
    });
    
  }


}
