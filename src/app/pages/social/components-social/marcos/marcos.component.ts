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
  selector: 'social-marcos',
  templateUrl: './marcos.component.html',
  styleUrls: ['./marcos.component.scss']
})
export class SocialMarcosComponent implements OnInit {

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

  //edit marcos
  selectedTab1 = true;
  selectedTab2 = false;

  selectObj2 : any = null;
  selectObjIndex2 : number = null;

  selectImg2 : any = null;
  selectImgIndex2 : number = null;
  selectImgUrl2 = '';

  imagenes2 = [];
  imgPostBase642 = null;

  marca_id2 = null;

  pexelsUrl = 'https://images.pexels.com/photos/13791399/pexels-photo-13791399.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=1080';
  //pexelsUrl = 'https://images.pexels.com/photos/207580/pexels-photo-207580.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=1080';

  @ViewChild('canvas') canvas: ElementRef;

  base = {
    pexels_url: 'https://images.pexels.com/photos/13791399/pexels-photo-13791399.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=1080',
    marco:{
      id: null,
      base64: null,
      img1_height: null,
      img1_radius: null,
      img1_tipo: null,
      img1_width: null,
      img1_x: null,
      img1_y: null,
      img2_height: null,
      img2_radius: null,
      img2_tipo: null,
      img2_width: null,
      img2_x: null,
      img2_y: null,
      nombre: null,
      text1_aling: null,
      text1_color: null,
      text1_font: null,
      text1_px: null,
      text1_x: null,
      text1_y: null,
      text2_aling: null,
      text2_color: null,
      text2_font: null,
      text2_px: null,
      text2_x: null,
      text2_y: null,
      text3_aling: null,
      text3_color: null,
      text3_font: null,
      text3_px: null,
      text3_x: null,
      text3_y: null,
      url: null,
      url_allow_origin: null,
    },
    marca : {
      id: null,
      color_a: null,
      color_b: null,
      color_c: null,
      logo_allow_origin: null,
      nombre: null,
      servicios: null,
      pexels_frase: null,
      font: null,
      redes: [
        {
          id: null,
          alias: null,
          brand_id: null,
          page_name: null,
          tipo: null,
          text_page_name: null,
        },
        {
          id: null,
          alias: null,
          brand_id: null,
          page_name: null,
          tipo: null,
          text_page_name: null,
        }
      ],
      user : {
        id: null,
        email: null,
        telefono: null,
        text_telefono: null,
      }
    },

  };

  nombres_fuentes = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Comic Sans MS",
    "Impact",
    "Arial Black",
    "Tahoma",
    "Trebuchet MS",
    "Palatino",
    "Garamond",
    "Bookman",
    "Copperplate",
    "Century Gothic",
    "Franklin Gothic",
    "Lucida Console",
    "Monaco",
    "Bodoni",
    "Futura",
    "Rockwell",
    "Brush Script",
    "Segoe UI",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Raleway"
  ];

  colores = [
    "white",
    "black",
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "brown",
    "gray",
    "silver",
    "gold",
    "navy",
    "teal",
    "olive",
    "maroon",
    "lime",
    "aqua",
    "indigo",
    "coral",
    "salmon",
    "lavender",
    "turquoise",
    "magenta",
    "slate",
    "peru",
    "violet",
    "sienna",
    "crimson"
  ];

  alings = ["left","center","right"];

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

  selectTab(index){
    if(index == 1){
      this.selectedTab1 = true;
      this.selectedTab2 = false;
    }else if(index == 2){
      this.selectedTab1 = false;
      this.selectedTab2 = true;
    }

  }

  getMarcos(): void {

    this.imagenes = [];
    this.selectImgIndex = null;
    this.imgPostBase64 = null;

    this.loading = true;
  
    var that = this;

    this.api_serv.getQuery(`marcos/marca/${this.selectObj.id}`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.imagenes = data.marcos; 
        that.loading = false;

        if(that.imagenes.length > 0){
          that.selectImgIndex = 0;
          that.imgPostBase64 = that.imagenes[0].url;
        }else{
          that.showToast('info', 'Info!', 'Esta Marca no posee marcos.');
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

    //edit marcos
    this.marca_id2 = null;

    this.imagenes2 = [];
    this.selectImgIndex2 = null;
    this.imgPostBase642 = null;

    this.selectObj2 = null;
    this.selectObjIndex2 = null;

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


          //that.selectObj2 = that.listado[0];
          that.selectObj2 = JSON.parse(JSON.stringify(that.listado[0]));
          that.selectObjIndex2 = 0;
          that.marca_id2 = that.selectObj2.id;
          that.getMarcosBase(that.listado[0].id);
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

    this.api_serv.deleteQuery(`marcos/${this.imagenes[this.selectImgIndex].id}`)
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
      
        this.api_serv.postQueryUpload('marcos', formularioDeDatos)
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

  changeMarca2(value){
    for (var i = 0; i < this.listado.length; ++i) {
      if(value == this.listado[i].id){
        //this.selectObj2 = this.listado[i];
        this.selectObj2 = JSON.parse(JSON.stringify(this.listado[i]));
        this.getMarcosBase(this.listado[i].id);
      }
    } 

    if(this.selectObj2.redes.length > 0){
      for (var i = 0; i < this.selectObj2.redes.length; ++i) {
        this.selectObj2.redes[i].text_page_name = 
          this.selectObj2.redes[i].alias+': '+this.selectObj2.redes[i].page_name;
      }
    }else{
      this.selectObj2.redes = [
        {
          id: null,
          alias: null,
          brand_id: null,
          page_name: null,
          tipo: null,
          text_page_name: null,
        },
        {
          id: null,
          alias: null,
          brand_id: null,
          page_name: null,
          tipo: null,
          text_page_name: null,
        }
      ];
    }
    this.selectObj2.user.text_telefono = 'Teléfono: '+this.selectObj2.user.telefono;

    //this.base.marco = this.imagenes2[0]; 
    this.base.marco.text1_font = this.selectObj2.font;
    this.base.marco.text2_font = this.selectObj2.font;
    this.base.marco.text3_font = this.selectObj2.font;
    this.base.marca = this.selectObj2; 
    this.aplicarCambios();

    this.getImgPexels(this.base.marca.pexels_frase);

  }

  getMarcosBase(marca_id): void {

    this.imagenes2 = [];
    this.selectImgIndex2 = null;
    this.imgPostBase642 = null;

    this.loading = true;
  
    var that = this;

    //this.api_serv.getQuery(`marcos_base`)
    this.api_serv.getQuery(`marcos_base/habilitados/${marca_id}`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.imagenes2 = data.marcos; 
        that.loading = false;

        if(that.imagenes2.length > 0){
          that.selectImgIndex2 = 0;

          if(that.selectObj2.redes.length > 0){
            for (var i = 0; i < that.selectObj2.redes.length; ++i) {
              that.selectObj2.redes[i].text_page_name = 
                that.selectObj2.redes[i].alias+': '+that.selectObj2.redes[i].page_name;
            }
          }else{
            that.selectObj2.redes = [
              {
                id: null,
                alias: null,
                brand_id: null,
                page_name: null,
                tipo: null,
                text_page_name: null,
              },
              {
                id: null,
                alias: null,
                brand_id: null,
                page_name: null,
                tipo: null,
                text_page_name: null,
              }
            ];
          }
          that.selectObj2.user.text_telefono = 'Teléfono: '+that.selectObj2.user.telefono;

          that.base.marco = that.imagenes2[0]; 
          that.base.marco.text1_font = that.selectObj2.font;
          that.base.marco.text2_font = that.selectObj2.font;
          that.base.marco.text3_font = that.selectObj2.font; 
          that.base.marca = that.selectObj2; 
          that.aplicarCambios();
          that.getImgPexels(that.base.marca.pexels_frase);

        }else{
          that.showToast('info', 'Info!', 'No hay marcos disponibes para esta marca.');
        }

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  imagenSiguiente2(){
    if(this.selectImgIndex2 < this.imagenes2.length-1){

      this.selectImgIndex2++;
      //this.imgPostBase642 = this.imagenes2[this.selectImgIndex2].url;

      this.base.marco = this.imagenes2[this.selectImgIndex2];
      this.aplicarCambios();

      //this.getImgPexels(this.base.marca.pexels_frase);

    }else{
      //this.showToast('info', 'Info!', 'Imagen final');
    }
  }

  imagenAnterior2(){
    if(this.selectImgIndex2 > 0){

      this.selectImgIndex2--;
      //this.imgPostBase642 = this.imagenes2[this.selectImgIndex2].url;

      this.base.marco = this.imagenes2[this.selectImgIndex2];
      this.aplicarCambios();

      //this.getImgPexels(this.base.marca.pexels_frase);

    }else{
      //this.showToast('info', 'Info!', 'Imagen inicial');
    }
  }

  setCanvas(base){
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const ctx = canvasEl.getContext('2d');

    const img_base = new Image();
    img_base.crossOrigin = 'Anonymous';

    img_base.src = base.marco.url_allow_origin;
    img_base.onload = () => {

      canvasEl.width = img_base.width;
      canvasEl.height = img_base.height;

      ctx.drawImage(img_base, 0, 0);

      // Obtener los datos de píxeles de la imagen
      const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      const pixels = imageData.data;

      // Iterar a través de los píxeles para detectar el color X
      for (let i = 0; i < pixels.length; i += 4) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];

        // Rojo  (255,0,0)  #FF0000
        // Verde  (0,255,0)  #00FF00
        // Azul  (0,0,255)  #0000FF

        // Comprobar si el píxel es Rojo
        if (
          (red === 255 && green === 21 && blue === 21) ||
          (red === 255 && green === 0 && blue === 0)
          ) {
          
            // Convertir el color hexadecimal a componentes RGBA
            const { r, g, b } = this.hexToRGBA(base.marca.color_a);

            // Asignar los nuevos componentes de color a los píxeles
            pixels[i] = r; // componente rojo
            pixels[i + 1] = g; // componente verde
            pixels[i + 2] = b; // componente azul
        }

        // Comprobar si el píxel es Verde
        if ((red === 0 && green === 255 && blue === 0)) {
          
            // Convertir el color hexadecimal a componentes RGBA
            const { r, g, b } = this.hexToRGBA(base.marca.color_b);

            // Asignar los nuevos componentes de color a los píxeles
            pixels[i] = r; // componente rojo
            pixels[i + 1] = g; // componente verde
            pixels[i + 2] = b; // componente azul
        }

        // Comprobar si el píxel es Azul
        if ((red === 0 && green === 0 && blue === 255)) {
          
            // Convertir el color hexadecimal a componentes RGBA
            const { r, g, b } = this.hexToRGBA(base.marca.color_c);

            // Asignar los nuevos componentes de color a los píxeles
            pixels[i] = r; // componente rojo
            pixels[i + 1] = g; // componente verde
            pixels[i + 2] = b; // componente azul
        }

      }

      // Establecer los datos de píxeles modificados en el canvas
      ctx.putImageData(imageData, 0, 0);

      const drawCircularImage = (image: HTMLImageElement, x: number, y: number, radius: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
      };

      const drawText = (px: number, font: string, color: string, aling : any, text: string, x: number, y: number) => {
        ctx.font = px+'px '+font;
        ctx.fillStyle = color;
        ctx.textAlign = aling;
        ctx.fillText(text, x, y);
      };

      const img1 = new Image();
      img1.crossOrigin = 'Anonymous';
      img1.src = base.marca.logo_allow_origin;
      img1.onload = () => {
        const x1 = base.marco.img1_x;
        const y1 = base.marco.img1_y;
        const radius1 = base.marco.img1_radius;

        if(base.marco.img1_tipo == 1){
          drawCircularImage(img1, x1, y1, radius1);
        }
        
        const img2 = new Image();
        img2.crossOrigin = 'Anonymous';
        img2.src = base.pexels_url;
        img2.onload = () => {
          const x2 = base.marco.img2_x;
          const y2 = base.marco.img2_y;
          const radius2 = base.marco.img2_radius;

          if(base.marco.img2_tipo == 1){
            drawCircularImage(img2, x2, y2, radius2);
          }

          drawText(base.marco.text1_px, base.marco.text1_font, base.marco.text1_color, base.marco.text1_aling, base.marca.nombre, base.marco.text1_x, base.marco.text1_y);
          drawText(base.marco.text2_px, base.marco.text2_font, base.marco.text2_color, base.marco.text2_aling, base.marca.redes[0].text_page_name, base.marco.text2_x, base.marco.text2_y);
          drawText(base.marco.text3_px, base.marco.text3_font, base.marco.text3_color, base.marco.text3_aling, base.marca.user.text_telefono, base.marco.text3_x, base.marco.text3_y);

          // Convertir el canvas en una imagen y mostrarla en la página
          const imgBase64 = canvasEl.toDataURL("image/png");
          this.imgPostBase642 = imgBase64;
          //this.marcosBase642.push(imgBase64);
        };
      };
    };
  }

  // Función para generar un color hexadecimal aleatorio
  getRandomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  // Función para convertir un color hexadecimal a componentes RGBA
  hexToRGBA(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
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

  aplicarCambios(){
    this.loading = true;
    this.setCanvas(this.base);
    setTimeout(()=>{
      this.loading = false;
    },1000);
  }

  modelChangedA(event){
    this.base.marca.color_a = event;
    //this.setCanvas(this.base);
  }

  modelChangedB(event){
    this.base.marca.color_b = event;
    //this.setCanvas(this.base);
  }

  modelChangedC(event){
    this.base.marca.color_c = event;
    //this.setCanvas(this.base);
  }

  getImgPexels(palabra_clave){

    let query = palabra_clave.toLowerCase();
  
    var datos = {};

    var that = this;
    this.loading = true;

    this.api_serv.getQuery(`pexels/imagenes/marco?per_page=1&query=${ query }`)
    .subscribe({
      next(data : any) {
        console.log(data);

        let photos = data.pexels.photos;

        if(photos.length == 3){
          that.base.pexels_url = photos[2].src;
          that.aplicarCambios();
        }else{
          that.showToast('warning', 'Warning!', 'No hay imagenes asociadas');
        }

        that.loading = false;
        

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }

  aprobarMarco(): any {

    try {

      var jpg = this.imgPostBase642.split(',')[1];
      var binary = this.fixBinary(window.atob(jpg));// <-- Usamos la fn "fixBinary"
      var the_file = new Blob([binary], {type: 'image/png'});// <-- Sacamos el encode
      var imagen_firma = new File([the_file], 'imagen_firma.png', { type: 'image/png' });

      const formularioDeDatos = new FormData();
      formularioDeDatos.append('archivo', imagen_firma); 
      formularioDeDatos.append('brand_id', this.selectObj2.id);
      formularioDeDatos.append('frame_base_id', this.base.marco.id);

      this.loading = true;

      var that = this;

      //this.api_serv.postQueryUpload('marcos', formularioDeDatos)
      this.api_serv.postQueryUpload('marcos/con_marco_base', formularioDeDatos)
      .subscribe({
        next(data : any) {
          console.log(data);
          that.loading = false;
          that.showToast('info', 'Info!', data.message);
          that.getMarcosBase(that.selectObj2.id);
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
      this.showToast('error', 'Erro!', 'Error al subir el marco.');
      
    }
  }

  onFileChangeImg2(event): any {
    const archivoCapturado = event.target.files[0]
    this.extraerBase64(archivoCapturado).then((imagen: any) => {
      this.base.pexels_url = imagen.base;
      //console.log(imagen);

    })


    setTimeout(()=>{
      this.aplicarCambios();
    },200);

  }


}
