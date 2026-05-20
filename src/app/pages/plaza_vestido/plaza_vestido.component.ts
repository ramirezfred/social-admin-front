import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NbSpinnerService, NbThemeService } from '@nebular/theme';

import { Location } from '@angular/common';

import { QuotesComponent } from './components/quotes/quotes.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { HistoryComponent } from './components/history/history.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { StatisticsComponent } from './components/statistics/statistics.component';

import { SesionService } from '../../services/sesion/sesion.service';

@Component({
  selector: 'plaza_vestido',
  styleUrls: ['./plaza_vestido.component.scss'],
  templateUrl: './plaza_vestido.component.html',
})

export class PlazaVestidoComponent implements OnInit{

	//@ViewChildren(QuotesComponent) QuotesC: QueryList<QuotesComponent>;
	@ViewChild(QuotesComponent) QuotesC: QuotesComponent;
	@ViewChild(SuppliersComponent) SuppliersC: SuppliersComponent;
	@ViewChild(HistoryComponent) HistoryC: HistoryComponent;
	@ViewChild(EmployeesComponent) EmployeesC: EmployeesComponent;
	@ViewChild(StatisticsComponent) StatisticsC: StatisticsComponent;
	selectedTab1 = true;
	selectedTab2 = false;
	selectedTab3 = false;
	selectedTab4 = false;
	selectedTab5 = false;
	selectedTab6 = false;

	count_p_cotiznes1 = 0;

	userRole = 0;

	constructor( 
		private _location: Location,
		public nbspinnerservice:NbSpinnerService,
		public themeService:NbThemeService,
		private sesion_serv: SesionService
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

	selectTab(index : number){

		if(index == 1){
			this.selectedTab1 = true;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.selectedTab5 = false;
			this.selectedTab6 = false;
			this.QuotesC.initComponent();
		}else if(index == 2){
			this.selectedTab1 = false;
			this.selectedTab2 = true;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.selectedTab5 = false;
			this.HistoryC.initComponent();
		}else if(index == 3){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = true;
			this.selectedTab4 = false;
			this.selectedTab5 = false;
			this.selectedTab6 = false;
			this.SuppliersC.initComponent();
		}else if(index == 4 && this.userRole === 1){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = true;
			this.selectedTab5 = false;
			this.selectedTab6 = false;
			this.EmployeesC.initComponent();
		}else if(index == 5 && this.userRole === 1){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.selectedTab5 = true;
			this.selectedTab6 = false;
		}else if(index == 6){
			this.selectedTab1 = false;
			this.selectedTab2 = false;
			this.selectedTab3 = false;
			this.selectedTab4 = false;
			this.selectedTab5 = false;
			this.selectedTab6 = true;
			this.StatisticsC.initComponent();
		}

	}

}
