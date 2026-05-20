import { Component, OnInit } from '@angular/core';
import { NbSpinnerService, NbThemeService } from '@nebular/theme';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';

//Mis imports
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { SocialApiService } from '../../services/social/api/api.service';
import { SesionService } from '../../services/sesion/sesion.service';

@Component({
  selector: 'ngx-loginf',
  styleUrls: ['./loginf.component.scss'],
  templateUrl: './loginf.component.html',
  //template: "\n    <div>\n      <h2 class=\"title\">Sign In</h2>\n      <small class=\"form-text sub-title\">Hello! Sign in with your username or email</small>\n\n      <form (ngSubmit)=\"login()\" #form=\"ngForm\" autocomplete=\"nope\">\n\n        <div *ngIf=\"showMessages.error && errors && errors.length > 0 && !submitted\"\n             class=\"alert alert-danger\" role=\"alert\">\n          <div><strong>Oh snap!</strong></div>\n          <div *ngFor=\"let error of errors\">{{ error }}</div>\n        </div>\n\n        <div *ngIf=\"showMessages.success && messages && messages.length > 0 && !submitted\"\n             class=\"alert alert-success\" role=\"alert\">\n          <div><strong>Hooray!</strong></div>\n          <div *ngFor=\"let message of messages\">{{ message }}</div>\n        </div>\n\n        <div class=\"form-group\">\n          <label for=\"input-email\" class=\"sr-only\">Email address</label>\n          <input name=\"email\" [(ngModel)]=\"user.email\" id=\"input-email\" pattern=\".+@.+..+\"\n                 class=\"form-control\" placeholder=\"Email address\" #email=\"ngModel\"\n                 [class.form-control-danger]=\"email.invalid && email.touched\" autofocus\n                 [required]=\"getConfigValue('forms.validation.email.required')\">\n          <small class=\"form-text error\" *ngIf=\"email.invalid && email.touched && email.errors?.required\">\n            Email is required!\n          </small>\n          <small class=\"form-text error\"\n                 *ngIf=\"email.invalid && email.touched && email.errors?.pattern\">\n            Email should be the real one!\n          </small>\n        </div>\n\n        <div class=\"form-group\">\n          <label for=\"input-password\" class=\"sr-only\">Password</label>\n          <input name=\"password\" [(ngModel)]=\"user.password\" type=\"password\" id=\"input-password\"\n                 class=\"form-control\" placeholder=\"Password\" #password=\"ngModel\"\n                 [class.form-control-danger]=\"password.invalid && password.touched\"\n                 [required]=\"getConfigValue('forms.validation.password.required')\"\n                 [minlength]=\"getConfigValue('forms.validation.password.minLength')\"\n                 [maxlength]=\"getConfigValue('forms.validation.password.maxLength')\">\n          <small class=\"form-text error\" *ngIf=\"password.invalid && password.touched && password.errors?.required\">\n            Password is required!\n          </small>\n          <small\n            class=\"form-text error\"\n            *ngIf=\"password.invalid && password.touched && (password.errors?.minlength || password.errors?.maxlength)\">\n            Password should contains\n            from {{ getConfigValue('forms.validation.password.minLength') }}\n            to {{ getConfigValue('forms.validation.password.maxLength') }}\n            characters\n          </small>\n        </div>\n\n        <div class=\"form-group accept-group col-sm-12\">\n          <nb-checkbox name=\"rememberMe\" [(ngModel)]=\"user.rememberMe\">Remember me</nb-checkbox>\n          <a class=\"forgot-password\" routerLink=\"../request-password\">Forgot Password?</a>\n        </div>\n\n        <button [disabled]=\"submitted || !form.valid\" class=\"btn btn-block btn-hero-success\"\n                [class.btn-pulse]=\"submitted\">\n          Sign In\n        </button>\n      </form>\n\n      <div class=\"links\">\n        <small class=\"form-text\">Or connect with:</small>\n\n        <div class=\"socials\">\n          <a href=\"https://github.com/akveo\" target=\"_blank\" class=\"socicon-github\"></a>\n          <a href=\"https://www.facebook.com/akveo/\" target=\"_blank\" class=\"socicon-facebook\"></a>\n          <a href=\"https://twitter.com/akveo_inc\" target=\"_blank\" class=\"socicon-twitter\"></a>\n        </div>\n\n        <small class=\"form-text\">\n          Don't have an account? <a routerLink=\"../register\"><strong>Sign Up</strong></a>\n        </small>\n      </div>\n    </div>\n  ",
})
export class LoginfComponent implements OnInit {

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

	email= ''
	password='';
	private data:any;
	public loading = false;

	submitted = false;

	constructor( private toasterService: ToasterService,
				 private http: HttpClient,
				 private router: Router,
				 private route: ActivatedRoute,
				 public nbspinnerservice:NbSpinnerService,
				 public themeService:NbThemeService,
				 private api_serv: SocialApiService,
				 private sesion_serv: SesionService
	)
	{

		nbspinnerservice.load();
		nbspinnerservice.clear();
	}

	ngOnInit() {
		this.themeService.changeTheme('cosmic');
		//this.themeService.changeTheme('default');

		////console.log(this.router.url);
		//this.router.navigateByUrl('/pages/home');}
		// this.router.navigateByUrl('/pages/social');
	    
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

	Ingresar(){

		this.loading = true;
		this.submitted = true;
	   
		var datos= {
		  email: this.email,
		  password: this.password
		};
		
		/* this.api_serv.postQuery('auth/login/web', datos)
		.subscribe( (data : any ) => {
		  console.log(data);
		  this.router.navigateByUrl('/dashboard');
		}, (error : any ) => {
		  console.log(error);
		  //console.log(error.error.error);
		  alert(error.error.error);
		}); */
	
		this.loading = true;
	
		var that = this;
	
		this.api_serv.postQuery('auth/login/web', datos)
		.subscribe({
		  next(data : any) {
			console.log(data);
			that.api_serv.setToken(data.access_token, data.expires_in);
			/* Swal.close ();
			that.router.navigateByUrl('/dashboard'); */
	
			// if ( that.recordarme ) {
			//   localStorage.setItem('email', that.email);
			// }
	
			that.getUser();
		  },
		  error(msg) {
			console.log(msg);
			//console.log(msg.error.error);
			//alert(msg.error.error);
	
			that.showToast('error', 'Error!', msg.error.error);
		  	that.loading = false;
		  	that.submitted = false;
	
		  }
		});
	
	  }
	
	getUser(){
	  
		var datos = {};
	
		var that = this;
	
		this.api_serv.getQuery('auth/user')
		.subscribe({
		  next(data : any) {
			console.log(data);
		   
			that.loading = false;
			if (data.user.id && (data.user.tipo == 1 || data.user.tipo == 4) ) {
				that.sesion_serv.setUser(data.user);
			  
			  	that.router.navigateByUrl('/pages/publications');
			  
			}else if(data.user.id && data.user.tipo != 1 && data.user.tipo != 4){
				that.showToast('error', 'Error!', 'Acceso no autorizado');
			}else{
			  that.showToast('error', 'Error!', 'Error al autenticar usuario');
			}
			
		  },
		  error(msg) {
			console.log(msg);
	
			that.showToast('error', 'Error!', msg.error.error);
		  	that.loading = false;
		  	that.submitted = false;
	
		  }
		});
	
	}

	
}
