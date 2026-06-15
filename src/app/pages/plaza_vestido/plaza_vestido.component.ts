import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NbSpinnerService, NbThemeService } from '@nebular/theme';

import { Location } from '@angular/common';

import { QuotesComponent } from './components/quotes/quotes.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { HistoryComponent } from './components/history/history.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ExpensesAndPayrollComponent } from './components/expenses-and-payroll/expenses-and-payroll.component';
import { CashClosesComponent } from './components/cash-closes/cash-closes.component';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { SesionService } from '../../services/sesion/sesion.service';
import { SocialApiService } from '../../services/social/api/api.service';

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

	//@ViewChildren(QuotesComponent) QuotesC: QueryList<QuotesComponent>;
	@ViewChild(QuotesComponent) QuotesC : QuotesComponent;
	@ViewChild(SuppliersComponent) SuppliersC : SuppliersComponent;
	@ViewChild(HistoryComponent) HistoryC : HistoryComponent;
	@ViewChild(EmployeesComponent) EmployeesC : EmployeesComponent;
	@ViewChild(StatisticsComponent) StatisticsC : StatisticsComponent;
	@ViewChild(ExpensesAndPayrollComponent) ExpensesAndPayrollC : ExpensesAndPayrollComponent;
	@ViewChild(CashClosesComponent) CashClosesC : CashClosesComponent;

	selectedTab1 = true;
	selectedTab2 = false;
	selectedTab3 = false;
	selectedTab4 = false;
	selectedTab5 = false;
	selectedTab6 = false;
	selectedTab7 = false;

	count_p_cotiznes1 = 0;

	userRole = 0;

	modalRef: any;
  	@ViewChild('modalPassword') modalPassword : ElementRef;

	formLogin = { 
		password: null
	};	

	loading = false;

	constructor( 
		private _location: Location,
		public nbspinnerservice:NbSpinnerService,
		public themeService:NbThemeService,
		private sesion_serv: SesionService,
		private api_serv: SocialApiService,
		private modalService: NgbModal,
		private toasterService: ToasterService,
		
	)
	{
		

	}

	ngOnInit() {

		//this.themeService.changeTheme('cosmic');
		this.themeService.changeTheme('default');

		this.selectTab(1);

		this.userRole = this.sesion_serv.getUserRol();
	}

	goBack(){
		this._location.back();
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

	//Abrir modal por defecto
	open(modal : any) {
		this.modalRef = this.modalService.open(modal);
	}

	selectTab(index : number){

		if(index == 1){
			this.selectedTab1 = true;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.selectedTab5 = false;
			this.selectedTab6 = false;
			this.selectedTab7 = false;
			this.QuotesC.initComponent();
		}else if(index == 2){
			this.selectedTab1 = false;
			this.selectedTab2 = true;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.selectedTab5 = false;
			this.selectedTab6 = false;
			this.selectedTab7 = false;
			this.HistoryC.initComponent();
		}else if(index == 3){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = true;
			this.selectedTab4 = false;
			this.selectedTab5 = false;
			this.selectedTab6 = false;
			this.selectedTab7 = false;
			this.SuppliersC.initComponent();
		}else if(index == 4 && this.userRole === 1){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = true;
			this.selectedTab5 = false;
			this.selectedTab6 = false;
			this.selectedTab7 = false;
			this.EmployeesC.initComponent();
		}else if(index == 5 && this.userRole === 1){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.selectedTab5 = true;
			this.selectedTab6 = false;
			this.selectedTab7 = false;
		}else if(index == 6 && this.userRole === 1){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.selectedTab5 = false;
			this.selectedTab6 = true;
			this.selectedTab7 = false;
			this.ExpensesAndPayrollC.initComponent();
		}else if(index == 7 && this.userRole === 1){

			this.formLogin.password = null;
			this.open(this.modalPassword);

		}

	}

	Ingresar(){

		this.loading = true;
		
		var datos= {
			email: this.sesion_serv.getUserEmail(),
			password: this.formLogin.password
		};
		
		this.loading = true;

		var that = this;

		this.api_serv.postQuery('auth/login/web', datos)
		.subscribe({
			next(data : any) {
				//console.log(data);

				that.getUser(data.access_token);
			},
			error(msg) {
				//console.log(msg);

				that.showToast('error', 'Error!', msg.error.error);
				that.loading = false;

			}
		});

	}
	
	getUser(token: string){
	  
		var datos = {};
	
		var that = this;
	
		this.api_serv.getQueryUser('auth/user', token)
		.subscribe({
		  next(data : any) {
			//console.log(data);
		   
			that.loading = false;
			if (data.user.id && (data.user.tipo == 1) ) {

				if (that.modalRef) that.modalRef.close();
				
			  	that.selectedTab1 = false;
				that.selectedTab2 = false;
				that.selectedTab3 = false;
				that.selectedTab4 = false;
				that.selectedTab5 = false;
				that.selectedTab6 = false;
				that.selectedTab7 = true;
				that.CashClosesC.initComponent();
			  
			}else if(data.user.id && data.user.tipo != 1){
				that.showToast('error', 'Error!', 'Acceso no autorizado');
			}else{
			  	that.showToast('error', 'Error!', 'Error al autenticar usuario');
			}
			
		  },
		  error(msg) {
			//console.log(msg);
	
			that.showToast('error', 'Error!', msg.error.error);
		  	that.loading = false;
	
		  }
		});
	
	}

}
