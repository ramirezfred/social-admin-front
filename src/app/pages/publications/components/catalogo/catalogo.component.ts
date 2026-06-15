import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { SocialApiService } from '../../../../services/social/api/api.service';

import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs';

import { Subject } from 'rxjs/Subject'; // Ruta específica de RxJS 5.5
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';

import { SesionService } from '../../../../services/sesion/sesion.service';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss']
})
export class CatalogoComponent implements OnInit, OnDestroy {

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

  // Filtros
  filtros = {
    fecha_inicio: '',
    fecha_fin: '',
    supplier_id: null,
  };

  myForm: FormGroup;
  suppliers : any [] = [];
  suppliersFiltrados: any[] = [];
  showDropdown = false;
  // Crear el Subject de control
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public empleados: any[] = []; // Cargar desde un servicio
  public userIdSel: string; // Valor inicial
  public userNombreSel: string; // Valor inicial

  userId: any;
  userRole = 0;

  bandera_init = false;

  constructor(
      private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private api_serv: SocialApiService,
      public fb: FormBuilder,
      private sesion_serv: SesionService
  ) { 

    this.userId = this.sesion_serv.getUserId();
    this.userRole = this.sesion_serv.getUserRol();

    this.userIdSel = ((this.sesion_serv.getUserId()) ? this.sesion_serv.getUserId() : 0).toString();

    this.userNombreSel = this.sesion_serv.getUserNombre();

    this.crearFormulario();
    this.crearListenersForm();
  }

  ngOnInit() {
    this.setFechasPorDefecto();
  }

  ngOnDestroy() {
    // 2. Notificar la destrucción
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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

  initComponent(){
    if(!this.bandera_init){
      this.bandera_init = true;
      //Admin
      if(this.userRole === 1){
        this.getEmpleados();
      }
    }
  }

  setFechasPorDefecto() {
    // ultimos 7 días
    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 7);

    this.filtros.fecha_inicio = this.formatearFecha(hoy);
    this.filtros.fecha_fin = this.formatearFecha(hoy);

    this.myForm.patchValue({fecha_inicio : this.formatearFecha(hoy)});
    this.myForm.patchValue({fecha_fin : this.formatearFecha(hoy)});

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

  generarCatalogo(): void {

    this.loading = true;
    
    var that = this;

    let params = new URLSearchParams();

    // Solo agrega al query string si el filtro tiene valor
    if (this.myForm.value.fecha_inicio) params.append('fecha_inicio', this.myForm.value.fecha_inicio);
    if (this.myForm.value.fecha_fin)    params.append('fecha_fin', this.myForm.value.fecha_fin);
    if (this.myForm.value.supplier_id)  params.append('supplier_id', this.myForm.value.supplier_id);

    let userId = Number(this.myForm.value.user_id);
    if(userId !== 0){
      params.append('user_id', String(userId));
    }

    this.api_serv.getQuery(`plaza_vestido/publications/crear/catalogo?${params.toString()}`)
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

  // --- Supplier ---

  crearFormulario() {
  
    this.myForm = this.fb.group({

      supplier_id  : [''],
      supplier_razon_social  : [''],
      fecha_inicio: ['', Validators.required], 
      fecha_fin: ['', Validators.required],
      user_id: [this.userIdSel, Validators.required]

    }); 
  
    
  }
  
  crearListenersForm() {
    

    const supplierCtrl = this.myForm.get('supplier_razon_social');

    if (supplierCtrl) {
      supplierCtrl.valueChanges
        .pipe(
          // 3. El takeUntil siempre debe ser el ÚLTIMO operador antes del subscribe
          debounceTime(300),
          distinctUntilChanged(),
          takeUntil(this.destroy$) 
        )
        .subscribe(valor => {
          if (valor && valor.length >= 1) {
            this.buscarPorCodigo(valor);
          } else {
            this.suppliersFiltrados = [];

            this.myForm.patchValue({
              supplier_id: '',
              supplier_razon_social: ''
            }, { emitEvent: false }); // importante

            this.showDropdown = false;
          }
        });
    }
  }

  buscarPorCodigo(termino : string): void {
  
    var that = this;
    this.api_serv.getQuery(`plaza_vestido/suppliers?search=${ termino }&status=true`)
    .subscribe({
      next(data : any) {
        console.log(data);         
        that.suppliersFiltrados = data.data;   
        that.showDropdown = data.data.length > 0;
      },
      error(msg) {
        console.log(msg);
      }
    });

  }

  seleccionarSupplier(item: any) {
    this.myForm.patchValue({
      supplier_id: item.id,
      supplier_razon_social: item.razon_social
    }, { emitEvent: false }); // importante
    this.showDropdown = false;
  }

  mostrarAutocompletado() {
    this.showDropdown = this.suppliersFiltrados.length > 0;
  }

  ocultarAutocompletado() {
    setTimeout(() => this.showDropdown = false, 150); // permite click antes de ocultar
  }

  limpiar(){
    this.setFechasPorDefecto();

    this.suppliersFiltrados = [];

    if(this.userRole === 1){ // admin

      this.myForm.patchValue({
        supplier_id: '',
        supplier_razon_social: '',
        user_id: '1' // por defecto admin
      }, { emitEvent: false }); // importante

    }else{ // vendedor

      this.myForm.patchValue({
        supplier_id: '',
        supplier_razon_social: ''
      }, { emitEvent: false }); // importante

    }

    this.showDropdown = false;
  }

  // ---- Visualizar publicaciones de otros usuarios

  getEmpleados(): void {

    this.empleados = [];
    
    var that = this;

    this.api_serv.getQuery(`plaza_vestido/employees`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.empleados = response.data;

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

}
