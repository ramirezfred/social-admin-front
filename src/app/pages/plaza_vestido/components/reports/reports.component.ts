import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { SocialApiService } from '../../../../services/social/api/api.service';

import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

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

  constructor(
      private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private api_serv: SocialApiService,
      public fb: FormBuilder,
  ) { 
    this.crearFormulario();
  }

  ngOnInit() {
    this.setFechasPorDefecto();
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

  setFechasPorDefecto() {
    // ultimos 7 días
    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 7);

    this.filtros.fecha_inicio = this.formatearFecha(hace7dias);
    this.filtros.fecha_fin = this.formatearFecha(hoy);

    this.myForm.patchValue({fecha_inicio : this.formatearFecha(hace7dias)});
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

    this.api_serv.getQuery(`plaza_vestido/quotes/reporte/${ this.myForm.value.tipo }?${params.toString()}`)
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

      tipo: ['semanal', Validators.required],
      fecha_inicio: ['', Validators.required], 
      fecha_fin: ['', Validators.required],

    }); 
    
  }

  limpiar(){
    this.setFechasPorDefecto();

    this.myForm.patchValue({
      tipo: 'semanal',
    }, { emitEvent: false }); // importante
  }

}
