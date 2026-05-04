import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NbSpinnerService, NbThemeService } from '@nebular/theme';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';

//Mis imports
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';

import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs/Subject';

import { RutaBaseService } from '../../services/ruta-base/ruta-base.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

declare var Conekta: any;
declare let paypal: any;

@Component({
  selector: 'ngx-whatsapp',
  styleUrls: ['./whatsapp.component.scss'],
  templateUrl: './whatsapp.component.html',
  })
export class WhatsappComponent implements OnInit {

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

  base64Image = null;
  base64Image2 = null;

	constructor( private toasterService: ToasterService,
				 private router: Router,
				 private activatedRoute: ActivatedRoute,
				 public nbspinnerservice:NbSpinnerService,
				 public themeService:NbThemeService,
				 private fb: FormBuilder,
         private http: HttpClient,
         private rutaService: RutaBaseService,
         private modalService: NgbModal,
         private ngZone: NgZone,)
	{



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
    this.modalService.open(modal , { size: 'lg', backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  //Abrir modal estatica
  open3(modal) {
    this.modalService.open(modal , { backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  getQR() {

    this.base64Image = null;

    const url = 'https://whatsly.p.rapidapi.com/generate-qr';

    const httpOptions = {
      headers: new HttpHeaders({
        'X-RapidAPI-Key' : '9073b0aae0msh959d8cae6e44acap184ef3jsn5a691021892b',
        'X-RapidAPI-Host' : 'whatsly.p.rapidapi.com'
      })
    };

    var datos= {
    	number: '525574511229',
    }
    
    this.loading = true;
    this.http.post(url, datos, httpOptions)
       .toPromise()
       .then(
         (data:any) => { // Success

            console.log(data);

            this.base64Image = 'data:image/png;base64,' + data.base64_image_data;
            
            this.loading = false;

         },
         msg => { // Error

           this.showToast('error', 'Erro!', 'Error al generar el QR');
           this.loading = false;         

         }
       );
  }

  getQR2() {

    this.base64Image2 = null;

    const url = 'https://whatsapp-api5.p.rapidapi.com/api/v2/qrcode/?base64=true';

    const httpOptions = {
      headers: new HttpHeaders({
        'X-RapidAPI-Key' : '9073b0aae0msh959d8cae6e44acap184ef3jsn5a691021892b',
        'X-RapidAPI-Host' : 'whatsapp-api5.p.rapidapi.com'
      })
    };

    
    this.loading = true;
    this.http.get(url, httpOptions)
       .toPromise()
       .then(
         (data:any) => { // Success

            console.log(data);

            this.base64Image2 = 'data:image/png;base64,' + data.base64_image_data;
            
            this.loading = false;

         },
         msg => { // Error

           this.showToast('error', 'Erro!', 'Error al generar el QR');
           this.loading = false;         

         }
       );
  }

 

}
