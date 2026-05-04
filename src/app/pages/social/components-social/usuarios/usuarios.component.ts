import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';

//Mis imports
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';

import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { NbSpinnerService, NbThemeService } from '@nebular/theme';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';

import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs/Subject';

import { SocialApiService } from '../../../../services/social/api/api.service';

import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'social-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class SocialUsuariosComponent implements OnInit {

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
  private datos:any;
  public loading = false;


  bandera_init = null;

  
  myForm: FormGroup;
  accion : any = null; //0=crear 1=editar
  @ViewChild('modalUser') modalUser : ElementRef;

  public previsualizacion: string;
  public archivos: any = [];
  imagen : any = null;

  service_description = '';
  servicios = [];

  selectObj : any = null;
  selectObjIndex : number = null;
  selectObjIndex2 : number = null;

  myFormMarca: FormGroup;
  accionMarca : any = null; //0=crear 1=editar
  @ViewChild('modalMarca') modalMarca : ElementRef;

  horas = [];
  minutos = [];
  marca_id = null;
  marca_horario = [];
  allDias = false;

  parametro = '';
  marcas = [];
  personalizar_id = null;
  parametros = [];
  parametro2 = '';
  parametros_imagen = [];

  bandera_flujo = null;
  prompt_imagen = null;
  selectedTab1 = true;
  selectedTab2 = false;

  selectedTabApi1 = true;
  selectedTabApi2 = false;
  selectedTabApi3 = false;
  selectedTabApi4 = false;

  pexels_status = null;
  pexels_frase = '';
  pexels_total_results = null;

  comment_status = null;
  comment_prompt = '';
  comment_auto = '';
  comment_footer = '';

  prompt_textos = '';

  constructor(private modalService: NgbModal,
         private toasterService: ToasterService,
         private router: Router,
         public fb: FormBuilder,
         public themeService:NbThemeService,
         private api_serv: SocialApiService,
         private sanitizer: DomSanitizer,) { 

    this.crearFormulario(0);
    this.crearFormularioMarca(0);

    for (var i = 0; i <= 23; ++i) {
      this.horas.push(i.toString().padStart(2,'0'));
    }
    for (var i = 0; i <= 59; ++i) {
      this.minutos.push(i.toString().padStart(2,'0'));
    }

  }

  ngOnInit() {
    this.initComponent();
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
    //token invalido/ausente o token expiro
    if(msg.status == 400 || msg.status == 401){ 
      this.showToast('warning', 'Warning!', msg.error.error);
      this.router.navigateByUrl('/pagessimples/loginf');
    }
    else if(msg.status == 404){ 
      this.showToast('info', 'Info!', msg.error.error);
    }
    else{ 
      this.showToast('error', 'Erro!', msg.error.error);
    }
  }

  //Abrir modal por defecto
  open(modal) {
    this.modalService.open(modal);
  }

  //Abrir modal larga
  open2(modal) {
    this.modalService.open(modal , { size: 'lg', container: 'nb-layout'});
  }

  //Abrir modal estatica
  open3(modal) {
    this.modalService.open(modal , { size: 'sm', backdrop: 'static', container: 'nb-layout', keyboard: false});
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

        if(!this.listado[i].rfc){
          this.listado[i].rfc = '';
        }

        if (this.listado[i].id.toString().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].created_at.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].email.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
           this.filteredItems.push(this.listado[i]);
        }else if (this.listado[i].telefono.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
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
      this.bandera_init = 1;
      this.getListado();
      //this.Ingresar();
    }
  }

  Ingresar(){

    this.loading = true;
   
    var datos= {
      email: 'admin@correo.com',
      password: '12345'
    };

    var that = this;

    this.api_serv.postQuery('auth/login/web', datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.api_serv.setToken(data.access_token, data.expires_in);
        that.loading = false;
        that.getListado();
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
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

    this.api_serv.getQuery(`usuarios/clientes`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.clientes;
        that.filteredItems = that.listado; 
        that.init();  
        that.loading = false;   

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


  ChangeStatus(obj){
    this.setStatus(obj);
  }

  setStatus(obj){

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

  atras(): void {
    this.accion = null;
    this.selectObj = null;
    this.selectObjIndex = null;
    this.accionMarca = null;
    this.selectObjIndex2 = null;
    this.marca_id = null;
    this.marca_horario = [];
    this.bandera_flujo = null;
    this.prompt_imagen = null;
  }

  aCrear(): void {
    this.accion = 0;
    this.crearFormulario(0);
    this.clearImage();

    this.servicios = []; 
    this.service_description = '';

    this.open(this.modalUser);
  }

  aEditar(item, index: number): void {
    this.accion = 1;
    this.crearFormulario(1);

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    this.myForm.patchValue({email : this.selectObj.email});
    this.myForm.patchValue({password : ''});
    this.myForm.patchValue({password2 : ''});
    this.myForm.patchValue({telefono : this.selectObj.telefono});

    this.open(this.modalUser);
  }

  //accion 0=crear 1=editar
  crearFormulario(accion : number = 0) {

    if (accion == 0) {

      this.accion = accion;
      this.myForm = this.fb.group({
        email  : ['', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
        password  : ['', [ Validators.required, Validators.maxLength(50) ]  ],       
        password2  : ['', [ Validators.required, Validators.maxLength(50) ]  ],
        marca  : ['', [ Validators.required, Validators.minLength(3) ]  ],    
        logo  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
        telefono  : ['', [ Validators.required, Validators.compose([Validators.minLength(10),Validators.maxLength(10)]), Validators.pattern('^[0-9]+$') ]  ],
      });    
    
    }else{
      this.accion = accion;
      this.myForm = this.fb.group({
        email  : ['', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
        password  : ['', [ Validators.maxLength(50) ]  ],       
        password2  : ['', [ Validators.maxLength(50) ]  ],
        marca  : [''],    
        logo  : [''],
        telefono  : ['', [ Validators.required, Validators.compose([Validators.minLength(10),Validators.maxLength(10)]), Validators.pattern('^[0-9]+$') ]  ],
      }); 
    }
    
  }

  cargarDataMyForm(){
    this.myForm.patchValue({email : ''});
    this.myForm.patchValue({password : ''});
    this.myForm.patchValue({password2 : ''});
    this.myForm.patchValue({marca : ''});
    this.myForm.patchValue({logo : ''});
    this.myForm.patchValue({telefono : ''});

    Object.values( this.myForm.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

    this.servicios = [];
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

  get marcaNoValido() {
    return this.myForm.get('marca').invalid && this.myForm.get('marca').touched
  }

  get telefonoNoValido() {
    return this.myForm.get('telefono').invalid && this.myForm.get('telefono').touched
  }

  guardar(){

    if ( this.myForm.invalid ) {

      if (this.accion == 0) {
        if(this.myForm.value.logo == '' || this.myForm.value.logo == null){
          this.showToast('warning', 'Warning!', 'Suba una imagen.');
        }
      }

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
        }else if (this.servicios.length == 0) {
          this.showToast('error', 'Erro!', 'Debe tener configurado al menos un servicio.');
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
      email: this.myForm.value.email,
      password: this.myForm.value.password,
      marca: this.myForm.value.marca,
      logo: this.myForm.value.logo,
      servicios: JSON.stringify(this.servicios),
      telefono: this.myForm.value.telefono,
    }

    var that = this;

    this.api_serv.postQuery(`usuarios/crear`, datos)
    .subscribe({
      next(data : any) {
           
        console.log(data);
        that.data=data;
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);

        //para cerrar la modal
        let click_event = new CustomEvent('click');
        let btn_element = document.querySelector('#btnAtras');
        btn_element.dispatchEvent(click_event);

        that.cargarDataMyForm();
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

    var datos = {
      email : this.myForm.value.email,
      password : this.myForm.value.password,
      telefono : this.myForm.value.telefono,
    };

    var that = this;

    this.api_serv.putQuery(`usuarios/${ this.selectObj.id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);

        //para cerrar la modal
        let click_event = new CustomEvent('click');
        let btn_element = document.querySelector('#btnAtras');
        btn_element.dispatchEvent(click_event);

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

  capturarFile(event): any {
    const archivoCapturado = event.target.files[0]
    this.extraerBase64(archivoCapturado).then((imagen: any) => {
      this.previsualizacion = imagen.base;
      console.log(imagen);

    })
    this.archivos.push(archivoCapturado)
    // 
    // console.log(event.target.files);

    setTimeout(()=>{
      this.subirArchivo();
    },200);

  }

  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        });
      };

    } catch (e) {
      return null;
    }
  })


  /**
   * Limpiar imagen
   */
  clearImage(): any {
    this.previsualizacion = '';
    this.archivos = [];
    this.myForm.patchValue({logo : ''});
    this.myFormMarca.patchValue({logo : ''});
    this.imagen = null;
  }

  /**
   * Subir archivo
   */
  subirArchivo(): any {
    try {
      this.loading = true;
      const formularioDeDatos = new FormData();
      /* this.archivos.forEach(archivo => {
        formularioDeDatos.append('files', archivo)
      }) */

      if (this.archivos.length > 0) {
        formularioDeDatos.append('imagen', this.archivos[0]);        
        formularioDeDatos.append('carpeta', 'marcas');      
        formularioDeDatos.append('url_imagen', this.api_serv.getRutaImages());

        this.loading = true;

      }else{

        this.showToast('warning', 'Warning!', 'Seleccione una imagen');

      }

      var that = this;
      
      this.api_serv.postQueryUpload('imagenes', formularioDeDatos)
      .subscribe({
        next(data : any) {
          //console.log(data);
          console.log('Respuesta del servidor', data);
          that.myForm.patchValue({logo : data.imagen});
          that.myFormMarca.patchValue({logo : data.imagen});
          that.imagen = data.imagen;
          //that.uploadForm.get('imagen').setValue(data.imagen);
          that.loading = false;

          //that.showToast('success', 'Success!', data.message);
          
        },
        error(msg) {
          console.log(msg);
          that.loading = false;

          that.tratarError(msg);
  
        }
      });

    } catch (e) {
      this.loading = false;
      console.log('ERROR', e);
    }
  }

  newService(){
    //console.log(forma);

    if(this.service_description == null || this.service_description == ''){

      return;

    }else{

      let esta = false;

      for (var i = 0; i < this.servicios.length; ++i) {
        if(this.servicios[i] == this.service_description){
          esta = true;
        }
      }

      if(!esta){
        this.servicios.push(this.service_description);
        this.service_description = '';
      }else{
        this.showToast('warning', 'Warning!', 'Ya tienes un servicio con esa descripción.');
      }

    }
  }

  removeServiceForm(index){
    if(this.servicios.length == 1){
      this.showToast('warning', 'Warning!', 'Debe tener configurado al menos un servicio.');
    }

    this.servicios.splice(index, 1);
  }

  //accion 0=crear 1=editar
  crearFormularioMarca(accion : number = 0) {

    if (accion == 0) {

      this.accionMarca = accion;
      this.myFormMarca = this.fb.group({
        nombre  : ['', [ Validators.required, Validators.minLength(3) ]  ],       
        logo  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
      });    
    
    }else{
      this.accionMarca = accion;
      this.myFormMarca = this.fb.group({
        nombre  : ['', [ Validators.required, Validators.minLength(3) ]  ],    
        logo  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
      }); 
    }
    
  }

  get nombreNoValido() {
    return this.myFormMarca.get('nombre').invalid && this.myFormMarca.get('nombre').touched
  }

  cargarDataMyFormMarca(){
    this.myFormMarca.patchValue({nombre : ''});
    this.myFormMarca.patchValue({logo : ''});

    Object.values( this.myFormMarca.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

    this.servicios = [];
  }

  aCrearMarca(item, index: number): void {
    this.accionMarca = 0;
    this.crearFormularioMarca(0);

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    this.clearImage();

    this.servicios = []; 
    this.service_description = '';

    this.open(this.modalMarca);
  }

  aEditarMarca(item, index: number, index2: number): void {
    this.accionMarca = 1;
    this.crearFormularioMarca(1);

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
    this.selectObjIndex2 = index2;

    this.myFormMarca.patchValue({nombre : this.selectObj.nombre});
    this.myFormMarca.patchValue({logo : this.selectObj.logo});

    this.servicios = this.selectObj.servicios;
    this.service_description = '';

    this.previsualizacion = this.selectObj.logo;

    this.open(this.modalMarca);
    
  }

  guardarMarca(): void {
    console.log( this.myFormMarca );

    if ( this.myFormMarca.invalid ) {

      if(this.myFormMarca.value.logo == '' || this.myFormMarca.value.logo == null){
        this.showToast('warning', 'Warning!', 'Suba una imagen.');
      }

      return Object.values( this.myFormMarca.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{
      if (this.servicios.length == 0) {
        this.showToast('error', 'Erro!', 'Debe tener configurado al menos un servicio.');
      }else{
        if (this.accionMarca == 0) {
          this.crearMarca();
        }else if (this.accionMarca == 1) {
          this.editarMarca();
        }
      }
      
    }
  }

  crearMarca(): void {
    
    var datos = {
      nombre : this.myFormMarca.value.nombre,
      logo : this.myFormMarca.value.logo,
      user_id: this.selectObj.id,
      servicios: JSON.stringify(this.servicios) 
    };

    this.loading = true;

    var that = this;

    this.api_serv.postQuery('marcas', datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);
        //that.listado[that.selectObjIndex].marcas.push(data.marca);
        for (var i = 0; i < that.listado.length; ++i) {
          if(that.listado[i].id == that.selectObj.id){
            that.listado[i].marcas.push(data.marca);
          }
        }

        //para cerrar la modal
        let click_event = new CustomEvent('click');
        let btn_element = document.querySelector('#btnAtras2');
        btn_element.dispatchEvent(click_event);

        that.cargarDataMyFormMarca();
        that.atras();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }

  editarMarca(): void {

    var datos = {
      nombre : this.myFormMarca.value.nombre,
      logo : this.myFormMarca.value.logo,
      servicios: JSON.stringify(this.servicios)
    };

    this.loading = true;

    var that = this;

    this.api_serv.putQuery(`marcas/${ this.selectObj.id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        //that.listado[that.selectObjIndex].marcas[that.selectObjIndex2] = data.marca;
        for (var i = 0; i < that.listado.length; ++i) {
          for (var j = 0; j < that.listado[i].marcas.length; ++j) {
            if(that.listado[i].marcas[j].id == that.selectObj.id){
              that.listado[i].marcas[j] = data.marca;
              console.log(that.listado[i]);
            }
          }
        }
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);

        //para cerrar la modal
        let click_event = new CustomEvent('click');
        let btn_element = document.querySelector('#btnAtras2');
        btn_element.dispatchEvent(click_event);

        that.cargarDataMyFormMarca();
        that.atras();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }

  aEliminarUser(item, index: number): void {
    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
  }

  aEliminarMarca(item, index: number, index2: number): void {
    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
    this.selectObjIndex2 = index2;
  }

  eliminarUser(): void {

    this.loading = true;

    var that = this;

    this.api_serv.deleteQuery(`usuarios/${ this.selectObj.id }`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        //that.listado.splice(that.selectObjIndex, 1);
        for (var i = 0; i < that.listado.length; ++i) {
          if(that.listado[i].id == that.selectObj.id){
            that.listado.splice(i, 1);
          }
        }

        that.filteredItems = that.listado;
        that.init();
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);
        that.atras();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }

  eliminarMarca(): void {

    this.loading = true;

    var that = this;

    this.api_serv.deleteQuery(`marcas/${ this.selectObj.id }`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        //that.listado[that.selectObjIndex].marcas.splice(that.selectObjIndex2, 1);
        for (var i = 0; i < that.listado.length; ++i) {
          for (var j = 0; j < that.listado[i].marcas.length; ++j) {
            if(that.listado[i].marcas[j].id == that.selectObj.id){
              that.listado[i].marcas.splice(j, 1);
              console.log(that.listado[i]);
            }
          }
        }
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);
        that.atras();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }

  ChangeStatusMarca(){
    this.setStatusMarca();
  }

  setStatusMarca(){

    let status_aux = null;

    if(!this.selectObj.status){
      status_aux = 0;
    }else if(this.selectObj.status){
      status_aux = 1;
    }

    this.loading = true;
    
    var datos = {
      status : status_aux,
    };

    var that = this;

    this.api_serv.putQuery(`marcas/status/${this.selectObj.id}`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        //that.listado[that.selectObjIndex].marcas[that.selectObjIndex2].status = status_aux;
        for (var i = 0; i < that.listado.length; ++i) {
          for (var j = 0; j < that.listado[i].marcas.length; ++j) {
            if(that.listado[i].marcas[j].id == that.selectObj.id){
              that.listado[i].marcas[j].status = status_aux;
              console.log(that.listado[i]);
            }
          }
        }

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

  aEditarHorario(item, index: number, index2: number): void{

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
    this.selectObjIndex2 = index2;

    this.marca_id = this.selectObj.id;
    this.marca_horario = this.selectObj.horario;

    this.allDias = true;
    for (var i = 0; i < this.marca_horario.length; ++i) {
      if(!this.marca_horario[i].sel){
        this.allDias = false;
      }
    }
  }

  toggleDaysSelection(){
    if(!this.allDias){
      for (var i = 0; i < this.marca_horario.length; ++i) {
        this.marca_horario[i].sel = true;
      }
    }else{
      for (var i = 0; i < this.marca_horario.length; ++i) {
        this.marca_horario[i].sel = false;
      }
    }
  }

  editarHorario(): void {

    var datos = {
      horario : JSON.stringify(this.marca_horario),
    };

    this.loading = true;

    var that = this;

    this.api_serv.putQuery(`marcas/horario/${ this.marca_id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        
        //that.listado[that.selectObjIndex].marcas[that.selectObjIndex2].horario = data.horario;
        //that.showToast('success', 'Success!', data.message);
        for (var i = 0; i < that.listado.length; ++i) {
          for (var j = 0; j < that.listado[i].marcas.length; ++j) {
            if(that.listado[i].marcas[j].id == that.selectObj.id){
              that.listado[i].marcas[j].horario = data.horario;
              console.log(that.listado[i]);
            }
          }
        }

        that.atras();
        that.loading = false;

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }

  aPersonalizarMarcas(item, index: number){
    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
    this.selectObjIndex2 = null;

    this.parametro = '';
    this.marcas = this.selectObj.marcas;
    this.personalizar_id = null;
    this.parametros = [];
    this.parametro2 = '';
    this.parametros_imagen = [];

    this.pexels_status = null;
    this.pexels_frase = '';
    this.pexels_total_results = null;

    this.comment_status = null;
    this.comment_prompt = '';
    this.comment_auto = '';
    this.comment_footer = '';

    this.prompt_textos = '';

    if(this.marcas.length > 0){
      this.selectObjIndex2 = 0;
      this.personalizar_id = this.marcas[0].id;
      this.parametros = this.marcas[0].parametros;
      this.parametros_imagen = this.marcas[0].parametros_imagen;
      this.bandera_flujo = this.marcas[0].bandera_flujo.toString();
      this.prompt_imagen = this.marcas[0].prompt_imagen;
      this.selectTab(parseInt(this.bandera_flujo));

      this.pexels_status = this.marcas[0].pexels_status;
      this.pexels_frase = this.marcas[0].pexels_frase;
      this.getPexelsTotalResults();

      this.comment_status = this.marcas[0].comment_status;
      if(this.comment_status === null){
        this.comment_status = 0;
      }
      this.comment_status = this.comment_status.toString();
      this.comment_prompt = this.marcas[0].comment_prompt;
      this.comment_auto = this.marcas[0].comment_auto;
      this.comment_footer = this.marcas[0].comment_footer;

      this.prompt_textos = this.marcas[0].prompt_textos;
      
    }

  }

  changePersonalizar(value){
    //console.log(value);

    this.pexels_total_results = null;

    for (var i = 0; i < this.marcas.length; ++i) {
      if(this.marcas[i].id == value){
        this.selectObjIndex2 = i;
        this.parametros = this.marcas[i].parametros;
        this.parametros_imagen = this.marcas[i].parametros_imagen;
        this.bandera_flujo = this.marcas[i].bandera_flujo.toString();
        this.prompt_imagen = this.marcas[i].prompt_imagen;
        this.selectTab(parseInt(this.bandera_flujo));

        this.pexels_status = this.marcas[i].pexels_status;
        this.pexels_frase = this.marcas[i].pexels_frase;
        this.getPexelsTotalResults();

        this.comment_status = this.marcas[i].comment_status;
        this.comment_prompt = this.marcas[i].comment_prompt;
        this.comment_auto = this.marcas[i].comment_auto;
        this.comment_footer = this.marcas[i].comment_footer;

        this.prompt_textos = this.marcas[i].prompt_textos;
        
      }
    }
  }

  newParametro(){

    if(this.parametro == null || this.parametro == ''){

      return;

    }else{

      let esta = false;

      for (var i = 0; i < this.parametros.length; ++i) {
        if(this.parametros[i] == this.parametro){
          esta = true;
        }
      }

      if(!esta){
        this.parametros.push(this.parametro);
        this.parametro = '';
      }else{
        this.showToast('warning', 'Warning!', 'Ya tienes un parámetro con esa descripción.');
      }

    }
  }

  newParametroImagen(){

    if(this.parametro2 == null || this.parametro2 == ''){

      return;

    }else{

      let esta = false;

      for (var i = 0; i < this.parametros_imagen.length; ++i) {
        if(this.parametros_imagen[i] == this.parametro2){
          esta = true;
        }
      }

      if(!esta){
        this.parametros_imagen.push(this.parametro2);
        this.parametro2 = '';
      }else{
        this.showToast('warning', 'Warning!', 'Ya tienes un parámetro con esa descripción.');
      }

    }
  }

  removeParametro(index){
    this.parametros.splice(index, 1);
  }

  removeParametroImagen(index){
    this.parametros_imagen.splice(index, 1);
  }

  personalizarMarca(): void {

    var datos = {
      parametros: JSON.stringify(this.parametros),
      parametros_imagen: JSON.stringify(this.parametros_imagen),
      bandera_flujo: parseInt(this.bandera_flujo),
      prompt_imagen: this.prompt_imagen,
      pexels_frase : this.pexels_frase,
      comment_status : this.comment_status,
      comment_prompt : this.comment_prompt,
      comment_auto : this.comment_auto,
      comment_footer : this.comment_footer,
      prompt_textos : this.prompt_textos,
    };

    this.loading = true;

    var that = this;

    this.api_serv.putQuery(`marcas/update_admin/${ this.personalizar_id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        //that.listado[that.selectObjIndex].marcas[that.selectObjIndex2] = data.marca;
        for (var i = 0; i < that.listado.length; ++i) {
          if(that.listado[i].id == that.selectObj.id){
            that.listado[i].marcas[that.selectObjIndex2] = data.marca;
          }
        }
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);

        //para cerrar la modal
        let click_event = new CustomEvent('click');
        let btn_element = document.querySelector('#btnAtras3');
        btn_element.dispatchEvent(click_event);

        that.atras();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }

  onOptionSelected(){
    console.log(this.bandera_flujo);
    this.selectTab(parseInt(this.bandera_flujo));
  }

  selectTab(index){
    if(index == 0){
      this.selectedTab1 = true;
      this.selectedTab2 = false;
    }else if(index == 1){
      this.selectedTab1 = false;
      this.selectedTab2 = true;
    }
  }

  encryptId(option, email, tlf, marca, marca_id){

    this.loading = true;

    var that = this;

    let cadenaEncriptada = '';

    this.api_serv.getQuery(`crypt/encrypt/${ marca_id }`)
    .subscribe({
      next(data : any) {
        console.log(data);
        //that.data=data;

        that.loading = false;

        cadenaEncriptada = data.cadenaEncriptada;

        if (option == 1) {
          that.enviarLinkPago(email, tlf, marca, cadenaEncriptada);
        }
        if (option == 2) {
          that.enviarLinkVincularRedes(email, tlf, marca, cadenaEncriptada);
        }
        

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });
  }

  enviarLinkPago(email, tlf, marca, marca_id) {

    let link = 'https://social.internow.com.mx/#/pagar-marca/'+marca_id;
    let texto = '';

    texto = '¡Hola '+marca+'! Aquí te envío el enlace para que puedas realizar el pago por el servicio que nos has solicitado.%0A%0A'+link+'%0A%0ASimplemente haz clic en el siguiente enlace y paga fácil.';

    texto = texto.replace(/#/g, "%23");
    texto = texto.replace(/&/g, "%26");

    var objeto_window_referencia;
    var configuracion_ventana = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";

    //let telefono = '584247027209'; //Freddy
    let telefono = '521'+tlf; //Cliente

    objeto_window_referencia = window.open("https://wa.me/"+telefono+"?text="+texto, "WhatsApp", configuracion_ventana);

  }

  enviarLinkVincularRedes(email, tlf, marca, marca_id) {

    let link = 'https://social.internow.com.mx/#/vincularedes/'+marca_id;
    let texto = '';

    texto = 'Descubre nuestra Inteligencia Artificial en acción. Inicia sesión de tus redes sociales y vive la experiencia *InterNow*, ya no te preocupes de las publicaciones.%0A%0ALoguea primero Facebook y después instagram al detectar la IA qué logueate las redes sociales empezará el algoritmo para publicar automáticamente vale.%0A%0A'+link+'%0A%0A¡Te encantará!%0A%0APD. Si se contrata el servicio tendrás muchas más tipos de imagenes y herramientas.';

    texto = texto.replace(/#/g, "%23");
    texto = texto.replace(/&/g, "%26");

    var objeto_window_referencia;
    var configuracion_ventana = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";

    //let telefono = '584247027209'; //Freddy
    let telefono = '521'+tlf; //Cliente

    objeto_window_referencia = window.open("https://wa.me/"+telefono+"?text="+texto, "WhatsApp", configuracion_ventana);

  }

  agenerarTextosUser(item, index: number): void {
    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
  }

  generarTextosUser(): void {

    var datos = {
    };

    this.loading = true;

    var that = this;

    this.api_serv.getQuery(`open_ai/generar/textos/usuario/${ this.selectObj.id }`)
    .subscribe({
      next(data : any) {
        console.log(data);
        //that.data=data;
        
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);

        //para cerrar la modal
        // let click_event = new CustomEvent('click');
        // let btn_element = document.querySelector('#btnAtras4');
        // btn_element.dispatchEvent(click_event);

        that.atras();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }

  verRed(red){
    //console.log(red);

    var objeto_window_referencia;
    var configuracion_ventana = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";

    var link_red = '';

    if(red.tipo == 1){
      link_red = 'https://www.facebook.com/profile.php?id='+red.page_id;
    }
    if(red.tipo == 2){
      link_red = 'https://www.instagram.com/'+red.page_name+'/';
    }

    objeto_window_referencia = window.open(link_red, configuracion_ventana);
  }

  selectTabApi(index){
    if(index == 0){
      this.selectedTabApi1 = true;
      this.selectedTabApi2 = false;
      this.selectedTabApi3 = false;
      this.selectedTabApi4 = false;
    }else if(index == 1){
      this.selectedTabApi1 = false;
      this.selectedTabApi2 = true;
      this.selectedTabApi3 = false;
      this.selectedTabApi4 = false;
    }else if(index == 2){
      this.selectedTabApi1 = false;
      this.selectedTabApi2 = false;
      this.selectedTabApi3 = true;
      this.selectedTabApi4 = false;
    }else if(index == 3){
      this.selectedTabApi1 = false;
      this.selectedTabApi2 = false;
      this.selectedTabApi3 = false;
      this.selectedTabApi4 = true;
    }

  }

  ChangeStatusPexels(){
    this.setStatusPexels();
  }

  setStatusPexels(){

    let pexels_status_aux = null;

    if(!this.pexels_status){
      pexels_status_aux = 0;
    }else if(this.pexels_status){
      pexels_status_aux = 1;
    }

    this.loading = true;
    
    var datos = {
      pexels_status : pexels_status_aux,
      pexels_frase : this.pexels_frase,
    };

    var that = this;

    this.api_serv.putQuery(`marcas/update_admin/${ this.personalizar_id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        //that.listado[that.selectObjIndex].marcas[that.selectObjIndex2] = data.marca;
        for (var i = 0; i < that.listado.length; ++i) {
          if(that.listado[i].id == that.selectObj.id){
            that.listado[i].marcas[that.selectObjIndex2] = data.marca;
          }
        }
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);

        //para cerrar la modal
        // let click_event = new CustomEvent('click');
        // let btn_element = document.querySelector('#btnAtras3');
        // btn_element.dispatchEvent(click_event);

        // that.atras();      

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  getPexelsTotalResults(){

    if(this.pexels_frase && this.pexels_frase != ''){
      var that = this;

      this.api_serv.getQuery(`pexels/count/results/${ this.pexels_frase }`)
      .subscribe({
        next(data : any) {
          console.log(data);
          that.pexels_total_results = data.total_results;

        },
        error(msg) {
          console.log(msg);
          //that.loading = false;
          that.tratarError(msg);

        }
      });      
    }

  }

  onBlurPexels(){
    this.getPexelsTotalResults();
  }

  ChangeStatusComments(){
    this.setStatusComments(0);
  }

  onOptionCommentsSelected(){
    //console.log(this.comment_status);
    this.setStatusComments(parseInt(this.comment_status));
  }

  setStatusComments(comment_status_aux){

    // let comment_status_aux = null;

    // if(!this.comment_status){
    //   comment_status_aux = 0;
    // }else if(this.comment_status){
    //   comment_status_aux = 1;
    // }

    this.loading = true;
    
    var datos = {
      comment_status : comment_status_aux,
      comment_prompt : this.comment_prompt,
      comment_auto : this.comment_auto,
    };

    var that = this;

    this.api_serv.putQuery(`marcas/update_admin/${ this.personalizar_id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        //that.listado[that.selectObjIndex].marcas[that.selectObjIndex2] = data.marca;
        for (var i = 0; i < that.listado.length; ++i) {
          if(that.listado[i].id == that.selectObj.id){
            that.listado[i].marcas[that.selectObjIndex2] = data.marca;
          }
        }
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);

        //para cerrar la modal
        // let click_event = new CustomEvent('click');
        // let btn_element = document.querySelector('#btnAtras3');
        // btn_element.dispatchEvent(click_event);

        // that.atras();      

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  aCobrarMarca(item, index: number, index2: number): void {
    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
    this.selectObjIndex2 = index2;
  }

  cobrarMarca(): void {

    this.loading = true;

    var datos = {
    };

    var that = this;

    this.api_serv.postQuery(`conekta/cobro/auto/marca/${ this.selectObj.id }`,datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        that.loading = false;
        that.showToast('success', 'Success!', data.message);
        that.atras();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);

      }
    });

  }

}
