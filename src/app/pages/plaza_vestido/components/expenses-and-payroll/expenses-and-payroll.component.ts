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

@Component({
  selector: 'app-expenses-and-payroll',
  templateUrl: './expenses-and-payroll.component.html',
  styleUrls: ['./expenses-and-payroll.component.scss']
})
export class ExpensesAndPayrollComponent implements OnInit {

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
  bandera_init2 = false;

  selectObj : any = null;
  selectObjIndex : number = null;

  flag_vista = 1;
  myForm: FormGroup;
  accion : any = null; //0=crear 1=editar

  @ViewChild('modalCrear') modalCrear : ElementRef;
  @ViewChild('modalEliminar') modalEliminar : ElementRef;
  modalRef: any;

  userRole = 0;

  formLista  = { 
    tipo: 'gastos',
  };

  // Filtros
  filtros = {
    fecha_inicio: '',
    fecha_fin: '',
  };

  filtros2 = {
    fecha_inicio: '',
    fecha_fin: '',
  };

  constructor(
      private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private api_serv: SocialApiService,
      public fb: FormBuilder,
      private sesion_serv: SesionService
  ) { 
    this.crearFormulario(0);
  }

  ngOnInit() {
    this.userRole = this.sesion_serv.getUserRol();
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


          if (this.listado[i].monto.toString().indexOf(this.inputTermino.toUpperCase())>=0) {
            this.filteredItems.push(this.listado[i]);
          }else if (this.listado[i].fecha.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
            this.filteredItems.push(this.listado[i]);
          }else if (this.listado[i].concepto.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
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

  //----Tabla 2<
    public listado2: any;
    filteredItems2: any;
    pages2: number = 4;
    pageSize2: number = 20;
    pageNumber2: number = 0;
    currentIndex2: number = 1;
    items2: any;
    pagesIndex2: Array<number>;
    pageStart2: number = 1;
    inputTermino2: string = '';

    init2(){
      this.currentIndex2 = 1;
      this.pageStart2 = 1;
      this.pages2 = 4;

      this.pageNumber2 = parseInt("" + (this.filteredItems2.length / this.pageSize2));
      if(this.filteredItems2.length % this.pageSize2 != 0){
        this.pageNumber2 ++;
      }

      if(this.pageNumber2 < this.pages2){
        this.pages2 = this.pageNumber2;
      }

      this.refreshItems2();
    }

    FilterByTermino2(){
      this.filteredItems2 = [];
      if(this.inputTermino2 != ""){
        for (var i = 0; i < this.listado2.length; ++i) {

          if (this.listado2[i].monto.toString().indexOf(this.inputTermino2.toUpperCase()) >= 0) {
            this.filteredItems2.push(this.listado2[i]);
          } else if (this.listado2[i].fecha.toUpperCase().indexOf(this.inputTermino2.toUpperCase()) >= 0) {
            this.filteredItems2.push(this.listado2[i]);
          } else if (this.listado2[i].concepto.toUpperCase().indexOf(this.inputTermino2.toUpperCase()) >= 0) {
            this.filteredItems2.push(this.listado2[i]);
          } 

        }
      } else {
        this.filteredItems2 = this.listado2;
      }
      this.init2();
    }

    fillArray2(): any{
      var obj2 = new Array();
      for(var index2 = this.pageStart2; index2 < this.pageStart2 + this.pages2; index2 ++) {
        obj2.push(index2);
      }
      return obj2;
    }

    refreshItems2(){
      this.items2 = this.filteredItems2.slice((this.currentIndex2 - 1) * this.pageSize2, (this.currentIndex2) * this.pageSize2);
      this.pagesIndex2 = this.fillArray2();
    }

    prevPage2(){
      if(this.currentIndex2 > 1){
        this.currentIndex2 --;
      } 
      if(this.currentIndex2 < this.pageStart2){
        this.pageStart2 = this.currentIndex2;
      }
      this.refreshItems2();
    }

    nextPage2(){
      if(this.currentIndex2 < this.pageNumber2){
        this.currentIndex2 ++;
      }
      if(this.currentIndex2 >= (this.pageStart2 + this.pages2)){
        this.pageStart2 = this.currentIndex2 - this.pages2 + 1;
      }

      this.refreshItems2();
    }

    setPage2(index2 : number){
      this.currentIndex2 = index2;
      this.refreshItems2();
    }
  //----Tabla 2>

  initComponent(){
    if(!this.bandera_init){
      this.setFechasPorDefecto();
      this.bandera_init = true;
      this.getListado();
    }
  }

  initComponent2(){
    if(!this.bandera_init2){
      this.setFechasPorDefecto2();
      this.bandera_init2 = true;
      this.getListado2();
    }
  }

  setFechasPorDefecto() {
    // ultimos 7 días
    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 7);

    this.filtros.fecha_inicio = this.formatearFecha(hace7dias);
    this.filtros.fecha_fin = this.formatearFecha(hoy);

    // ultimo mes
    // const today = new Date();
    // const year = today.getFullYear();
    // const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11

    // // Fecha inicial del mes actual
    // const startDate = `${year}-${month}-01`;

    // // Fecha final del mes actual
    // const lastDay = new Date(year, today.getMonth() + 1, 0).getDate(); // Obtiene el último día del mes
    // const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    // this.filtros.fecha_inicio = startDate;
    // this.filtros.fecha_fin = endDate;

  }

  setFechasPorDefecto2() {
    // ultimos 7 días
    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 7);

    this.filtros2.fecha_inicio = this.formatearFecha(hace7dias);
    this.filtros2.fecha_fin = this.formatearFecha(hoy);

  }

  formatearFecha(fecha: Date): string {

    // Formatea la fecha en formato 'YYYY-MM-DD', pero primero la convierte a UTC
    return fecha.toISOString().split('T')[0];

    // Formatea la fecha en formato 'YYYY-MM-DD', de forma manual
    // const year = fecha.getFullYear();
    // const month = String(fecha.getMonth() + 1).padStart(2, '0');
    // const day = String(fecha.getDate()).padStart(2, '0');
    
    // return `${year}-${month}-${day}`;
  }

  getListado(): void {

    this.listado = [];
    this.filteredItems = this.listado;
    this.init();

    this.loading = true;
    //this.showToast('info', 'Info!', 'Consultando...');
    
    var that = this;

    let params = new URLSearchParams();

    // Solo agrega al query string si el filtro tiene valor
    if (this.filtros.fecha_inicio) params.append('fecha_inicio', this.filtros.fecha_inicio);
    if (this.filtros.fecha_fin)    params.append('fecha_fin', this.filtros.fecha_fin);

    this.api_serv.getQuery(`plaza_vestido/expenses?${params.toString()}`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.listado = response.data;
        that.filteredItems = that.listado; 
        that.init();  
        that.loading = false; 

        if(that.listado.length == 0){
          that.showToast('info', 'Info!', 'No se encontraron gastos para el rango de fechas seleccionado.');
        }  

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  getListado2(): void {

    this.listado2 = [];
    this.filteredItems2 = this.listado2;
    this.init2();

    this.loading = true;
    //this.showToast('info', 'Info!', 'Consultando...');
    
    var that = this;

    let params = new URLSearchParams();

    // Solo agrega al query string si el filtro tiene valor
    if (this.filtros2.fecha_inicio) params.append('fecha_inicio', this.filtros2.fecha_inicio);
    if (this.filtros2.fecha_fin)    params.append('fecha_fin', this.filtros2.fecha_fin);

    this.api_serv.getQuery(`plaza_vestido/payrolls?${params.toString()}`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.listado2 = response.data;
        that.filteredItems2 = that.listado2; 
        that.init2();  
        that.loading = false; 

        if(that.listado2.length == 0){
          that.showToast('info', 'Info!', 'No se encontraron registros de nómina para el rango de fechas seleccionado.');
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
    this.setFechasPorDefecto();
    this.getListado();
  }

  refreshTabla2(){
    this.setFechasPorDefecto2();
    this.getListado2();
  }

  //accion 0=crear 1=editar
  crearFormulario(accion : number = 0) {

    this.accion = accion;
    this.myForm = this.fb.group({
      fecha  : [new Date().toISOString().substring(0, 10), [ Validators.required ]  ],
      monto  : ['', [ Validators.required, Validators.min(0.01) ]  ],
      concepto  : ['', [ Validators.required, Validators.maxLength(1000) ]  ],
    });    
 
  }

  get fechaNoValido() {
    return this.myForm.get('fecha').invalid && this.myForm.get('fecha').touched
  }

  get montoNoValido() {
    return this.myForm.get('monto').invalid && this.myForm.get('monto').touched
  }

  get conceptoNoValido() {
    return this.myForm.get('concepto').invalid && this.myForm.get('concepto').touched
  }

  aCrear(): void {
    this.accion = 0;
    this.crearFormulario(0);

    this.open(this.modalCrear);
  }

  aEditar(item : any, index: number): void {
    this.accion = 1;
    this.crearFormulario(1);

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    this.myForm.patchValue({fecha : this.selectObj.fecha});
    this.myForm.patchValue({monto : this.selectObj.monto});
    this.myForm.patchValue({concepto : this.selectObj.concepto});

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
      fecha: this.myForm.value.fecha,
      monto: this.myForm.value.monto,
      concepto: this.myForm.value.concepto,
    }

    var that = this;

    let endpoint = '';
    if(this.formLista.tipo === 'gastos'){
      endpoint = 'expenses';
    }else if(this.formLista.tipo === 'nomina'){
      endpoint = 'payrolls';
    }

    this.api_serv.postQuery(`plaza_vestido/${endpoint}`, datos)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

        if(that.formLista.tipo === 'gastos'){
          that.getListado();
        }else if(that.formLista.tipo === 'nomina'){
          that.getListado2();
        }

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
      fecha: this.myForm.value.fecha,
      monto: this.myForm.value.monto,
      concepto: this.myForm.value.concepto,
    }

    var that = this;

    let endpoint = '';
    if(this.formLista.tipo === 'gastos'){
      endpoint = 'expenses';
    }else if(this.formLista.tipo === 'nomina'){
      endpoint = 'payrolls';
    }

    this.api_serv.putQuery(`plaza_vestido/${endpoint}/${ this.selectObj.id }`, datos)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

        if(that.formLista.tipo === 'gastos'){
          that.getListado();
        }else if(that.formLista.tipo === 'nomina'){
          that.getListado2();
        }

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

    let endpoint = '';
    if(this.formLista.tipo === 'gastos'){
      endpoint = 'expenses';
    }else if(this.formLista.tipo === 'nomina'){
      endpoint = 'payrolls';
    }

    this.api_serv.deleteQuery(`plaza_vestido/${endpoint}/${ this.selectObj.id }`)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

        if(that.formLista.tipo === 'gastos'){
          that.getListado();
        }else if(that.formLista.tipo === 'nomina'){
          that.getListado2();
        }

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

}
