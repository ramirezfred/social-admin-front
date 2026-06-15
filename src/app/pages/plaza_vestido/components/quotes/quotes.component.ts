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

import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';

import { Subject } from 'rxjs/Subject'; // Ruta específica de RxJS 5.5
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SesionService } from '../../../../services/sesion/sesion.service';

interface EstadisticasResponse {
  pendiente_esta: {
    cantidad: number;
    total: number;
  };
  adelantado_esta: {
    cantidad: number;
    total: number;
  };
  pagado_esta: {
    cantidad: number;
    total: number;
  };
  adelantado_pasada: {
    cantidad: number;
    total: number;
  };
  pagado_pasada: {
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

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.scss']
})
export class QuotesComponent implements OnInit, OnDestroy {

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

  @Output() cont_cotiznes_event : EventEmitter<number> = new EventEmitter();

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
  suppliersFiltrados: any[] = [];
  showDropdown = false;
  // Crear el Subject de control
  private destroy$: Subject<boolean> = new Subject<boolean>();

  selectObj : any = null;
  selectObjIndex : number = null;
  selectObjIndex2 : number = null;

  // --- Propiedades Pagos ---
  cotizacionSeleccionada: any = null;
  modalPagoVisible    = false;
  modalDetalleVisible = false;
  formPago = { 
    monto: null, 
    tipo: 'efectivo', 
    referencia: '', 
    fecha: '',
    // fecha: new Date().toISOString().substring(0, 10)
  };

  modalRef: any;
  @ViewChild('modalPago') modalPago : ElementRef;
  @ViewChild('modalDetalle') modalDetalle : ElementRef;

  // ── Estado modales ──────────────────────────────────────
  modalTipoEntregaVisible = false;
  modalFinalizarVisible   = false;
  modalCancelarVisible = false;
  @ViewChild('modalTipoEntrega') modalTipoEntrega : ElementRef;
  @ViewChild('modalFinalizar') modalFinalizar : ElementRef;
  @ViewChild('modalCancelar') modalCancelar : ElementRef;

  formEntrega  = { 
    tipo: '',
    costo_guia: null,
  };
  formFinalizar = { 
    tipo_entrega: '',
    costo_guia: null,
  };

  public empleados: any[] = []; // Cargar desde un servicio
  public userIdSel: string; // Valor inicial
  public userNombreSel: string; // Valor inicial

  userId: any;
  userRole = 0;

  estadisticas: EstadisticasResponse | null = null;

  constructor(private modalService: NgbModal,
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

    this.crearFormulario(0);

    this.crearFormularioConcepto();
    this.crearListenersFormConcepto();

  }

  ngOnInit() {
    this.cont_cotiznes_event.emit(0);
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
      this.bandera_init = true;
      //Admin
      if(this.userRole === 1){
        this.getEmpleados();
      }
      this.getListado();
      // this.getSuppliers();
    }
  }

  onEmpleadoChange(idEmpleado: string) {

    if(idEmpleado === '1'){
      this.userNombreSel = 'Admin';
    }else{
      const empleadoEncontrado = this.empleados.find((emp: any) => emp.id === Number(idEmpleado));

      this.userNombreSel = empleadoEncontrado ? empleadoEncontrado.nombre : '';
    }

    this.getListado(); // Recarga la tabla con el filtro
  }

  limpiar(){
    this.userIdSel = '1';
    this.userNombreSel = 'Admin';
    this.getListado(); // Recarga la tabla con el filtro
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

  getListado(): void {

    this.listado = [];
    this.filteredItems = this.listado;
    this.init();

    this.loading = true;
    //this.showToast('info', 'Info!', 'Consultando...');
    
    var that = this;

    this.api_serv.getQuery(`plaza_vestido/quotes?estado=en curso&user_id=${this.userIdSel}`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.listado = response.data;
        that.filteredItems = that.listado; 
        that.init();  

        that.estadisticas = response.estadisticas;
        that.loading = false; 

        if(that.listado.length == 0){
          that.showToast('info', 'Info!', 'No tienes cotizaciones en curso.');
        }  

        that.cont_cotiznes_event.emit(that.listado.length);

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  getSuppliers(): void {

    this.suppliers = [];
    
    var that = this;

    this.api_serv.getQuery(`plaza_vestido/suppliers?status=true`)
    .subscribe({
      next(response : any) {
        console.log(response);
        that.suppliers = response.data;
      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  refreshTabla(){
    this.getListado();
    // this.getSuppliers();
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

  aCrear(): void {
    this.accion = 0;
    this.crearFormulario(0);

    // this.crearFormularioConcepto();
    // this.crearListenersFormConcepto();
    this.cargarDataMyFormConcepto();
    this.flag_new_concepto = false;
    this.conceptos = [];

    this.flag_vista = 2;

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


    // this.crearFormularioConcepto();
    // this.crearListenersFormConcepto();
    this.cargarDataMyFormConcepto();
    this.flag_new_concepto = false;
    this.conceptos = this.selectObj.detalles ? this.selectObj.detalles : [];

    this.flag_vista = 2;

  }

  aPagar(obj): void {
    this.objAPagar = obj;
    this.pagar_id = this.objAPagar.id;
    // if (this.fileInput) {
    //   this.fileInput.nativeElement.value = '';
    // }
    // this.comprobante_pago = null;

    // this.operacion_detalle = 'Cotizaciones - Marcó como pagada la Orden '+this.pagar_id;
  }

  aFinalizar(obj): void {
    this.objAFinalizar = obj;
    this.finalizar_id = this.objAFinalizar.id;

    // this.operacion_detalle = 'Finalizó la Cotización '+this.finalizar_id;
  }

  /* Inicio Conceptos de la Compra */

  newConcepto(){
    this.flag_new_concepto = true;
  }

  crearFormularioConcepto() {

    this.myFormConcepto = this.fb.group({

      supplier_id  : ['', [ Validators.required ]  ],
      supplier_razon_social  : ['', [ Validators.required ]  ],
      modelo  : ['', [ Validators.required ]  ],
      talla  : ['', [ Validators.required ]  ],
      color  : ['', [ Validators.required ]  ],
      cantidad  : ['', [ Validators.required, Validators.min(1) ]  ],
      precio_unitario  : ['', [ Validators.required, Validators.min(0) ]  ],
      porcentaje_desc  : [0, [ Validators.required ]  ],
      descuento  : [0],
      porcentaje_impuesto  : [0, [ Validators.required ]  ],
      impuesto  : [0],
      subtotal  : ['', [ Validators.required ]  ],
      total  : ['']

    }); 

    this.myFormConcepto.controls['subtotal'].disable();    
    
  }

  crearListenersFormConcepto() {
    // Listener para CANTIDAD
    const cantCtrl = this.myFormConcepto.get('cantidad');
    if (cantCtrl) {
      cantCtrl.valueChanges.subscribe(valor => {
        const precio = this.myFormConcepto.get('precio_unitario').value;
        
        if (this.esNumeroValido(valor) && this.esNumeroValido(precio)) {
          const subtotal = parseFloat(valor) * parseFloat(precio);
          this.myFormConcepto.patchValue({ subtotal: parseFloat(subtotal.toFixed(4)) }, { emitEvent: false });
        } else {
          this.myFormConcepto.patchValue({ subtotal: '' }, { emitEvent: false });
        }
      });
    }

    // Listener para PRECIO UNITARIO
    const precioCtrl = this.myFormConcepto.get('precio_unitario');
    if (precioCtrl) {
      precioCtrl.valueChanges.subscribe(valor => {
        const cantidad = this.myFormConcepto.get('cantidad').value;
        
        if (this.esNumeroValido(valor) && this.esNumeroValido(cantidad)) {
          const subtotal = parseFloat(valor) * parseFloat(cantidad);
          this.myFormConcepto.patchValue({ subtotal: parseFloat(subtotal.toFixed(4)) }, { emitEvent: false });
        } else {
          this.myFormConcepto.patchValue({ subtotal: '' }, { emitEvent: false });
        }
      });
    }

    const supplierCtrl = this.myFormConcepto.get('supplier_razon_social');

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
            this.showDropdown = false;
          }
        });
    }
  }

  // Función auxiliar para limpiar el código
  esNumeroValido(val: any): boolean {
    return val !== null && val !== '' && val >= 0;
  }

  cargarDataMyFormConcepto(){

    this.myFormConcepto.patchValue({supplier_id : ''});
    this.myFormConcepto.patchValue({supplier_razon_social : ''});
    this.myFormConcepto.patchValue({modelo : ''});
    this.myFormConcepto.patchValue({talla : ''});
    this.myFormConcepto.patchValue({color : ''});
    this.myFormConcepto.patchValue({cantidad : ''});
    this.myFormConcepto.patchValue({precio_unitario : ''});
    this.myFormConcepto.patchValue({porcentaje_desc : 0});
    this.myFormConcepto.patchValue({descuento : 0});
    this.myFormConcepto.patchValue({porcentaje_impuesto : 0});
    this.myFormConcepto.patchValue({impuesto : 0});
    this.myFormConcepto.patchValue({subtotal : ''});
    this.myFormConcepto.patchValue({total : ''});

    Object.values( this.myFormConcepto.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

  }

  get supplier_idNoValido() {
    return this.myFormConcepto.get('supplier_id').invalid && this.myFormConcepto.get('supplier_id').touched
  }

  get supplier_razon_socialNoValido() {
    return this.myFormConcepto.get('supplier_razon_social').invalid && this.myFormConcepto.get('supplier_razon_social').touched
  }

  get modeloNoValido() {
    return this.myFormConcepto.get('modelo').invalid && this.myFormConcepto.get('modelo').touched
  }

  get tallaNoValido() {
    return this.myFormConcepto.get('talla').invalid && this.myFormConcepto.get('talla').touched
  }

  get colorNoValido() {
    return this.myFormConcepto.get('color').invalid && this.myFormConcepto.get('color').touched
  }

  get cantidadNoValido() {
    return this.myFormConcepto.get('cantidad').invalid && this.myFormConcepto.get('cantidad').touched
  }

  get precio_unitarioNoValido() {
    return this.myFormConcepto.get('precio_unitario').invalid && this.myFormConcepto.get('precio_unitario').touched
  }

  get subtotalNoValido() {
    return this.myFormConcepto.get('subtotal').invalid && this.myFormConcepto.get('subtotal').touched
  }

  agregarConcepto(){
    console.log( this.myFormConcepto );

    if ( this.myFormConcepto.invalid) {

      if(!this.myFormConcepto.value.supplier_id){
        this.showToast('warning', 'Warning!', 'Seleccione un proveedor válido.');
      }else{
        this.showToast('warning', 'Warning!', 'Ingresa los campos requeridos.');
      }

      return Object.values( this.myFormConcepto.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{

      let cantidadRedondeado = parseFloat(this.myFormConcepto.value.cantidad.toFixed(4));

      let precio_unitarioRedondeado = parseFloat(this.myFormConcepto.value.precio_unitario.toFixed(4));

      let porcentaje_impuestoRedondeado = 0;
      if(this.myFormConcepto.value.procentaje_descuento === '' || this.myFormConcepto.value.porcentaje_impuesto === null || this.myFormConcepto.value.porcentaje_impuesto < 0){
        porcentaje_impuestoRedondeado = 0;
      }else{
        porcentaje_impuestoRedondeado = parseFloat(parseFloat(this.myFormConcepto.value.porcentaje_impuesto).toFixed(2));
      }

      let porcentaje_descRedondeado = 0;
      if(this.myFormConcepto.value.procentaje_desc === '' || this.myFormConcepto.value.porcentaje_desc === null || this.myFormConcepto.value.porcentaje_desc < 0){
        porcentaje_descRedondeado = 0;
      }else{
        porcentaje_descRedondeado = parseFloat(this.myFormConcepto.value.porcentaje_desc.toFixed(2));
      }

      let subtotal = cantidadRedondeado * precio_unitarioRedondeado;
      let subtotalRedondeado = parseFloat(subtotal.toFixed(4));

      // Descuento calculado
      let descuento = parseFloat((subtotalRedondeado * (porcentaje_descRedondeado / 100)).toFixed(4));
      let base = subtotalRedondeado - descuento;

      // Impuesto calculado
      let impuesto = parseFloat((base * (porcentaje_impuestoRedondeado / 100)).toFixed(4));

      // Total por línea
      let total = parseFloat((base + impuesto).toFixed(4));


      if(!this.flag_edit_concepto){
        this.conceptos.push(
          {
            id : Date.now().toString(),
            supplier_id : this.myFormConcepto.value.supplier_id,
            supplier : 
              { id : this.myFormConcepto.value.supplier_id, razon_social : this.myFormConcepto.value.supplier_razon_social },
            modelo : this.myFormConcepto.value.modelo,
            talla : this.myFormConcepto.value.talla,
            color : this.myFormConcepto.value.color,
            cantidad : cantidadRedondeado,
            precio_unitario : precio_unitarioRedondeado,
            subtotal : subtotalRedondeado,
            porcentaje_impuesto : porcentaje_impuestoRedondeado,
            impuesto : impuesto,
            porcentaje_desc : porcentaje_descRedondeado,
            descuento : descuento,
            total : total
          }
        );
      }else{
        for (var i = 0; i < this.conceptos.length; ++i) {

          if(this.conceptos[i].id == this.concepto_id){
            this.conceptos[i].supplier_id = this.myFormConcepto.value.supplier_id;
            this.conceptos[i].supplier = 
              { id : this.myFormConcepto.value.supplier_id, razon_social : this.myFormConcepto.value.supplier_razon_social },
            this.conceptos[i].modelo = this.myFormConcepto.value.modelo;
            this.conceptos[i].talla = this.myFormConcepto.value.talla;
            this.conceptos[i].color = this.myFormConcepto.value.color;
            this.conceptos[i].cantidad = cantidadRedondeado;
            this.conceptos[i].precio_unitario = precio_unitarioRedondeado;
            this.conceptos[i].subtotal = subtotalRedondeado;
            this.conceptos[i].porcentaje_impuesto = porcentaje_impuestoRedondeado;
            this.conceptos[i].impuesto = impuesto;
            this.conceptos[i].porcentaje_desc = porcentaje_descRedondeado;
            this.conceptos[i].descuento = descuento;
            this.conceptos[i].total = total;
          }

        }
      }

      this.flag_edit_concepto = false;
      this.concepto_id = null;

      this.cargarDataMyFormConcepto();
      this.flag_new_concepto = false;

      this.calcularTotales();
      
    }
  }

  cancelarConcepto(){
    this.flag_edit_concepto = false;
    this.concepto_id = null;

    this.cargarDataMyFormConcepto();
    this.flag_new_concepto = false;

    this.calcularTotales();
  }

  calcularTotales(){

    this.Subtotal = 0;
    this.Descuento = 0;
    this.Total = 0;
    this.Impuesto = 0;
    this.Envio = this.myForm.value.envio;

    for (var i = 0; i < this.conceptos.length; ++i) {

      this.Subtotal += parseFloat(this.conceptos[i].subtotal);
      this.Descuento += parseFloat(this.conceptos[i].descuento);
      this.Impuesto += parseFloat(this.conceptos[i].impuesto);
      this.Total += parseFloat(this.conceptos[i].total);

    }

    this.Subtotal = parseFloat(this.Subtotal.toFixed(2));
    this.Descuento = parseFloat(this.Descuento.toFixed(2));

    // this.Total = this.Subtotal - this.Descuento + this.Impuesto;
  
    this.Total = parseFloat(this.Total.toFixed(2));

    this.Impuesto = parseFloat(this.Impuesto.toFixed(2));

    if(this.esNumeroValido(this.Envio)){
      this.Total = this.Total + parseFloat(this.Envio);
    }

    console.log(this.conceptos);

    this.myForm.patchValue({subtotal : this.Subtotal});
    this.myForm.patchValue({descuento : this.Descuento});
    this.myForm.patchValue({impuesto : this.Impuesto});
    this.myForm.patchValue({total : this.Total});
    
  }

  editarConcepto(index : number, item : any){

    this.flag_edit_concepto = true;
    this.concepto_id = item.id;

    
    // this.myFormConcepto.patchValue({supplier_id : item.supplier_id});
    // this.myFormConcepto.patchValue({supplier_razon_social : item.supplier.razon_social});
    this.myFormConcepto.patchValue({
      supplier_id: item.supplier_id,
      supplier_razon_social: item.supplier.razon_social
    }, { emitEvent: false }); // importante
    this.myFormConcepto.patchValue({modelo : item.modelo});
    this.myFormConcepto.patchValue({talla : item.talla});
    this.myFormConcepto.patchValue({color : item.color});
    this.myFormConcepto.patchValue({cantidad : parseFloat(item.cantidad)});
    this.myFormConcepto.patchValue({precio_unitario : parseFloat(item.precio_unitario)});
    this.myFormConcepto.patchValue({porcentaje_desc : parseFloat(item.porcentaje_desc)});
    this.myFormConcepto.patchValue({descuento : parseFloat(item.descuento)});
    this.myFormConcepto.patchValue({porcentaje_impuesto : parseFloat(item.porcentaje_impuesto)});
    this.myFormConcepto.patchValue({impuesto : parseFloat(item.impuesto)});
    this.myFormConcepto.patchValue({subtotal : parseFloat(item.subtotal)});
    this.myFormConcepto.patchValue({total  : parseFloat(item.total) });

    this.newConcepto();

  }

  eliminarConcepto(index : number, item : any){
    this.conceptos.splice(index, 1);
    this.calcularTotales();
  }

  getNombreProveedor(id: number): string {
    const proveedor = this.suppliers.find(s => s.id == id);
    return proveedor ? proveedor.razon_social : 'No asignado';
  }

  envioKeyup(){
    this.calcularTotales();
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
    this.myFormConcepto.patchValue({
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

  /* Fin Conceptos de la Compra */

  guardar(): void {
    console.log( this.myForm );

    if(this.conceptos.length == 0) {
      this.showToast('warning', 'Warning!', 'Agrega al menos un concepto a la cotización.');
      return;
    }

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
      moneda : this.myForm.value.moneda,
      cliente : this.myForm.value.cliente,
      email : this.myForm.value.email,
      telefono : this.myForm.value.telefono,
      notas : this.myForm.value.notas,

      subtotal : this.myForm.get('subtotal').value,
      impuesto : this.myForm.get('impuesto').value,
      descuento : this.myForm.get('descuento').value,
      envio : this.myForm.get('envio').value,
      total : this.myForm.get('total').value,

      detalles : this.conceptos
    }

    var that = this;

    this.api_serv.postQuery(`plaza_vestido/quotes`, datos)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

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
   
    var datos= {
      moneda : this.myForm.value.moneda,
      cliente : this.myForm.value.cliente,
      email : this.myForm.value.email,
      telefono : this.myForm.value.telefono,
      notas : this.myForm.value.notas,

      subtotal : this.myForm.get('subtotal').value,
      impuesto : this.myForm.get('impuesto').value,
      descuento : this.myForm.get('descuento').value,
      envio : this.myForm.get('envio').value,
      total : this.myForm.get('total').value,

      detalles : this.conceptos
    }

    var that = this;

    this.api_serv.putQuery(`plaza_vestido/quotes/${ this.selectObj.id }`, datos)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

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

sendWhatsapp1(orden: any): void {

  this.loading = true;

  this.api_serv.getQuery(`plaza_vestido/quotes/${orden.id}/ticket_acortado`)
    .subscribe({

      next: (response: any) => {

        this.loading = false;

        let link = '';

        if (response && response.data) {
          link = response.data;
        }

        const mensaje =
`👋 ¡Hola ${orden.cliente}!

Tu cotización *#${orden.folio}* de *Plaza del Vestido* está lista.

Puedes verla aquí:
🔗 ${link}

Si deseas confirmar tu pedido o tienes alguna duda,
solo responde a este mensaje.

¡Con gusto te ayudamos! 😊`;

        let telefono = (orden.telefono || '').replace(/\D/g, '');

        // Si mide 10 dígitos y NO empieza ya con 52, se lo agregamos
        if (telefono.length === 10 && !telefono.startsWith('52')) {
            telefono = '52' + telefono;
        }

        const texto = encodeURIComponent(mensaje);

        // const url = `https://wa.me/${telefono}?text=${texto}`;

         const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${texto}`;

        window.open(url, '_blank');
        // window.open(url, '_blank', 'noopener,noreferrer');

      },

      error: (err) => {
        console.error(err);
        this.loading = false;
        this.tratarError(err);
      }

    });

}

  /* Inicio Pago de la Compra */

  // --- Modal Pago ---
  abrirModalPago(cotizacion: any) {
    this.cotizacionSeleccionada = cotizacion;
    this.formPago = {
      monto:      null,
      tipo:       'efectivo',
      referencia: '',
      fecha:      new Date().toISOString().substring(0, 10)
    };
    this.modalPagoVisible = true;
    this.open(this.modalPago);
  }

  cerrarModalPago() {
    this.modalPagoVisible = false;
    this.cotizacionSeleccionada = null;
  }

  confirmarPago() {
    if (!this.formPago.monto || this.formPago.monto <= 0) return;
    if (this.formPago.monto > this.cotizacionSeleccionada.saldo_restante) return;

    const id   = this.cotizacionSeleccionada.id;
    const body = {
      monto:      this.formPago.monto,
      tipo:       this.formPago.tipo,
      referencia: this.formPago.referencia,
      fecha:      this.formPago.fecha,
    };

    this.loading = true;
    const that   = this;

    this.api_serv.postQuery(`plaza_vestido/quotes/${id}/pago`, body)
      .subscribe({
        next(response: any) {
          that.loading = false;
          that.getListado();
          if (that.modalRef) that.modalRef.close();
          that.cerrarModalPago();
        },
        error(msg) {
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

  /* Fin Pagos de la Compra */
 

  // ── Tipo Entrega ────────────────────────────────────────
  abrirModalTipoEntrega(cotizacion: any) {
    this.cotizacionSeleccionada = cotizacion;
    this.formEntrega.tipo = cotizacion.tipo_entrega || '';
    this.formEntrega.costo_guia = cotizacion.costo_guia || null;
    this.modalTipoEntregaVisible = true;
    this.open(this.modalTipoEntrega);
  }

  cerrarModalTipoEntrega() {
    this.modalTipoEntregaVisible = false;
    this.cotizacionSeleccionada  = null;
    this.formEntrega.tipo = '';
    this.formEntrega.costo_guia = null;
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  confirmarTipoEntrega() {
    // this.cotizacionService
    //   .asignarTipoEntrega(this.cotizacionSeleccionada.id, { tipo_entrega: this.formEntrega.tipo })
    //   .subscribe(() => {
    //     this.cerrarModalTipoEntrega();
    //     this.cargarCotizaciones();
    //   });

    this.loading = true;

    var that = this;

    var datos = { 
      tipo_entrega: this.formEntrega.tipo,
      costo_guia: (this.formEntrega.tipo === 'envio') ? this.formEntrega.costo_guia : null
    }; 

    this.api_serv.putQuery(`plaza_vestido/quotes/${ this.cotizacionSeleccionada.id }/set_estado_and_entrega`, datos)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

        that.cerrarModalTipoEntrega();
        that.getListado();
        
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  // ── Cancelar (directo, sin modal) ───────────────────────
  abrirModalCancelar(cotizacion: any) {
    this.cotizacionSeleccionada = cotizacion;
    this.modalCancelarVisible   = true;
    this.open(this.modalCancelar);
  }

  cerrarModalCancelar() {
    this.modalCancelarVisible   = false;
    this.cotizacionSeleccionada = null;
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  confirmarCancelar() {
    // this.cotizacionService
    //   .cancelarCotizacion(this.cotizacionSeleccionada.id)
    //   .subscribe(() => {
    //     this.cerrarModalCancelar();
    //     this.cargarCotizaciones();
    //   });

    this.loading = true;

    var that = this;

    this.api_serv.putQuery(`plaza_vestido/quotes/${ this.cotizacionSeleccionada.id }/set_estado_and_entrega`, { estado: 'cancelada' })
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

        that.cerrarModalCancelar();
        that.getListado();
        
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  // ── Finalizar ───────────────────────────────────────────
  abrirModalFinalizar(cotizacion: any) {
    this.cotizacionSeleccionada  = cotizacion;
    this.formFinalizar.tipo_entrega = '';
    this.formFinalizar.costo_guia = null;
    this.modalFinalizarVisible = true;
    this.open(this.modalFinalizar);
  }

  cerrarModalFinalizar() {
    this.modalFinalizarVisible  = false;
    this.cotizacionSeleccionada = null;
    this.formFinalizar.tipo_entrega = '';
    this.formFinalizar.costo_guia = null;
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  confirmarFinalizar() {
    const id = this.cotizacionSeleccionada.id;

    let body : any = {};

    if (!this.cotizacionSeleccionada.tipo_entrega && this.formFinalizar.tipo_entrega) {
      body = {
        tipo_entrega: this.formFinalizar.tipo_entrega,
        costo_guia: (this.formFinalizar.tipo_entrega === 'envio') ? this.formFinalizar.costo_guia : null,
        estado: 'finalizada',
      };
    }else{
      body = {
        estado: 'finalizada',
      };
    }

    this.loading = true;

    var that = this;

    this.api_serv.putQuery(`plaza_vestido/quotes/${ this.cotizacionSeleccionada.id }/set_estado_and_entrega`, body)
    .subscribe({
      next(response : any) {
           
        console.log(response);

        that.loading = false;
        // that.showToast('success', 'Success!', response.message);

        that.cerrarModalFinalizar();
        that.getListado();
        
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }


}
