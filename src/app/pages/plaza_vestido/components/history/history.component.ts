import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { SocialApiService } from '../../../../services/social/api/api.service';

import { RutaBaseService } from '../../../../services/ruta-base/ruta-base.service';
import { UploadService } from '../../../../services/upload-service/upload.service';

import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs';

import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';
import { color } from 'd3-color';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

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
  public loading = false;

  objAPagar: any;
  pagar_id: any;

  objAFinalizar: any;
  finalizar_id: any;

  bandera_init = false;

  flag_vista = 1; //1: vista principal, 2: vista detalle cotizacion
  myForm: FormGroup;
  accion : any = null; //0=crear 1=editar

  myFormConcepto: FormGroup;
  flag_new_concepto = false;

  conceptos : any [] = [];

  //Totales
  Subtotal = 0;
  Descuento = 0;
  Impuesto = 0;
  Envio = '';
  Total = 0;

  flag_edit_concepto = false;
  concepto_id = null;

  public impuestos = [
    {text : 'IVA 0%', value : 0},
    {text : 'IVA 16%', value : 16}
  ];

  suppliers : any [] = [];

  selectObj : any = null;
  selectObjIndex : number = null;
  selectObjIndex2 : number = null;

  // --- Propiedades Pagos Detalles ---
  cotizacionSeleccionada: any = null;
  modalDetalleVisible = false;

  modalRef: any;
  @ViewChild('modalDetalle') modalDetalle : ElementRef;

  formEntrega  = { tipo: '' };
  formFinalizar = { tipo_entrega: '' };

  // Filtros
  filtros = {
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'finalizada',
  };

  constructor(private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private rutaService: RutaBaseService,
      private uploadService:UploadService,
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


        if (this.listado[i].folio.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].cliente.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].email && this.listado[i].email.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].telefono && this.listado[i].telefono.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
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
      this.setFechasPorDefecto();
      this.bandera_init = true;
      this.getListado();
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
    if (this.filtros.estado)       params.append('estado', this.filtros.estado);

    this.api_serv.getQuery(`plaza_vestido/quotes?${params.toString()}`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.listado = response.data;
        that.filteredItems = that.listado; 
        that.init();  
        that.loading = false; 

        if(that.listado.length == 0){
          that.showToast('info', 'Info!', 'No se encontraron cotizaciones para el rango de fechas seleccionado.');
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

  atras(){
    this.flag_vista = 1;
  }

  //accion 0=crear 1=editar
  crearFormulario(accion : number = 0) {

    this.accion = accion;
    this.myForm = this.fb.group({

      moneda  : ['MXN', [ Validators.required ]  ],
      cliente  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
      email  : ['', [ Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
      telefono  : ['', [ Validators.required, Validators.pattern('^[0-9]+$') ]  ],
      notas  : ['', [ Validators.maxLength(250) ]  ],

      subtotal  : ['', [ Validators.required, Validators.min(0) ]  ],
      impuesto  : ['', [ Validators.min(0) ]  ],
      descuento  : ['', [ Validators.min(0) ]  ],
      envio  : ['', [ Validators.min(0) ]  ],
      total  : ['', [ Validators.required, Validators.min(0) ]  ],

    });   
    
    this.myForm.controls['subtotal'].disable();
    this.myForm.controls['total'].disable();
 
  }

  get monedaNoValido() {
    return this.myForm.get('moneda').invalid && this.myForm.get('moneda').touched
  }

  get clienteNoValido() {
    return this.myForm.get('cliente').invalid && this.myForm.get('cliente').touched
  }

  get emailNoValido() {
    return this.myForm.get('email').invalid && this.myForm.get('email').touched
  }

  get telefonoNoValido() {
    return this.myForm.get('telefono').invalid && this.myForm.get('telefono').touched
  }

  get notasNoValido() {
    return this.myForm.get('notas').invalid && this.myForm.get('notas').touched
  }

  get subtotal1NoValido() {
    return this.myForm.get('subtotal').invalid && this.myForm.get('subtotal').touched
  }

  get envioNoValido() {
    return this.myForm.get('envio').invalid && this.myForm.get('envio').touched
  }

  get totalNoValido() {
    return this.myForm.get('total').invalid && this.myForm.get('total').touched
  }

  aEditar(item, index: number): void {
    this.accion = 1;
    this.crearFormulario(1);

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    this.myForm.patchValue({moneda : this.selectObj.moneda});
    this.myForm.patchValue({cliente : this.selectObj.cliente});
    this.myForm.patchValue({email : this.selectObj.email});
    this.myForm.patchValue({telefono : this.selectObj.telefono});
    this.myForm.patchValue({notas : this.selectObj.notas});
    this.myForm.patchValue({subtotal : this.selectObj.subtotal});
    this.myForm.patchValue({impuesto : this.selectObj.impuesto});
    this.myForm.patchValue({descuento : this.selectObj.descuento});
    this.myForm.patchValue({envio : this.selectObj.envio});
    this.myForm.patchValue({total : this.selectObj.total});

    this.conceptos = this.selectObj.detalles ? this.selectObj.detalles : [];

    this.flag_vista = 2;

  }

  /* Inicio Conceptos de la Compra */


  // Función auxiliar para limpiar el código
  esNumeroValido(val: any): boolean {
    return val !== null && val !== '' && val >= 0;
  }

  getNombreProveedor(id: number): string {
    const proveedor = this.suppliers.find(s => s.id == id);
    return proveedor ? proveedor.razon_social : 'No asignado';
  }

  envioKeyup(){
    // this.calcularTotales();
  }

  /* Fin Conceptos de la Compra */

  descargarComprobante(orden:any): void {

    this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`plaza_vestido/quotes/${ orden.id }/ticket`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.loading = false; 

        var objeto_window_referencia;
        var configuracion_ventana = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
        objeto_window_referencia = window.open(response.data, "PDF", configuracion_ventana);

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  // --- Modal Detalle ---
  abrirModalDetalle(cotizacion: any) {
    this.cotizacionSeleccionada = cotizacion;
    this.modalDetalleVisible    = true;
    this.open(this.modalDetalle);
  }

  cerrarModalDetalle() {
    this.modalDetalleVisible    = false;
    this.cotizacionSeleccionada = null;
    if (this.modalRef) this.modalRef.close();
  }


}
