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

import { QuotesComponent } from './components/quotes/quotes.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { HistoryComponent } from './components/history/history.component';

@Component({
  selector: 'plaza_vestido',
  styleUrls: ['./plaza_vestido.component.scss'],
  templateUrl: './plaza_vestido.component.html',
})

export class PlazaVestidoComponent implements OnInit{

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

	//@ViewChildren(QuotesComponent) QuotesC: QueryList<QuotesComponent>;
	@ViewChild(QuotesComponent) QuotesC: QuotesComponent;
	@ViewChild(SuppliersComponent) SuppliersC: SuppliersComponent;
	@ViewChild(HistoryComponent) HistoryC: HistoryComponent;

	selectedTab1 = true;
	selectedTab2 = false;
	selectedTab3 = false;
	selectedTab4 = false;
	count_p_cotiznes1 = 0;

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

		this.selectTab(1);
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

	selectTab(index){

		if(index == 1){
			this.selectedTab1 = true;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.QuotesC.initComponent();
		}else if(index == 2){
			this.selectedTab1 = false;
			this.selectedTab2 = true;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.SuppliersC.initComponent();
		}else if(index == 3){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = true;
			this.selectedTab4 = false;
			this.HistoryC.initComponent();
		}else if(index == 4){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = true;
		}

	}

}
