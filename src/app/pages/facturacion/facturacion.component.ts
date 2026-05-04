import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NbSpinnerService, NbThemeService } from '@nebular/theme';

//Mis imports
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { RutaBaseService } from '../../services/ruta-base/ruta-base.service';

import { FormBuilder  } from '@angular/forms';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Location } from '@angular/common';

import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { PagosComponent } from './components/pagos/pagos.component';


@Component({
  selector: 'facturacion',
  styleUrls: ['./facturacion.component.scss'],
  templateUrl: './facturacion.component.html',
})

export class FacturacionComponent implements OnInit{

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

	@ViewChild(UsuariosComponent) UsuariosC: UsuariosComponent;
	@ViewChild(PagosComponent) PagosC: UsuariosComponent;

	selectedTab1 = true;
	selectedTab2 = false;


	constructor( private modalService: NgbModal,
	       private toasterService: ToasterService,
	       private http: HttpClient,
	       private router: Router,
	       private rutaService: RutaBaseService,
	       public fb: FormBuilder,
		   private _location: Location,
		   public nbspinnerservice:NbSpinnerService,
			public themeService:NbThemeService)
	{
		

	}

	ngOnInit() {

		//this.themeService.changeTheme('cosmic');
		this.themeService.changeTheme('default');

		this.selectedTab1 = true;
    	this.UsuariosC.initComponent();

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

	//Abrir modal estatica
	openModalPass(modal) {
		this.modalService.open(modal , { backdrop: 'static', container: 'nb-layout', keyboard: false});
	}

	goBack(){
		this._location.back();
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

  selectTab(index){
  	if(index == 1){
      this.selectedTab1 = true;
      this.selectedTab2 = false;
      this.UsuariosC.initComponent();
    }else if(index == 2){
      this.selectedTab1 = false;
      this.selectedTab2 = true;
      this.PagosC.initComponent();
    }

  }

  

}
