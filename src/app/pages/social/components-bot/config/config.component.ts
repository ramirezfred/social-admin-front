import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';

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
  selector: 'bot-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class BotConfigComponent implements OnInit {

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

  myForm: FormGroup;
  accion : any = null; //0=crear 1=editar
  @ViewChild('modalConfig') modalConfig : ElementRef;

  selectObj : any = null;
  selectObjIndex : number = null;
  selectObjIndex2 : number = null;

  bot_id = 1;

  constructor(private modalService: NgbModal,
         private toasterService: ToasterService,
         private router: Router,
         public fb: FormBuilder,
         public themeService:NbThemeService,
         private api_serv: SocialApiService,
         private sanitizer: DomSanitizer,) { 

    this.crearFormulario(0);

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
    this.modalService.open(modal , { size: 'lg', container: 'nb-layout'});
  }

  //Abrir modal estatica
  open3(modal) {
    this.modalService.open(modal , { size: 'sm', backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  //----Tabla<
  public listado:any;
  filteredItems : any;
  pages : number = 4;
  pageSize : number = 20;
  pageNumber : number = 0;
  currentIndex : number = 1;
  items: any;
  pagesIndex : Array<number>;
  pageStart : number = 1;
  inputTermino : string = '';

  init(){
    this.currentIndex = 1;
    this.pageStart = 1;
    this.pages = 4;

    this.pageNumber = parseInt(""+ (this.filteredItems.length / this.pageSize));
    if(this.filteredItems.length % this.pageSize != 0){
      this.pageNumber ++;
    }

    if(this.pageNumber  < this.pages){
         this.pages =  this.pageNumber;
    }

    this.refreshItems();
    //console.log("this.pageNumber :  "+this.pageNumber);
  }

  FilterByTermino(){
    this.filteredItems = [];
    if(this.inputTermino != ""){
      for (var i = 0; i < this.listado.length; ++i) {

        if(!this.listado[i].rfc){
          this.listado[i].rfc = '';
        }

        if (this.listado[i].palabra_clave.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].prompt.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }

      }
    }else{
      this.filteredItems = this.listado;
    }
    //console.log(this.filteredItems);
    this.init();
  }
  fillArray(): any{
    var obj = new Array();
    for(var index = this.pageStart; index< this.pageStart + this.pages; index ++) {
      obj.push(index);
    }
    return obj;
  }
  refreshItems(){
    this.items = this.filteredItems.slice((this.currentIndex - 1)*this.pageSize, (this.currentIndex) * this.pageSize);
    this.pagesIndex =  this.fillArray();
  }
  prevPage(){
    if(this.currentIndex>1){
      this.currentIndex --;
    } 
    if(this.currentIndex < this.pageStart){
      this.pageStart = this.currentIndex;
    }
    this.refreshItems();
  }
  nextPage(){
    if(this.currentIndex < this.pageNumber){
      this.currentIndex ++;
    }
    if(this.currentIndex >= (this.pageStart + this.pages)){
       this.pageStart = this.currentIndex - this.pages + 1;
    }

    this.refreshItems();
  }
  setPage(index : number){
    this.currentIndex = index;
    this.refreshItems();
  }
  //----Tabla>

  initComponent(){
    if(!this.bandera_init){
      this.bandera_init = 1;
      this.getListado();
    }
  }


  getListado(): void {

    this.listado = [];
    this.filteredItems = this.listado;
    this.init();

    this.loading = true;
    //this.showToast('info', 'Info!', 'Consultando...');
    
    var that = this;

    this.api_serv.getQuery(`bots_config/bot/${this.bot_id}`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.config;
        that.filteredItems = that.listado; 
        that.init();  
        that.loading = false;   

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

  atras(): void {
    this.accion = null;
    this.selectObj = null;
    this.selectObjIndex = null;
    this.selectObjIndex2 = null;
  }


  aCrear(): void {
    this.accion = 0;
    this.crearFormulario(0);

    this.open(this.modalConfig);
  }

  aEditar(item, index: number): void {
    this.accion = 1;
    this.crearFormulario(1);

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    this.myForm.patchValue({palabra_clave : this.selectObj.palabra_clave});
    this.myForm.patchValue({prompt : this.selectObj.prompt});

    this.open(this.modalConfig);
  }

  //accion 0=crear 1=editar
  crearFormulario(accion : number = 0) {

    if (accion == 0) {

      this.accion = accion;
      this.myForm = this.fb.group({
        palabra_clave  : ['', [ Validators.required, Validators.compose([Validators.minLength(3),Validators.maxLength(20)]) ]  ],
        prompt  : ['', [ Validators.required, Validators.compose([Validators.minLength(10),Validators.maxLength(4800)]) ]  ],
      });    
    
    }else{
      this.accion = accion;
      this.myForm = this.fb.group({
        palabra_clave  : ['', [ Validators.required, Validators.compose([Validators.minLength(3),Validators.maxLength(20)]) ]  ],
        prompt  : ['', [ Validators.required, Validators.compose([Validators.minLength(10),Validators.maxLength(4800)]) ]  ],
      }); 
    }
    
  }

  cargarDataMyForm(){
    this.myForm.patchValue({palabra_clave : ''});
    this.myForm.patchValue({prompt : ''});

    Object.values( this.myForm.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

  }

  palabra_claveKeyup(){
    let mayus = this.myForm.value.palabra_clave;
    mayus = mayus.toString().toUpperCase();
    let cadenaSinEspacios = mayus.replace(/\s/g, "");
    this.myForm.patchValue({palabra_clave : cadenaSinEspacios});
  }

  get palabra_claveNoValido() {
    return this.myForm.get('palabra_clave').invalid && this.myForm.get('palabra_clave').touched
  }

  get promptNoValido() {
    return this.myForm.get('prompt').invalid && this.myForm.get('prompt').touched
  }

  guardar(){

    if ( this.myForm.invalid ) {

      return Object.values( this.myForm.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{

      if (this.accion == 0) {
        this.crear();
      }else if (this.accion == 1) {
        this.editar();
      }

    }
  }

  crear(): void {

    this.loading = true;
   
    var datos= {
      bot_id: this.bot_id,
      palabra_clave: this.myForm.value.palabra_clave,
      prompt: this.myForm.value.prompt,
    }

    var that = this;

    this.api_serv.postQuery(`bots_config`, datos)
    .subscribe({
      next(data : any) {
           
        console.log(data);
        that.data=data;
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);

        //para cerrar la modal
        let click_event = new CustomEvent('click');
        let btn_element = document.querySelector('#btnAtras');
        btn_element.dispatchEvent(click_event);

        that.cargarDataMyForm();
        that.getListado();
        that.atras();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  editar(): void {

    this.loading = true;

    var datos = {
      palabra_clave : this.myForm.value.palabra_clave,
      prompt : this.myForm.value.prompt,
    };

    var that = this;

    this.api_serv.putQuery(`bots_config/${ this.selectObj.id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);

        //para cerrar la modal
        let click_event = new CustomEvent('click');
        let btn_element = document.querySelector('#btnAtras');
        btn_element.dispatchEvent(click_event);

        that.getListado();
        that.atras();

      },
      error(msg) {
        console.log(msg);

        that.tratarError(msg);

      }
    });

  }

  aEliminar(item, index: number): void {
    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
  }

  eliminar(): void {

    this.loading = true;

    var that = this;

    this.api_serv.deleteQuery(`bots_config/${ this.selectObj.id }`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        //that.listado.splice(that.selectObjIndex, 1);
        for (var i = 0; i < that.listado.length; ++i) {
          if(that.listado[i].id == that.selectObj.id){
            that.listado.splice(i, 1);
          }
        }

        that.filteredItems = that.listado;
        that.init();
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);
        that.atras();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }
 

}
