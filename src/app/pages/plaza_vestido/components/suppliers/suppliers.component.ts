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

import { SesionService } from '../../../../services/sesion/sesion.service';

interface Semana {
  fecha_inicio: Date;
  fecha_fin: Date;
  label: string;
  value: string;
};

interface EstadisticasResponse {
  supplier_id: number;
  razon_social: string;
  total_vendido: string;
  total_deuda: string;
};

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {

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
  @ViewChild('modalGenerado') modalGenerado : ElementRef;
  modalRef: any;

  userRole = 0;

  estadisticas: EstadisticasResponse | null = null;
  semanas: Semana[] = [];
  semanaSeleccionada: string = '';
  
  formFechas: FormGroup;

  constructor(
      private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private api_serv: SocialApiService,
      public fb: FormBuilder,
      private sesion_serv: SesionService
  ) { 
    this.crearFormulario(0);

    this.formFechas = this.fb.group({
      fecha_inicio: [''],
      fecha_fin: ['']
    });
  }

  ngOnInit() {
    this.userRole = this.sesion_serv.getUserRol();

    this.generarSemanas();
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

  //#region Tabla
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


        if (this.listado[i].id.toString().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].razon_social.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].email && this.listado[i].email.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].telefono && this.listado[i].telefono.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].contacto && this.listado[i].contacto.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].categoria && this.listado[i].categoria.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
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
  //#endregion

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

    this.api_serv.getQuery(`plaza_vestido/suppliers`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.listado = response.data;
        that.filteredItems = that.listado; 
        that.init();  
        that.loading = false; 

        if(that.listado.length == 0){
          that.showToast('info', 'Info!', 'No tienes proveedores registrados.');
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
    this.myForm = this.fb.group({

      razon_social  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
      email  : ['', [ Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
      telefono  : ['', [ Validators.pattern('^[0-9]+$') ]  ],
      direccion  : ['', [ Validators.maxLength(1000) ]  ],
      contacto  : ['', [ Validators.maxLength(250) ]  ],
      categoria  : ['', [ Validators.maxLength(250) ]  ],

    });    
 
  }

  get razon_socialNoValido() {
    return this.myForm.get('razon_social').invalid && this.myForm.get('razon_social').touched
  }

  get emailNoValido() {
    return this.myForm.get('email').invalid && this.myForm.get('email').touched
  }

  get telefonoNoValido() {
    return this.myForm.get('telefono').invalid && this.myForm.get('telefono').touched
  }

  get direccionNoValido() {
    return this.myForm.get('direccion').invalid && this.myForm.get('direccion').touched
  }

  get contactoNoValido() {
    return this.myForm.get('contacto').invalid && this.myForm.get('contacto').touched
  }

  get categoriaNoValido() {
    return this.myForm.get('categoria').invalid && this.myForm.get('categoria').touched
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

    this.myForm.patchValue({razon_social : this.selectObj.razon_social});
    this.myForm.patchValue({email : this.selectObj.email});
    this.myForm.patchValue({telefono : this.selectObj.telefono});
    this.myForm.patchValue({direccion : this.selectObj.direccion});
    this.myForm.patchValue({contacto : this.selectObj.contacto});
    this.myForm.patchValue({categoria : this.selectObj.categoria});

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
        this.crear();
      }else if (this.accion == 1) {
        this.editar();
      }
      
    }
  }

  crear(): void {

    this.loading = true;
   
    var datos= {
      user_id : this.sesion_serv.getUserId(),
      razon_social: this.myForm.value.razon_social,
      email: this.myForm.value.email,
      telefono: this.myForm.value.telefono,
      direccion: this.myForm.value.direccion,
      contacto : this.myForm.value.contacto,
      categoria : this.myForm.value.categoria,
    }

    var that = this;

    this.api_serv.postQuery(`plaza_vestido/suppliers`, datos)
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
      razon_social: this.myForm.value.razon_social,
      email: this.myForm.value.email,
      telefono: this.myForm.value.telefono,
      direccion: this.myForm.value.direccion,
      contacto : this.myForm.value.contacto,
      categoria : this.myForm.value.categoria,
    }

    var that = this;

    this.api_serv.putQuery(`plaza_vestido/suppliers/${ this.selectObj.id }`, datos)
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

    this.api_serv.deleteQuery(`plaza_vestido/suppliers/${ this.selectObj.id }`)
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

  //#region Generado por semana

  getGenerado(item : any, index: number): void {
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
    this.seleccionarSemanaActual();
    this.open2(this.modalGenerado);
  }

  generarSemanas() {
    const hoy = new Date();
    const semanaActual = this.getSemanaActual();
    this.semanas.push(semanaActual);
    
    let fechaReferencia = new Date(semanaActual.fecha_inicio);
    for (let i = 1; i <= 5; i++) {
      fechaReferencia = new Date(fechaReferencia);
      fechaReferencia.setDate(fechaReferencia.getDate() - 7);
      
      const semanaAnterior: Semana = {
        fecha_inicio: new Date(fechaReferencia),
        fecha_fin: new Date(fechaReferencia),
        label: '',
        value: ''
      };
      semanaAnterior.fecha_fin.setDate(semanaAnterior.fecha_fin.getDate() + 6);
      semanaAnterior.label = this.formatSemanaLabel(semanaAnterior);
      semanaAnterior.value = `${this.formatDateForInput(semanaAnterior.fecha_inicio)}|${this.formatDateForInput(semanaAnterior.fecha_fin)}`;
      
      this.semanas.push(semanaAnterior);
    }
  }

  getSemanaActual(): Semana {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    
    let diasParaViernes;
    if (diaSemana === 5) {
      diasParaViernes = 0;
    } else if (diaSemana === 6) {
      diasParaViernes = -1;
    } else {
      diasParaViernes = -(diaSemana + 2);
    }
    
    const fechaInicio = new Date(hoy);
    fechaInicio.setDate(hoy.getDate() + diasParaViernes);
    
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaInicio.getDate() + 6);
    
    return {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      label: this.formatSemanaLabel({ fecha_inicio: fechaInicio, fecha_fin: fechaFin } as Semana),
      value: `${this.formatDateForInput(fechaInicio)}|${this.formatDateForInput(fechaFin)}`
    };
  }

  formatSemanaLabel(semana: Semana): string {
    const inicio = `${semana.fecha_inicio.getDate().toString().padStart(2, '0')}/${(semana.fecha_inicio.getMonth() + 1).toString().padStart(2, '0')}`;
    const fin = `${semana.fecha_fin.getDate().toString().padStart(2, '0')}/${(semana.fecha_fin.getMonth() + 1).toString().padStart(2, '0')}`;
    return `${inicio} - ${fin}`;
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  seleccionarSemanaActual() {
    const semanaActual = this.semanas[0];
    this.semanaSeleccionada = semanaActual.value;
    this.formFechas.patchValue({
      fecha_inicio: this.formatDateForInput(semanaActual.fecha_inicio),
      fecha_fin: this.formatDateForInput(semanaActual.fecha_fin)
    });
    this.consultarEstadisticas();
  }

  onSemanaChange(event: any) {
    const [fechaInicio, fechaFin] = event.target.value.split('|');
    if (fechaInicio && fechaFin) {
      this.formFechas.patchValue({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      });
      this.consultarEstadisticas();
    }
  }

  consultarEstadisticas() {
    const fechas = this.formFechas.value;
    if (!fechas.fecha_inicio || !fechas.fecha_fin) {
      return;
    }

    this.estadisticas = null;

    this.loading = true;
    
    var that = this;

    let params = new URLSearchParams();

    params.append('fecha_inicio', fechas.fecha_inicio);
    params.append('fecha_fin', fechas.fecha_fin);

    this.api_serv.getQuery(`plaza_vestido/suppliers/${this.selectObj.id}/generado-por-semana?${params.toString()}`)
    .subscribe({
      next(response : any) {
        console.log(response);
        if(response.data){
          that.estadisticas = response.data;
        }/*else{
          that.showToast('info', 'Info!', response.message);
        }*/
         
        that.loading = false; 

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  aplicarFechasManuales() {
    if (this.formFechas.valid) {
      this.semanaSeleccionada = '';
      this.consultarEstadisticas();
    }
  }

  limpiar(){
    this.seleccionarSemanaActual(); // Recarga con el filtro
  }

  //#endregion

}
