import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { SocialApiService } from '../../../../services/social/api/api.service';

import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs';

import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {

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

  //tipo = null;

  private data:any;
  public loading = false;

  bandera_init = false;

  selectObj : any = null;
  selectObjIndex : number = null;
  selectObjIndex2 : number = null;

  flag_vista = 1;
  myForm: FormGroup;
  accion : any = null; //0=crear 1=editar

  @ViewChild('modalCrear') modalCrear : ElementRef;
  @ViewChild('modalEliminar') modalEliminar : ElementRef;
  modalRef: any;

  constructor(
      private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private api_serv: SocialApiService,
      public fb: FormBuilder,
  ) { 
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

  //Abrir modal por defecto
  open(modal) {
    this.modalRef = this.modalService.open(modal);
  }

  //Abrir modal larga
  open2(modal) {
    this.modalRef = this.modalService.open(modal , { size: 'lg', backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  //Abrir modal estatica
  open3(modal) {
    this.modalRef = this.modalService.open(modal , { size: 'sm', backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  tratarError(msg : any){

    const errorMsg = (msg.error && msg.error.message) || 
                   (msg.error && msg.error.error) || 
                   'Ocurrió un error inesperado';

    //token invalido/ausente o token expiro
    if(msg.status == 400 || msg.status == 401){ 
        this.showToast('warning', 'Warning!', errorMsg);
    }
    else if(msg.status == 404){ 
        this.showToast('info', 'Info!', errorMsg);
    }
    else{ 
        this.showToast('error', 'Erro!', errorMsg);
    }

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

        if (this.listado[i].nombre.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].email && this.listado[i].email.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
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
      this.bandera_init = true;
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

    this.api_serv.getQuery(`plaza_vestido/employees`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.listado = response.data;
        that.filteredItems = that.listado; 
        that.init();  
        that.loading = false; 

        if(that.listado.length == 0){
          that.showToast('info', 'Info!', 'No tienes empleados registrados.');
        }  

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

  //accion 0=crear 1=editar
  crearFormulario(accion : number = 0) {

    this.accion = accion;

    if(accion == 0){
      this.myForm = this.fb.group({
        nombre  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
        email  : ['', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
        password  : ['', [ Validators.required, Validators.maxLength(50) ]  ],       
        password2  : ['', [ Validators.required, Validators.maxLength(50) ]  ],
      });

    }else {

      this.myForm = this.fb.group({
        nombre  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
        email  : ['', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
        password  : ['', [ Validators.maxLength(50) ]  ],       
        password2  : ['', [ Validators.maxLength(50) ]  ],
      });

    }  
 
  }

  get nombreNoValido() {
    return this.myForm.get('nombre').invalid && this.myForm.get('nombre').touched
  }

  get emailNoValido() {
    return this.myForm.get('email').invalid && this.myForm.get('email').touched
  }

  get passwordNoValido() {
    return this.myForm.get('password').invalid && this.myForm.get('password').touched
  }

  get password2NoValido() {
    const password = this.myForm.get('password').value;
    const password2 = this.myForm.get('password2').value;

    return ( password === password2 ) ? false : true;
  }

  aCrear(): void {
    this.accion = 0;
    this.crearFormulario(0);

    this.open(this.modalCrear);
  }

  aEditar(item, index: number): void {
    this.accion = 1;
    this.crearFormulario(1);

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    this.myForm.patchValue({nombre : this.selectObj.nombre});
    this.myForm.patchValue({email : this.selectObj.email});
    this.myForm.patchValue({password : ''});
    this.myForm.patchValue({password2 : ''});

    this.open(this.modalCrear);
  }

  aEliminar(item, index: number): void {
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
    this.open(this.modalEliminar);
  }

  guardar(): void {
    console.log( this.myForm );

    if ( this.myForm.invalid) {

      this.showToast('warning', 'Warning!', 'Ingresa los campos requeridos correctamente.');

      return Object.values( this.myForm.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{

      if (this.accion == 0) {
        if (this.myForm.value.password != this.myForm.value.password2) {
          this.showToast('error', 'Erro!', 'Las contraseñas de coinciden.');  
        }else{
          this.crear();
        }
        
      }else if (this.accion == 1) {

        if(this.myForm.value.password != '' || this.myForm.value.password2 != ''){
          if (this.myForm.value.password != this.myForm.value.password2) {
            this.showToast('error', 'Erro!', 'Las contraseñas de coinciden.');  
          }else{
            this.editar();
          }
        }else{
          this.editar();
        }
        
      }
      
    }
  }

  crear(): void {

    this.loading = true;
   
    var datos= {
      nombre: this.myForm.value.nombre,
      email: this.myForm.value.email,
      password: this.myForm.value.password,
    }

    var that = this;

    this.api_serv.postQuery(`plaza_vestido/employees`, datos)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

        that.getListado();

        if (that.modalRef) {
          that.modalRef.close();
        }
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
   
    var datos= {
      nombre: this.myForm.value.nombre,
      email: this.myForm.value.email,
      password: this.myForm.value.password,
    }

    var that = this;

    this.api_serv.putQuery(`plaza_vestido/employees/${ this.selectObj.id }`, datos)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

        that.getListado();

        if (that.modalRef) {
          that.modalRef.close();
        }
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  eliminar(): void {

    this.loading = true;

    var that = this;

    this.api_serv.deleteQuery(`plaza_vestido/employees/${ this.selectObj.id }`)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

        that.getListado();

        if (that.modalRef) {
          that.modalRef.close();
        }
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  ChangeStatus(obj : any){
    this.setStatus(obj);
  }

  setStatus(obj : any){

    let status_aux = null;

    if(!obj.status){
      status_aux = 0;
    }else if(obj.status){
      status_aux = 1;
    }

    this.loading = true;
    //this.showToast('info', 'Info!', 'Consultando...');
    
    var datos = {
      status : status_aux,
    };

    var that = this;

    this.api_serv.putQuery(`usuarios/status/${obj.id}`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

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
