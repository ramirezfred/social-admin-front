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
  selector: 'bot-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class BotUsuariosComponent implements OnInit {

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

  selectObj : any = null;
  selectObjIndex : number = null;
  selectObjIndex2 : number = null;

  chat : any = null;
  @ViewChild('modalChat') modalChat : ElementRef;
  newMessage = '';

  @ViewChild('modalEmpresa') modalEmpresa : ElementRef;
  empresa = null;

  @ViewChild('modalHabilidades') modalHabilidades : ElementRef;

  constructor(private modalService: NgbModal,
         private toasterService: ToasterService,
         private router: Router,
         public fb: FormBuilder,
         public themeService:NbThemeService,
         private api_serv: SocialApiService,
         private sanitizer: DomSanitizer,) { 

  

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
        }else if (this.listado[i].nombre.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
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
    }
  }


  getListado(): void {

    this.listado = [];
    this.filteredItems = this.listado;
    this.init();

    this.loading = true;
    //this.showToast('info', 'Info!', 'Consultando...');
    
    var that = this;

    this.api_serv.getQuery(`bots_cliente`)
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

    this.api_serv.putQuery(`bots_cliente/status/${obj.id}`, datos)
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
    this.selectObj = null;
    this.selectObjIndex = null;
    this.selectObjIndex2 = null;
  }

  getChat(cliente_id): void {

    this.chat = null;

    this.loading = true;
    //this.showToast('info', 'Info!', 'Consultando...');
    
    var that = this;

    this.api_serv.getQuery(`bots_chat/${cliente_id}`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.chat = data.chat;  
        that.loading = false;  
        that.open2(that.modalChat); 

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  aEditarEmpresa(item, index: number): void {
    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
    this.empresa = this.selectObj.empresa;

    this.open(this.modalEmpresa);
  }

  editarEmpresa(): void {

    this.loading = true;

    var datos = {
      empresa : this.empresa,
    };

    var that = this;

    this.api_serv.putQuery(`bots_cliente/${ this.selectObj.id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.data=data;
        
        that.loading = false;
        //that.showToast('success', 'Success!', data.message);
        for (var i = 0; i < that.listado.length; ++i) {
          if(that.listado[i].id == that.selectObj.id){
            that.listado[i].empresa = that.empresa;
          }
        }

        //para cerrar la modal
        let click_event = new CustomEvent('click');
        let btn_element = document.querySelector('#btnAtras');
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

  aEditarHabilidades(item, index: number): void {
    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    this.open(this.modalHabilidades);
  }

  ChangeHab(hab,obj){
    //console.log(hab);
    this.setHab(hab,obj);
  }

  setHab(hab,obj){

    let hab_aux = null;

    if(hab == 1){
      if(!obj.hab_citas){
        hab_aux = 0;
      }else if(obj.hab_citas){
        hab_aux = 1;
      }
    }else if(hab == 2){
      if(!obj.hab_redes){
        hab_aux = 0;
      }else if(obj.hab_redes){
        hab_aux = 1;
      }
    }else if(hab == 3){
      if(!obj.hab_pedidos){
        hab_aux = 0;
      }else if(obj.hab_pedidos){
        hab_aux = 1;
      }
    }else if(hab == 4){
      if(!obj.hab_cotizaciones){
        hab_aux = 0;
      }else if(obj.hab_cotizaciones){
        hab_aux = 1;
      }
    }else if(hab == 5){
      if(!obj.hab_facturas){
        hab_aux = 0;
      }else if(obj.hab_facturas){
        hab_aux = 1;
      }
    }

    this.loading = true;
    //this.showToast('info', 'Info!', 'Consultando...');

    var datos = null;
    
    if(hab == 1){
      datos = {
        hab_citas : hab_aux,
      };
    }else if(hab == 2){
      datos = {
        hab_redes : hab_aux,
      };
    }else if(hab == 3){
      datos = {
        hab_pedidos : hab_aux,
      };
    }else if(hab == 4){
      datos = {
        hab_cotizaciones : hab_aux,
      };
    }else if(hab == 5){
      datos = {
        hab_facturas : hab_aux,
      };
    }

    var that = this;

    this.api_serv.putQuery(`bots_cliente/${obj.id}`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        that.loading = false;
        //that.showToast('success', 'Success!', data.message); 
        for (var i = 0; i < that.listado.length; ++i) {
          if(that.listado[i].id == that.selectObj.id){
            if(hab == 1){              
                that.listado[i].hab_citas = hab_aux;
            }else if(hab == 2){              
                that.listado[i].hab_redes = hab_aux;
            }else if(hab == 3){              
                that.listado[i].hab_pedidos = hab_aux;
            }else if(hab == 4){              
                that.listado[i].hab_cotizaciones = hab_aux;
            }else if(hab == 5){              
                that.listado[i].hab_facturas = hab_aux;
            }
          }
        }

        //para cerrar la modal
        // let click_event = new CustomEvent('click');
        // let btn_element = document.querySelector('#btnAtras2');
        // btn_element.dispatchEvent(click_event);

        //that.atras();     

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  updateMaxFacturas(obj){

    var datos = {
      max_facturas : this.selectObj.max_facturas
    };

    this.loading = true;
    var that = this;

    this.api_serv.putQuery(`bots_cliente/${obj.id}`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        that.loading = false;   
        //that.showToast('success', 'Success!', data.message); 
        for (var i = 0; i < that.listado.length; ++i) {
          if(that.listado[i].id == that.selectObj.id){
            that.listado[i].max_facturas = that.selectObj.max_facturas;
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

  aEliminarUser(item, index: number): void {
    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;
  }

  eliminarUser(): void {

    this.loading = true;

    var that = this;

    this.api_serv.deleteQuery(`bots_cliente/${ this.selectObj.id }`)
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

 

}
