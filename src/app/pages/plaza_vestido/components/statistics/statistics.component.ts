import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { SocialApiService } from '../../../../services/social/api/api.service';

import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';

import { SesionService } from '../../../../services/sesion/sesion.service';

interface EstadisticasResponse {
  adelantado_general: {
    cantidad: number;
    total: number;
  };
  pagado_general: {
    cantidad: number;
    total: number;
  };
  adelantado: {
    cantidad: number;
    total: number;
  };
  pagado: {
    cantidad: number;
    total: number;
  };
  mejor_semana_historica: {
    fecha_inicio: string;
    fecha_fin: string;
    cantidad: number;
    total: number;
  };
}

interface Semana {
  fecha_inicio: Date;
  fecha_fin: Date;
  label: string;
  value: string;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

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

  estadisticas: EstadisticasResponse | null = null;
  semanas: Semana[] = [];
  semanaSeleccionada: string = '';
  
  formFechas: FormGroup;

  bandera_init = false;

  public empleados: any[] = []; // Cargar desde un servicio
  public userIdSel: string; // Valor inicial
  public userNombreSel: string; // Valor inicial

  userId: any;
  userRole = 0;

  constructor(
      private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private api_serv: SocialApiService,
      public fb: FormBuilder,
      private sesion_serv: SesionService,
  ) { 

    this.userId = this.sesion_serv.getUserId();
    this.userRole = this.sesion_serv.getUserRol();

    this.userIdSel = ((this.sesion_serv.getUserId()) ? this.sesion_serv.getUserId() : 0).toString();

    this.userNombreSel = this.sesion_serv.getUserNombre();

    this.formFechas = this.fb.group({
      fecha_inicio: [''],
      fecha_fin: ['']
    });

  }

  ngOnInit() {
    this.generarSemanas();
    // this.seleccionarSemanaActual();
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

      //Admin
      if(this.userRole === 1){
        this.getEmpleados();
      }

      this.seleccionarSemanaActual();
      this.bandera_init = true;
    }
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

  consultarEstadisticas1() {
    const fechas = this.formFechas.value;
    if (!fechas.fecha_inicio || !fechas.fecha_fin) {
      return;
    }

    this.loading = true;
    const url = `http://localhost/publicacionesIA/publicacionesIAAPI/public/api/plaza_vestido/quotes/get/estadisticas`;
    const params = {
      user_id: this.userId.toString(),
      fecha_inicio: fechas.fecha_inicio,
      fecha_fin: fechas.fecha_fin
    };

    this.http.get<EstadisticasResponse>(url, { params })
      .subscribe(
        (response) => {
          this.estadisticas = response;
          this.loading = false;
        },
        (error) => {
          console.error('Error al consultar estadísticas:', error);
          this.loading = false;
        }
      );
  }

  consultarEstadisticas() {
    const fechas = this.formFechas.value;
    if (!fechas.fecha_inicio || !fechas.fecha_fin) {
      return;
    }

    this.loading = true;
    
    var that = this;

    let params = new URLSearchParams();

    params.append('user_id', this.userIdSel);
    params.append('fecha_inicio', fechas.fecha_inicio);
    params.append('fecha_fin', fechas.fecha_fin);

    this.api_serv.getQuery(`plaza_vestido/quotes/get/estadisticas?${params.toString()}`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.estadisticas = response.data; 
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

  // ---- Visualizar publicaciones de otros usuarios

  onEmpleadoChange(idEmpleado: string) {

    if(idEmpleado === '1'){
      this.userNombreSel = 'Admin';
    }else{
      const empleadoEncontrado = this.empleados.find((emp: any) => emp.id === Number(idEmpleado));

      this.userNombreSel = empleadoEncontrado ? empleadoEncontrado.nombre : '';
    }

    this.consultarEstadisticas(); // Recarga con el filtro
  }

  limpiar(){
    this.userIdSel = '1';
    this.userNombreSel = 'Admin';
    this.seleccionarSemanaActual(); // Recarga con el filtro
  }

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
