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

import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';

import { SocialUsuariosComponent } from './components-social/usuarios/usuarios.component';
import { SocialPostsComponent } from './components-social/posts/posts.component';
import { SocialSistemaComponent } from './components-social/sistema/sistema.component';
import { SocialMarcosComponent } from './components-social/marcos/marcos.component';
import { SocialImagenesComponent } from './components-social/imagenes/imagenes.component';
import { SocialPostGeneralComponent } from './components-social/post-general/post-general.component';

import { BotUsuariosComponent } from './components-bot/usuarios/usuarios.component';
import { BotConfigComponent } from './components-bot/config/config.component';
import { BotSistemaComponent } from './components-bot/sistema/sistema.component';

@Component({
  selector: 'social',
  styleUrls: ['./social.component.scss'],
  templateUrl: './social.component.html',
})

export class SocialComponent implements OnInit{

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

	//@ViewChildren(CotizacionesComponent) CotizacionesC: QueryList<CotizacionesComponent>;
	@ViewChild(CotizacionesComponent) CotizacionesC: CotizacionesComponent;

	selectedTab1 = true;
	selectedTab2 = false;
	selectedTab3 = false;
	selectedTab4 = false;
	selectedTab5 = false;
	selectedTab6 = false;
	count_p_cotiznes1 = 0;

	//panel social
	//selectedTabSocial1 = true;
	//selectedTabSocial2 = false;
	//selectedTabSocial3 = false;
	@ViewChild(SocialUsuariosComponent) SocialUsuariosC: SocialUsuariosComponent;
	@ViewChild(SocialPostsComponent) SocialPostsC: SocialPostsComponent;
	@ViewChild(SocialSistemaComponent) SocialSistemaC: SocialSistemaComponent;
	@ViewChild(SocialMarcosComponent) SocialMarcosC: SocialMarcosComponent;
	@ViewChild(SocialImagenesComponent) SocialImagenesC: SocialImagenesComponent;
	@ViewChild(SocialPostGeneralComponent) SocialPostGeneralC: SocialPostGeneralComponent;

	@ViewChild(BotUsuariosComponent) BotUsuariosC: BotUsuariosComponent;
	@ViewChild(BotConfigComponent) BotConfigC: BotConfigComponent;
	@ViewChild(BotSistemaComponent) BotSistemaC: BotSistemaComponent;

	selectedTAB1 = true;
	selectedTAB2 = false;

	//panel bot
	selectedTabB1 = true;
	selectedTabB2 = false;
	selectedTabB3 = false;

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

		//this.CotizacionesC.first.getDataTipo1();
		//this.CotizacionesC.getDataTipo1();

		this.selectTAB(1);
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
      this.selectedTab3 = false;
      this.selectedTab4 = false;
      this.selectedTab5 = false;
      this.selectedTab6 = false;
      this.SocialUsuariosC.initComponent();
    }else if(index == 2){
      this.selectedTab1 = false;
      this.selectedTab2 = true;
      this.selectedTab3 = false;
      this.selectedTab4 = false;
      this.selectedTab5 = false;
      this.selectedTab6 = false;
      this.SocialPostsC.initComponent();
    }else if(index == 3){
      this.selectedTab1 = false;
      this.selectedTab2 = false;
      this.selectedTab3 = true;
      this.selectedTab4 = false;
      this.selectedTab5 = false;
      this.selectedTab6 = false;
      this.SocialSistemaC.initComponent();
    }else if(index == 4){
      this.selectedTab1 = false;
      this.selectedTab2 = false;
      this.selectedTab3 = false;
      this.selectedTab4 = true;
      this.selectedTab5 = false;
      this.selectedTab6 = false;
      this.SocialMarcosC.initComponent();
    }else if(index == 5){
      this.selectedTab1 = false;
      this.selectedTab2 = false;
      this.selectedTab3 = false;
      this.selectedTab4 = false;
      this.selectedTab5 = true;
      this.selectedTab6 = false;
      this.SocialImagenesC.initComponent();
    }else if(index == 6){
      this.selectedTab1 = false;
      this.selectedTab2 = false;
      this.selectedTab3 = false;
      this.selectedTab4 = false;
      this.selectedTab5 = false;
      this.selectedTab6 = true;
      this.SocialPostGeneralC.initComponent();
    }

  }

  selectTAB(index){
  	if(index == 1){
      this.selectedTAB1 = true;
      this.selectedTAB2 = false;
    }else if(index == 2){
      this.selectedTAB1 = false;
      this.selectedTAB2 = true;
    }

  }

  selectTabB(index){
  	if(index == 1){
      this.selectedTabB1 = true;
      this.selectedTabB2 = false;
			this.selectedTabB3 = false;
      this.BotUsuariosC.initComponent();
    }else if(index == 2){
      this.selectedTabB1 = false;
      this.selectedTabB2 = true;
			this.selectedTabB3 = false;
			this.BotConfigC.initComponent();
    }else if(index == 3){
      this.selectedTabB1 = false;
      this.selectedTabB2 = false;
			this.selectedTabB3 = true;
			this.BotSistemaC.initComponent();
    }

  }



  

}
