import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { RutaBaseService } from '../../../../services/ruta-base/ruta-base.service';

import { UploadService } from '../../../../services/upload-service/upload.service';

import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cotizaciones',
  templateUrl: './cotizaciones.component.html',
  styleUrls: ['./cotizaciones.component.scss']
})
export class CotizacionesComponent implements OnInit {

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
  @Input() tipo : any = null;

  @ViewChild('modalOrden') modalOrden : ElementRef;
  @ViewChild('modalOrdenDetalle') modalOrdenDetalle : ElementRef;

  cotizacion_id = null;
  fecha = '';
  cliente = '';
  telefono = '';
  email = '';
  gastos = [];
  subtotal = 0;
  envio = null;
  total = 0;
  moneda = '';
  moneda_aux = null;

  gasto_descripcion = '';
  gasto = null;

  diaActual = null;
  mesActual = null;
  anioActual = null;

  private data:any;
  public loading = false;

  cotizaciones = [];

  @ViewChild('content_print') content_print : ElementRef;
  @ViewChild('content_printB') content_printB : ElementRef;

  operacion = null;
  operacion_detalle = null;
  password_general = null;
  @ViewChild('modalPassGeneral') modalPassGeneral : ElementRef;
  operador = null;
  password_operador = null;
  @ViewChild('modalPassOperador') modalPassOperador : ElementRef;
  @ViewChild('modalPagar') modalPagar : ElementRef;
  @ViewChild('modalFinalizar') modalFinalizar : ElementRef;

  @ViewChild('fileInput') fileInput: ElementRef;
  comprobante_pago = null;

  ciudad_id = localStorage.getItem('mouvers_user_ciudad_id');

  objAPagar: any;
  pagar_id: any;

  objAFinalizar: any;
  finalizar_id: any;

  @Output() cont_cotiznes_event : EventEmitter<number> = new EventEmitter();

  constructor(private modalService: NgbModal,
      private toasterService: ToasterService,
      private http: HttpClient,
      private rutaService: RutaBaseService,
      private uploadService:UploadService,
  ) { }

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

  //Abrir modal estatica
  openModalPassGeneral(operacion) {
    let modal = this.modalPassGeneral;
    this.operacion = operacion;
    this.operacion_detalle = null;
    this.password_general = null;
    this.modalService.open(modal , { backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  tratarError(msg : any){
      //token invalido/ausente o token expiro
      if(msg.status == 400 || msg.status == 401){ 
          this.showToast('warning', 'Warning!', msg.error.error);
      }
      else if(msg.status == 404){ 
          this.showToast('info', 'Info!', msg.error.error);
      }
      else{ 
          this.showToast('error', 'Erro!', msg.error.error);
      }
  }

  initComponent(tipo){

    if(!this.tipo){
      this.tipo = tipo;
      this.getData();
    }

  }

  getData() {

    this.cotizaciones = [];
    this.cont_cotiznes_event.emit(0);

    this.loading = true;
    this.http.get(this.rutaService.getRutaApi()+`demo/cotizaciones?tipo=${ this.tipo }&token=`+localStorage.getItem('mouvers_token'))
       .toPromise()
       .then(
         (data:any) => { // Success
           this.cotizaciones = data.cotizaciones;
           for(var i = 0; i < this.cotizaciones.length; i++){
             this.cotizaciones[i].pago = (this.cotizaciones[i].pago==0)?'No Pagada':'Pagada';
             this.cotizaciones[i].pago_user = (this.cotizaciones[i].pago_user==0)?'No Pagada':'Pagada';
             this.cotizaciones[i].link = 'http://cotizaciones.internow.com.mx/#/pagessimples/cotizacion/'+this.cotizaciones[i].id;
             if(this.cotizaciones[i].moneda == 1){
                this.cotizaciones[i].moneda = 'MXN';
             }
             if(this.cotizaciones[i].moneda == 2){
                this.cotizaciones[i].moneda = 'USD';
             }
           }
           
           this.loading = false;
           this.cont_cotiznes_event.emit(this.cotizaciones.length);
         },
         msg => { // Error
           this.loading = false;
           this.tratarError(msg);
         }
       );
  }

  getDataTipo1() {

    this.cotizaciones = [];
    this.cont_cotiznes_event.emit(0);

    this.loading = true;
    this.http.get(this.rutaService.getRutaApi()+`demo/cotizaciones?tipo=1&token=`+localStorage.getItem('mouvers_token'))
       .toPromise()
       .then(
         (data:any) => { // Success
           this.cotizaciones = data.cotizaciones;
           for(var i = 0; i < this.cotizaciones.length; i++){
             this.cotizaciones[i].pago = (this.cotizaciones[i].pago==0)?'No Pagada':'Pagada';
             this.cotizaciones[i].pago_user = (this.cotizaciones[i].pago_user==0)?'No Pagada':'Pagada';
             this.cotizaciones[i].link = 'http://cotizaciones.internow.com.mx/#/pagessimples/cotizacion/'+this.cotizaciones[i].id;
             if(this.cotizaciones[i].moneda == 1){
                this.cotizaciones[i].moneda = 'MXN';
             }
             if(this.cotizaciones[i].moneda == 2){
                this.cotizaciones[i].moneda = 'USD';
             }
           }
           
           this.loading = false;
           this.cont_cotiznes_event.emit(this.cotizaciones.length);
         },
         msg => { // Error
           this.loading = false;
           this.tratarError(msg);
         }
       );
  }

  getDataTipo2() {

    this.cotizaciones = [];
    this.cont_cotiznes_event.emit(0);

    this.loading = true;
    this.http.get(this.rutaService.getRutaApi()+`demo/cotizaciones?tipo=2&token=`+localStorage.getItem('mouvers_token'))
       .toPromise()
       .then(
         (data:any) => { // Success
           this.cotizaciones = data.cotizaciones;
           for(var i = 0; i < this.cotizaciones.length; i++){
             this.cotizaciones[i].pago = (this.cotizaciones[i].pago==0)?'No Pagada':'Pagada';
             this.cotizaciones[i].pago_user = (this.cotizaciones[i].pago_user==0)?'No Pagada':'Pagada';
             this.cotizaciones[i].link = 'http://cotizaciones.internow.com.mx/#/pagessimples/cotizacion/'+this.cotizaciones[i].id;
             if(this.cotizaciones[i].moneda == 1){
                this.cotizaciones[i].moneda = 'MXN';
             }
             if(this.cotizaciones[i].moneda == 2){
                this.cotizaciones[i].moneda = 'USD';
             }
           }
           
           this.loading = false;
           this.cont_cotiznes_event.emit(this.cotizaciones.length);
         },
         msg => { // Error
           this.loading = false;
           this.tratarError(msg);
         }
       );
  }

  initOrden(){

    var fecha = new Date();
    //var fecha = Date.now();
    this.diaActual = fecha.getDate();
    this.mesActual = fecha.getMonth() + 1;
    this.anioActual = fecha.getFullYear();

    this.cotizacion_id = null;
    this.fecha = this.diaActual+'/'+this.mesActual+'/'+this.anioActual;
    this.cliente = '';
    this.telefono = '';
    this.email = '';

    this.gastos = [];
    this.envio = null;
    this.subtotal = 0;
    this.total = 0;

    this.moneda = '';
    this.moneda_aux = null;

    this.open2(this.modalOrden);

  }

  setMoneda(option){
    if(option == 1){
      this.moneda = 'MXN';
    }
    if(option == 2){
      this.moneda = 'USD';
    }
  }

  addGastoPedido(){
    if(this.gasto_descripcion != '' && this.gasto != null && this.gasto >= 0){
      this.subtotal = 0;
      this.total = 0;
      this.gastos.push({
        'descripcion': this.gasto_descripcion,
        'importe': this.gasto
      });
      for (var i = 0; i < this.gastos.length; ++i) {
        this.subtotal = this.subtotal + this.gastos[i].importe;
      }
      this.total = this.subtotal + this.envio;
      this.gasto_descripcion = '';
      this.gasto = null;
    }
  }

  clearGastoPedido(index,gasto){
    this.subtotal = 0;
    this.total = 0;
    this.gastos.splice( index, 1 );
    for (var i = 0; i < this.gastos.length; ++i) {
      this.subtotal = this.subtotal + this.gastos[i].importe;
    }
    this.total = this.subtotal + this.envio;
  }

  crearCotizacion(){
    if(this.cliente.length == 0){
      this.showToast('warning', 'Warning!', 'Cliente inválido');
    }else if(this.telefono == '' || this.telefono == null){
      this.showToast('warning', 'Warning!', 'Teléfono inválido');
    }else if(this.email == '' || this.email === null){
      this.showToast('warning', 'Warning!', 'Email inválido');
    }else if(this.tipo == 2 && this.envio === null){
      this.showToast('warning', 'Warning!', 'Envío inválido');
    }else if(this.gastos.length == 0){
      this.showToast('warning', 'Warning!', 'Debe agregar gastos a la cotización');
    }else if(this.moneda_aux === null){
      this.showToast('warning', 'Warning!', 'Seleccione una moneda');
    }else{

      if(this.tipo == 1){
        this.envio = 0;
      }

      this.loading = true;

      var datos= {
        token: localStorage.getItem('mouvers_token'),
        cliente: this.cliente,
        telefono: this.telefono,
        email: this.email,
        envio: this.envio,
        subtotal: this.subtotal,
        total: this.total,
        tipo: this.tipo,
        gastos: JSON.stringify(this.gastos),
        moneda: this.moneda_aux,
      }

      this.http.post(this.rutaService.getRutaApi()+`demo/cotizaciones`,datos)
         .toPromise()
         .then(
           (data:any) => { // Success
            this.loading = false;

            //para cerrar la modal
            let click_event = new CustomEvent('click');
            let btn_element = document.querySelector('#btnAtras');
            btn_element.dispatchEvent(click_event);

            this.getData();
             
           },
           msg => { // Error
             this.loading = false;
             this.tratarError(msg);
           }
         );

      
    }
  }

  detalleOrden(orden,modal,bandera){

    this.cotizacion_id = orden.id;
    this.fecha = orden.created_at;
    this.cliente = orden.cliente;
    this.telefono = orden.telefono;
    this.email = orden.email;

    this.gastos = orden.gastos;
    this.envio = orden.envio;
    this.subtotal = orden.subtotal;
    this.total = orden.total;
    this.moneda = orden.moneda;

    if(bandera == 1){
      this.moneda_aux = null;
    }
    if(bandera == 2){
      if(this.moneda == 'MXN'){
        this.moneda_aux = 1;
      }
      if(this.moneda == 'USD'){
        this.moneda_aux = 2;
      }
    }

    this.open2(modal);

  }

  print(): void {
    let printContents, popupWin;
    //printContents = document.getElementById('print-section').innerHTML;
    if(this.tipo == 1){
      printContents = this.content_print.nativeElement.innerHTML;
    }
    if(this.tipo == 2){
      printContents = this.content_printB.nativeElement.innerHTML;
    }
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
          
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1.6cm; }
              .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {
                    float: left;
               }
               .col-sm-12 {
                    width: 100%;
               }
               .col-sm-9 {
                    width: 75%;
               }
               .col-sm-3 {
                    width: 25%;
               }
               .form-control-static {
                 margin-bottom: 0px;
               }
            }
          </style>

        </head>

      <body onload="window.focus();window.print();window.close()"> ${printContents} </body>
      </html>`
    );
    //popupWin.document.close();
  }

  /*Validar el password general*/
  validarPassGeneral(): void {

    //Pagar orden
    if(this.operacion == 1){
      this.open(this.modalPagar);
    }
    //Finalizar orden
    else if(this.operacion == 2){
      this.open(this.modalFinalizar);
    }

    /*this.password_operador = null;
    this.loading = true;
    this.http.get(this.rutaService.getRutaApi()+'ciudades/'+this.ciudad_id+'/validar/pass/general?password_general='+this.password_general+'&token='+localStorage.getItem('mouvers_token'))
      .toPromise()
      .then(
        (data:any) => { // Success       
          this.loading = false;
          this.showToast('success', 'Success!', data.message);

          //Pagar orden
          if(this.operacion == 1){
            this.open(this.modalPagar);
          }
          //Finalizar orden
          else if(this.operacion == 2){
            this.open(this.modalFinalizar);
          }
          

        },
        msg => { // Error
          this.loading = false;
          this.openModalPassGeneral(this.operacion);
          this.tratarError(msg);     
        }
      );*/
  }

  /*Validar el password de operador*/
  validarPassOperador(): void {

    if(this.operacion == 1){
      this.pagarOrden();
    }else if(this.operacion == 2){
      this.finalizarOrden();
    }

    /*this.loading = true;

    var datos= {
      token: localStorage.getItem('mouvers_token'),
      password_operador: this.password_operador
    }

    this.http.post(this.rutaService.getRutaApi()+'operadores/validar/password',datos)
      .toPromise()
      .then(
        (data:any) => { // Success       
          this.loading = false;
          this.showToast('success', 'Success!', data.message);
          this.operador = data.operador;

          if(this.operacion == 1){
            this.pagarOrden();
          }else if(this.operacion == 2){
            this.finalizarOrden();
          }

        },
        msg => { // Error
          this.loading = false;
          this.tratarError(msg);     
        }
      );*/
  }

  onFileChange(event) {
    this.comprobante_pago = null;
    if(event.target.files.length > 0) {

      let rutaImg = 'city8/comprobantes';
      let fileImg = event.target.files[0];

      this.loading = true;

      return this.uploadService.subirImagen(
        rutaImg,fileImg,this.rutaService.getRutaImages(),this.rutaService.getRutaApi())
      .subscribe(res => {
          this.comprobante_pago = res;
          this.loading = false;
      });

    }
  }

  aPagar(obj): void {
    this.objAPagar = obj;
    this.pagar_id = this.objAPagar.id;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.comprobante_pago = null;

    this.operacion_detalle = 'Cotizaciones - Marcó como pagada la Orden '+this.pagar_id;
  }

  pagarOrden(): void {
    
    this.loading = true;

    var datos= {
      token: localStorage.getItem('mouvers_token'),
      comprobante_pago: this.comprobante_pago
    }

    this.http.put(this.rutaService.getRutaApi()+'demo/cotizaciones/pagar/'+this.pagar_id, datos)
       .toPromise()
       .then(
         data => { // Success
            
            this.data = data;

            var aux = this.cotizaciones;
            this.cotizaciones = [];

            for (var i = 0; i < aux.length; ++i) {
              if (aux[i].id == this.pagar_id) {
                aux[i].pago = 'Pagada';
                aux[i].pago_user = 'Pagada';
              }

              this.cotizaciones.push(aux[i]);
            }
            
            this.loading = false;
            this.showToast('success', 'Success!', this.data.message);

            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }
            this.comprobante_pago = null;

            //this.registrarOperacion();    
         },
         msg => { // Error

           this.loading = false;

           this.tratarError(msg);

         }
       );
  }

  aFinalizar(obj): void {
    this.objAFinalizar = obj;
    this.finalizar_id = this.objAFinalizar.id;

    this.operacion_detalle = 'Finalizó la Cotización '+this.finalizar_id;
  }

  finalizarOrden(): void {
    
    this.loading = true;

    var datos= {
      token: localStorage.getItem('mouvers_token'),
      cotizacion_id: this.finalizar_id
    }

    this.http.put(this.rutaService.getRutaApi()+'demo/cotizaciones/finalizar/orden', datos)
       .toPromise()
       .then(
         data => { // Success
            
            this.data = data;

            var aux = this.cotizaciones;
            this.cotizaciones = [];

            for (var i = 0; i < aux.length; ++i) {
              if (aux[i].id != this.finalizar_id) {
                 this.cotizaciones.push(aux[i]);
              }
            }
            
            this.loading = false;
            this.showToast('success', 'Success!', this.data.message);   

            //this.registrarOperacion(); 
         },
         msg => { // Error

           this.loading = false;

           this.tratarError(msg);

         }
       );
  }

  /*Registrar operacion en el historial*/
  registrarOperacion(): void {

    var datos= {
      token: localStorage.getItem('mouvers_token'),
      nombre: this.operador.nombre,
      password: this.operador.password,
      operacion: this.operacion_detalle,
    }

    this.http.post(this.rutaService.getRutaApi()+'historial',datos)
      .toPromise()
      .then(
        (data:any) => { // Success 
          this.operacion_detalle = null;
        },
        msg => { // Error    
        }
      );
  }

  enviarLink(cotizacion) {

    let texto = '';

    texto = '¡Hola '+cotizacion.cliente+'!%0A%0AEl siguiente paso es mandarte la información de pago, en el link podrás ver información de lo solicitado y podrás realizar tu pago.%0A%0AVerifica la información y recordarte qué todos los datos se encuentran resguardados, así como invitarte a visitar nuestro aviso de privacidad.%0A%0ADa clic aquí para realizar el pago%0A%0A'+cotizacion.link;

    texto = texto.replace(/#/g, "%23");
    texto = texto.replace(/&/g, "%26");

    var objeto_window_referencia;
    var configuracion_ventana = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";

    //let telefono = '584247027209'; //Freddy
    let telefono = cotizacion.telefono; //Cliente

    objeto_window_referencia = window.open("https://wa.me/"+telefono+"?text="+texto, "WhatsApp", configuracion_ventana);

  }

  enviarWsSeguimiento(cotizacion) {

    let texto = '';

    var dia : any;
    var mes : any;
    var anio : any;
    var fecha : any;

    fecha = new Date(cotizacion.created_at);
    dia = fecha.getDate();
    mes = fecha.getMonth() + 1;
    anio = fecha.getFullYear();

    fecha = dia+'/'+mes+'/'+anio;

    texto = 'Hola '+cotizacion.cliente+', ¿cómo estás?%0A%0ATe escribo de *Mexican Shopper*, tenemos la orden *'+cotizacion.id+'* a tu nombre con la fecha de creación *'+fecha+'*.%0A%0AIndícame cómo te puedo ayudar para completar tu proceso o si tienes una duda.%0A%0AEsperamos tus comentarios.';

    texto = texto.replace(/#/g, "%23");
    texto = texto.replace(/&/g, "%26");

    var objeto_window_referencia;
    var configuracion_ventana = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";

    //let telefono = '584247027209'; //Freddy
    let telefono = cotizacion.telefono; //Cliente

    objeto_window_referencia = window.open("https://wa.me/"+telefono+"?text="+texto, "WhatsApp", configuracion_ventana);

  }

  addGastoPedidoEdit(){
    if(this.gasto_descripcion != '' && this.gasto != null && this.gasto >= 0){

      if(this.cliente.length == 0){
        this.showToast('warning', 'Warning!', 'Cliente inválido');
      }else if(this.telefono == '' || this.telefono == null){
        this.showToast('warning', 'Warning!', 'Teléfono inválido');
      }else if(this.email == '' || this.email === null){
        this.showToast('warning', 'Warning!', 'Email inválido');
      }else if(this.tipo == 2 && this.envio === null){
        this.showToast('warning', 'Warning!', 'Envío inválido');
      }else if(this.moneda_aux === null){
        this.showToast('warning', 'Warning!', 'Seleccione una moneda');
      }else{

        this.subtotal = 0;
        this.total = 0;
        this.subtotal = this.subtotal + this.gasto;
        for (var i = 0; i < this.gastos.length; ++i) {
          this.subtotal = this.subtotal + this.gastos[i].importe;
        }
        this.total = this.subtotal + this.envio;
        

        this.loading = true;

        var datos= {
          token: localStorage.getItem('mouvers_token'),
          cliente: this.cliente,
          telefono: this.telefono,
          email: this.email,
          envio: this.envio,
          subtotal: this.subtotal,
          total: this.total,
          moneda: this.moneda_aux,
          descripcion: this.gasto_descripcion,
          importe: this.gasto,
        }

        this.http.put(this.rutaService.getRutaApi()+'demo/cotizaciones/'+this.cotizacion_id+'/agregar/gasto', datos)
           .toPromise()
           .then(
             data => { // Success
                
                this.data = data;

                this.gastos.push({
                  'descripcion': this.data.gasto.descripcion,
                  'importe': this.data.gasto.importe,
                  'id': this.data.gasto.id,
                });

                this.gasto_descripcion = '';
                this.gasto = null;
                
                this.loading = false;
                this.showToast('success', 'Success!', this.data.message);   

             },
             msg => { // Error

               this.loading = false;

               this.tratarError(msg);

             }
           );
      }

    }
  }

  clearGastoPedidoEdit(index,gasto){

    if(this.cliente.length == 0){
      this.showToast('warning', 'Warning!', 'Cliente inválido');
    }else if(this.telefono == '' || this.telefono == null){
      this.showToast('warning', 'Warning!', 'Teléfono inválido');
    }else if(this.email == '' || this.email === null){
      this.showToast('warning', 'Warning!', 'Email inválido');
    }else if(this.tipo == 2 && this.envio === null){
      this.showToast('warning', 'Warning!', 'Envío inválido');
    }else if(this.gastos.length == 1){
      this.showToast('warning', 'Warning!', 'La cotización debe tener al menos un gasto');
    }else if(this.moneda_aux === null){
      this.showToast('warning', 'Warning!', 'Seleccione una moneda');
    }else{

      this.subtotal = 0;
      this.total = 0;
      this.gastos.splice( index, 1 );
      for (var i = 0; i < this.gastos.length; ++i) {
        this.subtotal = this.subtotal + this.gastos[i].importe;
      }
      this.total = this.subtotal + this.envio;

        this.loading = true;

        var datos= {
          token: localStorage.getItem('mouvers_token'),
          cliente: this.cliente,
          telefono: this.telefono,
          email: this.email,
          envio: this.envio,
          subtotal: this.subtotal,
          total: this.total,
          moneda: this.moneda_aux,
          gasto_id: gasto.id,
        }

        this.http.put(this.rutaService.getRutaApi()+'demo/cotizaciones/'+this.cotizacion_id+'/quitar/gasto', datos)
           .toPromise()
           .then(
             data => { // Success
                
                this.data = data;
                
                this.loading = false;
                this.showToast('success', 'Success!', this.data.message);   

             },
             msg => { // Error

               this.loading = false;

               this.tratarError(msg);

             }
           );

    }

  }

  editarCotizacion(){

    if(this.cliente.length == 0){
      this.showToast('warning', 'Warning!', 'Cliente inválido');
    }else if(this.telefono == '' || this.telefono == null){
      this.showToast('warning', 'Warning!', 'Teléfono inválido');
    }else if(this.email == '' || this.email === null){
      this.showToast('warning', 'Warning!', 'Email inválido');
    }else if(this.tipo == 2 && this.envio === null){
      this.showToast('warning', 'Warning!', 'Envío inválido');
    }else if(this.gastos.length == 0){
      this.showToast('warning', 'Warning!', 'Debe agregar gastos a la cotización');
    }else if(this.moneda_aux === null){
      this.showToast('warning', 'Warning!', 'Seleccione una moneda');
    }else{

      
      this.total = this.subtotal + this.envio;

        this.loading = true;

        var datos= {
          token: localStorage.getItem('mouvers_token'),
          cliente: this.cliente,
          telefono: this.telefono,
          email: this.email,
          envio: this.envio,
          //subtotal: this.subtotal,
          total: this.total,
          moneda: this.moneda_aux,
        }

        this.http.put(this.rutaService.getRutaApi()+'demo/cotizaciones/'+this.cotizacion_id, datos)
           .toPromise()
           .then(
             data => { // Success
                
                this.data = data;
                
                this.loading = false;
                this.showToast('success', 'Success!', this.data.message);   

             },
             msg => { // Error

               this.loading = false;

               this.tratarError(msg);

             }
           );

    }

  }


}
