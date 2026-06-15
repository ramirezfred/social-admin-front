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
  selector: 'app-cash-closes',
  templateUrl: './cash-closes.component.html',
  styleUrls: ['./cash-closes.component.scss']
})
export class CashClosesComponent implements OnInit {

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

  @ViewChild('modalCorte') modalCorte : ElementRef;
  @ViewChild('modalCorteByC') modalCorteByC : ElementRef;
  modalRef: any;

  userRole = 0;

  formLista  = { 
    tipo: 'cortes',
  };

  // Filtros  
  filtros2 = {
    fecha_inicio: '',
    fecha_fin: '',
  };

  globales: any = {};

  corte: any = null;
  selectProveedor: any = null;

  formPago = { 
    tipo: 'efectivo', 
  };

  constructor(
      private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private api_serv: SocialApiService,
      public fb: FormBuilder,
      private sesion_serv: SesionService
  ) { 
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

          if (this.listado[i].razon_social.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
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

          if (this.listado2[i].id.toString().indexOf(this.inputTermino2.toUpperCase()) >= 0) {
            this.filteredItems2.push(this.listado2[i]);
          } else if (this.listado2[i].monto.toString().indexOf(this.inputTermino2.toUpperCase()) >= 0) {
            this.filteredItems2.push(this.listado2[i]);
          } else if (this.listado2[i].created_at.toUpperCase().indexOf(this.inputTermino2.toUpperCase()) >= 0) {
            this.filteredItems2.push(this.listado2[i]);
          } else if (this.listado2[i].tipo.toUpperCase().indexOf(this.inputTermino2.toUpperCase()) >= 0) {
            this.filteredItems2.push(this.listado2[i]);
          } else if (this.listado2[i].supplier && this.listado2[i].supplier.razon_social && this.listado2[i].supplier.razon_social.toUpperCase().indexOf(this.inputTermino2.toUpperCase()) >= 0) {
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
      this.bandera_init = true;
      this.getGlobalCuts();
      this.getPendingSuppliers();
    }
  }

  initComponent2(){
    if(!this.bandera_init2){
      this.setFechasPorDefecto2();
      this.bandera_init2 = true;
      this.getListado2();
    }
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

  getPendingSuppliers(): void {

    this.listado = [];
    this.filteredItems = this.listado;
    this.init();

    this.loading = true;
    var that = this;

    this.api_serv.getQuery(`plaza_vestido/cash-closes/proveedores-pendientes`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.listado = response.data;
        that.filteredItems = that.listado; 
        that.init();  
        that.loading = false; 

        if(that.listado.length == 0){
          that.showToast('info', 'Info!', 'No se encontraron deudas pendientes a proveedores.');
        }  

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  getGlobalCuts(): void {

    this.loading = true;
    var that = this;

    this.api_serv.getQuery(`plaza_vestido/cash-closes/globales`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.globales = response;
        that.loading = false; 

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

    this.api_serv.getQuery(`plaza_vestido/cash-closes?${params.toString()}`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.listado2 = response.data;
        that.filteredItems2 = that.listado2; 
        that.init2();  
        that.loading = false; 

        if(that.listado2.length == 0){
          that.showToast('info', 'Info!', 'No se encontraron registros de corte para el rango de fechas seleccionado.');
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
    this.getGlobalCuts();
    this.getPendingSuppliers();
  }

  refreshTabla2(){
    this.setFechasPorDefecto2();
    this.getListado2();
  }

  // Corte de caja a proveedor
  aCortarA(supplier: any): void {

    if (Number(supplier.total_deuda) <= 0) {
      this.showToast('info', 'Info!', 'El proveedor seleccionado no tiene deuda pendiente.');
      return;
    }

    this.corte = 'A';
    this.selectProveedor = null;

    this.formPago = { 
      tipo: '', 
    };

    this.loading = true;
    var that = this;

    this.loading = true;
    var that = this;

    this.api_serv.getQuery(`plaza_vestido/cash-closes/proveedores-pendientes`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.listado = response.data;
        that.filteredItems = that.listado; 
        that.init();  
        that.loading = false; 

        if(that.listado.length == 0){
          that.showToast('info', 'Info!', 'No se encontraron deudas pendientes a proveedores.');
        } else {

          const proveedor = that.listado.find((item: any) => item.supplier_id === supplier.supplier_id);

          if (!proveedor) {
            that.showToast('error', 'Error!', 'Proveedor no encontrado.');
            return;
          }

          if (Number(proveedor.total_deuda) <= 0) {
            that.showToast('info', 'Info!', 'El proveedor seleccionado no tiene deuda pendiente.');
            return;
          }

          that.selectProveedor = proveedor;
          that.open(that.modalCorteByC);
        } 

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  aCortarBoC(corte: any): void {
    this.corte = corte;

    this.loading = true;
    var that = this;

    this.api_serv.getQuery(`plaza_vestido/cash-closes/globales`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.globales = response;
        that.loading = false; 

        if(that.corte === 'B'){
          if(!that.globales || that.globales.corte_ingresos_gastos === undefined || that.globales.corte_ingresos_gastos === null ){
            that.showToast('info', 'Info!', 'No hay datos disponibles para ejecutar el corte.');
            that.corte = null;
            return;
          } else if( that.globales.total_comision_b == 0 ){
            that.showToast('info', 'Info!', 'Para ejecutar el corte la comisión debe ser mayor a cero.');
            that.corte = null;
            return;
          } else {
            that.open(that.modalCorteByC);
          }
        } else if(that.corte === 'C'){
          if(
            !that.globales || that.globales.corte_comision_envios === undefined 
            || that.globales.corte_comision_envios === null || that.globales.corte_comision_envios <= 0
          ){
            that.showToast('info', 'Info!', 'Para ejecutar el corte el acumulado debe ser mayor a cero.');
            that.corte = null;
            return;
          } else {
            that.open(that.modalCorteByC);
          }
        }

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  ejecutarCorte(): void {
    if(this.corte === 'A'){
      this.ejecutarCorteA();
    }else if(this.corte === 'B' || this.corte === 'C'){
      this.ejecutarCorteBoC();
    }else{
      this.showToast('error', 'Error!', 'Tipo de corte no válido.');
      return;
    }
  }

  ejecutarCorteA(): void {

    this.loading = true;
   
    var datos= {
      supplier_id : this.selectProveedor.supplier_id,
      payment_method : this.formPago.tipo,
    }

    var that = this;

    this.api_serv.postQuery(`plaza_vestido/cash-closes/corte-proveedor`, datos)
    .subscribe({
      next(response : any) {
           
        console.log(response);
        that.showToast('success', 'Success!', response.message);

        that.loading = false;
        that.corte = null;

        if (that.modalRef) {
          that.modalRef.close();
        }

        that.listado = that.listado.filter((item : any) => item.supplier_id !== that.selectProveedor.supplier_id);
        that.filteredItems = that.listado; 
        that.init();

        that.selectProveedor.total_deuda = 0;
        that.selectProveedor.total_vendido = 0;
        that.selectProveedor = null;

        var objeto_window_referencia;
        var configuracion_ventana = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
        objeto_window_referencia = window.open(response.data.pdf, "PDF", configuracion_ventana);

        
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  ejecutarCorteBoC(): void {

    this.loading = true;
   
    var datos= {
    }

    var that = this;

    let endpoint = '';
    if(this.corte === 'B'){
      endpoint = 'corte-ingresos-gastos';
    }else if(this.corte === 'C'){
      endpoint = 'corte-comision-envios';
    }else{
      that.showToast('error', 'Error!', 'Tipo de corte no válido.');
      that.loading = false;
      return;
    }

    this.api_serv.postQuery(`plaza_vestido/cash-closes/${endpoint}`, datos)
    .subscribe({
      next(response : any) {
           
        console.log(response);
        that.showToast('success', 'Success!', response.message);

        that.loading = false;
        that.corte = null;

        if (that.modalRef) {
          that.modalRef.close();
        }

        that.getGlobalCuts();
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  obtenerCadena(tipo: string): string {
    switch(tipo) {
      case 'ingresos_gastos':
        return 'Ingresos - Gastos';
      case 'comision_envios':
        return 'Comisión + Envíos';
      case 'proveedor':
        return 'Proveedor';
      default:
        return 'Tipo desconocido';
    }
  }

  detalles(item : any, index: number): void {

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    this.open(this.modalCorte);
  }

  descargarComprobante(item : any){
    var objeto_window_referencia;
    var configuracion_ventana = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
    objeto_window_referencia = window.open(item.pdf, "PDF", configuracion_ventana);
  }


}
