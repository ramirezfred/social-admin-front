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
import { HttpClient } from '@angular/common/http';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

declare var Conekta: any;

declare let paypal: any;

@Component({
  selector: 'ngx-cotizacion',
  styleUrls: ['./cotizacion.component.scss'],
  templateUrl: './cotizacion.component.html',
  })
export class CotizacionComponent implements OnInit {

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

  cotizacion_id = null;

  fecha = '';
  cliente = '';
  telefono = '';
  gastos = [];
  subtotal = 0;
  envio = null;
  total = 0;
  pago = '';
  pago_user = '';
  tipo = null;
  moneda = '';

  paymentForm: FormGroup;

  formErrors = {
      "number":"",
      "name":"",
      "exp_year":"",
      "exp_month":"",
      "cvc":""
  };
  public cargo = {
    "name" : "",
    "email" : "hola@goopy.app",
    "phone": "",   
    "reference": 0,
    "random_key": 0,
    "token_id": "",
    "name_order": "Pago cotizacion",
    "unit_price": 0,
    "quantity": "1",
    "amount": 0,
    "carrier": "Cotización",
    "street1": "Av. Central 111 2",
    "postal_code": "43612",
    "more_info": "Pago cotizacion",
    "cotizacion_id": "",
    "last4": null,
    "brand": "",
    "cvv": "",
    "titular": "",
    "total": 0,
  };

  @ViewChild('cardInfo') cardInfo : ElementRef;
  cardError : string;
  card : any;

  stripe_card = false;
  stripe_token = null;

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

    //produccion
    //Conekta.setPublicKey('key_RpNuGt1gnj7kboEGh6AtXHs');
    //pruebas
    Conekta.setPublicKey('key_LPgvccXbEvtt7tGH2Zzw94Q');

		nbspinnerservice.load();
		nbspinnerservice.clear();

    this.activatedRoute.params.subscribe( params => {
      console.log( params['id'] );

      this.cotizacion_id = params['id'];

      if(this.cotizacion_id){
        this.getCotizacion();
      }
    });

    this.crearFormPago();
    this.crearListenersFormPago();

	}

	ngOnInit() {
		//this.themeService.changeTheme('cosmic');
		this.themeService.changeTheme('default');
		//console.log(this.router.url);

    // if(this.cotizacion_id){
    //   this.getCotizacion();
    // }
	    
	}

  initPagoStripe(modal){

    this.stripe_token = null;
    this.open(modal);

    setTimeout(()=>{

      let cardInfo = document.querySelector('#cardInfo');

      if(!this.stripe_card){    
        this.card = elements.create('card');
        this.stripe_card = true;
      }

      this.card.mount(cardInfo);
      this.card.addEventListener('change', this.onChange.bind(this));

    },500);
    
  }

  onChange({ error }){
    if(error){
      this.ngZone.run(() => this.cardError = error.message);
    }else{
      this.ngZone.run(() => this.cardError = null);
    }
  }

  async setTokenStripe(){
    this.loading = true;
    const { token, error } = await stripe.createToken(this.card);
    if (token){

      this.loading = false;
      //console.log(token);
      this.stripe_token = token.id;

      //para cerrar la modal
      let click_event = new CustomEvent('click');
      let btn_element = document.querySelector('#btnAtras2');
      btn_element.dispatchEvent(click_event);

      this.stripeCharge();

    }else{
      this.loading = false;
      this.ngZone.run(() => this.cardError = null);
    }
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

  getCotizacion() {

    this.fecha = '';
    this.cliente = '';
    this.telefono = '';
    this.gastos = [];
    this.subtotal = 0;
    this.envio = null;
    this.total = 0;
    this.pago = '';
    this.pago_user = '';
    this.moneda = '';
    
    this.loading = true;
    this.http.get(this.rutaService.getRutaApi()+'demo/cotizaciones/'+this.cotizacion_id)
       .toPromise()
       .then(
         (data:any) => { // Success

            console.log(data);

            this.fecha = data.cotizacion.created_at;
            this.cliente = data.cotizacion.cliente;
            this.telefono = data.cotizacion.telefono;

            this.gastos = data.cotizacion.gastos;
            this.envio = data.cotizacion.envio;
            this.subtotal = data.cotizacion.subtotal;
            this.total = data.cotizacion.total;
            this.pago = (data.cotizacion.pago==0)?'No Pagada':'Pagada';
            this.pago_user = (data.cotizacion.pago_user==0)?'No Pagada':'Pagada';
            this.tipo = data.cotizacion.tipo;

            if(data.cotizacion.moneda == 1){
              this.moneda = 'MXN';
            }
            if(data.cotizacion.moneda == 2){
              this.moneda = 'USD';
            }

            this.loading = false;

            this.mostrarBotonPayPal();
           
         },
         msg => { // Error

           this.tratarError(msg);
           this.loading = false;         

         }
       );
  }

  initPagoConekta(){
    this.crearFormPago();
    this.crearListenersFormPago();
  }

  crearFormPago() {
    this.paymentForm = this.fb.group({
      number: ['', [Validators.required]],
      name: ['', [Validators.required]],
      exp_year: ['', [Validators.required]],
      exp_month: ['', [Validators.required]],
      cvc: ['', [Validators.required]],
      check: [false]
    });
  }

  crearListenersFormPago(){
    this.paymentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();

    this.cargo.name = this.cliente;
    this.cargo.phone = this.telefono;
    this.cargo.reference = new Date().getTime();
    this.cargo.random_key = new Date().getTime();

    // //this.cargo.unit_price = (parseFloat(this.order.costo)-1)*100;
    this.cargo.unit_price = (this.total - 1)*100; //costo del serv seleccionado
    this.cargo.amount = 100;
    this.cargo.cotizacion_id = this.cotizacion_id;
    this.cargo.total = this.total;
    this.cargo.more_info = "Pago cotizacion Num "+this.cotizacion_id;

    this.paymentForm.controls['number'].valueChanges.subscribe(
        (selectedValue) => {
          var target = selectedValue;
          if (selectedValue.toString().length > 16) {
            this.paymentForm.patchValue({number: selectedValue.substr(0, 16)});
            target = selectedValue.substr(0, 16);
          }
          var tgt = Conekta.card.validateNumber(target);
          if (!tgt) {
            this.paymentForm.controls['number'].setErrors({'incorrect': true});
          }
          var yr = Conekta.card.getBrand(selectedValue);
          if (yr) {
            this.cargo.brand = yr;
          }
        }
      );
      this.paymentForm.controls['cvc'].valueChanges.subscribe(
        (selectedValue) => {
          var cvv = selectedValue;
          if (selectedValue.toString().length > 4) {
            this.paymentForm.patchValue({cvc: selectedValue.substr(0, 4)});
            cvv = selectedValue.substr(0, 4);
          }
          var cv = Conekta.card.validateCVC(cvv);
          if (!cv) {
            this.paymentForm.controls['cvc'].setErrors({'incorrect': true});
          }
        }
      );
      this.paymentForm.controls['exp_month'].valueChanges.subscribe(
        (selectedValue) => {
          var month = selectedValue;
          if (selectedValue.toString().length > 2) {
            this.paymentForm.patchValue({exp_month: selectedValue.substr(0, 2)});
            month = selectedValue.substr(0, 2);
          }
          var mt = Conekta.card.validateExpirationDate(month, this.paymentForm.value.exp_year);
          if (this.paymentForm.value.exp_year != '') {
            if (!mt) {
              this.paymentForm.controls['exp_month'].setErrors({'incorrect': true});
              this.paymentForm.controls['exp_year'].setErrors({'incorrect': true});
            } else {
              this.paymentForm.controls['exp_year'].setErrors(null);
            }
          }          
        }
      );
      this.paymentForm.controls['exp_year'].valueChanges.subscribe(
        (selectedValue) => {
          var year = selectedValue;
          if (selectedValue.toString().length > 4) {
            this.paymentForm.patchValue({exp_year: selectedValue.substr(0, 4)});
            year = selectedValue.substr(0, 4);
          }
          var yr = Conekta.card.validateExpirationDate(this.paymentForm.value.exp_month,year);
          if (!yr) {
            this.paymentForm.controls['exp_month'].setErrors({'incorrect': true});
            this.paymentForm.controls['exp_year'].setErrors({'incorrect': true});
          } else {
            this.paymentForm.controls['exp_month'].setErrors(null);
          }
        }
      );
  }

  onValueChanged(data?: any) {
    if (!this.paymentForm) { return; }
    const form = this.paymentForm;

    for (const field in this.formErrors) { 
      const control = form.get(field);
      this.formErrors[field] = '';
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.formErrors[field] += true;
          console.log(key);
        }
      } 
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf:true });
        this.onValueChanged();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  pagar(form){
    if (this.paymentForm.valid) {
      this.loading = true;
      this.showToast('info', 'Info!', 'Validando información...');
      var that = this;
      let pay = { "card": form.value};
      Conekta.Token.create(pay, function SuccessCallback(response) {
        console.log(response);
        that.cargo.token_id = response.id;           
        that.paymentCharge();

        //para cerrar la modal
        let click_event = new CustomEvent('click');
        let btn_element = document.querySelector('#btnAtras');
        btn_element.dispatchEvent(click_event);
      }
      , function ErrorCallback(response) {
        console.log(response);
        that.loading = false;
        that.showToast('error', 'Erro!', response.message_to_purchaser);
      });
      
    } else {
      this.validateAllFormFields(this.paymentForm);
      this.showToast('error', 'Erro!', 'Faltan datos de la tarjeta');
    };
  };

  paymentCharge(): void {

    this.loading = true;
    this.showToast('info', 'Info!', 'Generando el pago...');

    this.http.post(this.rutaService.getRutaApi()+'demo/cotizaciones/pago/conekta', this.cargo)
       .toPromise()
       .then(
         (data:any) => { // Success

            console.log(data);

            if (data.conekta.object === 'order') {
              if (data.conekta.payment_status === "paid") {

                this.showToast('info', 'Info!', 'Pago procesado exitosamente...');
                this.pago = 'Pagada';
                this.pago_user = 'Pagada';

              }          
            }
            if (data.conekta.object === 'error') {
              this.showToast('error', 'Erro!', data.conekta.details[0].message);
            } 

            this.loading = false;
           
         },
         msg => { // Error
           console.log(msg);
           this.loading = false;
           this.tratarError(msg);
           this.showToast('error', 'Erro!', msg.error.conekta.details[0].message);

         }
       );
  }

  paymentSuccess(payment) {
    console.log(payment);
    if(payment.state == "approved" || payment.state == "completed" || payment.state == "COMPLETED"){
      this.pagoPayPal();
    }else{
      this.showToast('error', 'Erro!', 'Error al procesar el pago.');
    }
  }

  renderButtonPayPal(cost,selectedCurreny,self,paypal_production,paypal_sandbox,paypal_env): void {

    console.log('renderButtonPayPal');

    document.getElementById("paypal-button").innerHTML = "";

    let env = null;
    if(paypal_env == 0){
      env = 'sandbox';
    }else if(paypal_env == 1){
      env = 'production';
    }

    //reset earlier inserted paypal button
    paypal.Button.render({
      style: {
        //shape:   'rect',
        shape:   'pill',
        height :   40,
      },
      env: env,
      client: {
        production: paypal_production,
        sandbox: paypal_sandbox
      },
      commit: true,
      payment: function (data, actions) {
        return actions.payment.create({
          payment: {
            transactions: [
              {
                amount: { total: cost, currency: selectedCurreny }
              }
            ]
          }
        })
      },
      onAuthorize: function (data, actions) {
        return actions.payment.execute().then(function (payment) {

          //alert('Payment Successful')
          self.paymentSuccess(payment);
          //console.log(payment)
        })
      }
    }, '#paypal-button');
  }

  mostrarBotonPayPal(){

    //let comision = (this.abono * 5)/100;
    //let total = this.abono + 5 + comision;

    let client_id = 'AYDm5MoqD21AUPQNoKQSWst_d1L9uB9HuD88Ak_zO_UOBoYKVDvuHtM3vTt7UpFjN0L8vwZ5f0q6J7Ry';
    /*let client_id = '';
    if(this.tipo == 1){
      //Antonio - pruebas
      //client_id = 'AZcbob1UiEseIRxypeZ_s637lbSHnv2CMF-FdAJuokyPfPCz2v9DTyTyFMvcGI5ksfnR1B8XECfxFwxO';
      client_id = 'Ac3Y6r6D4WewfUKd-GPqAkxO-c_9dpFQKqdeg9zHUtPHOOXc5WTY1qA7HmQRE4YQIponVQAsy6JMH05L';
    }
    if(this.tipo == 2){
      //Karla - produccion
      client_id = 'Ac3Y6r6D4WewfUKd-GPqAkxO-c_9dpFQKqdeg9zHUtPHOOXc5WTY1qA7HmQRE4YQIponVQAsy6JMH05L';
    }*/

    this.renderButtonPayPal(
      this.total,
      this.moneda,
      this,
      client_id,
      client_id,
      0
    );
  }

  pagoPayPal(): void {

    this.loading = true;
    this.showToast('info', 'Info!', 'Generando el pago...');

    var datos= {
      cotizacion_id: this.cotizacion_id
    }

    this.http.post(this.rutaService.getRutaApi()+'demo/cotizaciones/pago/paypal', datos)
       .toPromise()
       .then(
         (data:any) => { // Success

            console.log(data);

            this.showToast('info', 'Info!', 'Pago procesado exitosamente...');
            this.pago = 'Pagada';
            this.pago_user = 'Pagada';

            this.loading = false;
           
         },
         msg => { // Error
           console.log(msg);
           this.loading = false;
           this.tratarError(msg);

         }
       );
  }

  stripeCharge(): void {

    this.loading = true;
    this.showToast('info', 'Info!', 'Generando el pago...');

    var datos= {
      cotizacion_id: this.cotizacion_id,
      stripe_token: this.stripe_token
    }

    this.http.post(this.rutaService.getRutaApi()+'demo/cotizaciones/pago/stripe', datos)
       .toPromise()
       .then(
         (data:any) => { // Success

            console.log(data);

            if (data.stripe.object === 'charge') {
              if (data.stripe.status === "succeeded") {

                this.showToast('info', 'Info!', 'Pago procesado exitosamente...');
                this.pago = 'Pagada';
                this.pago_user = 'Pagada';

              }          
            }else if (data.stripe.object === 'error') {
              this.showToast('error', 'Erro!', 'Error al procesar el pago...');
            }else{
              this.showToast('error', 'Erro!', 'Error al procesar el pago...');
            }

            this.loading = false;
           
         },
         msg => { // Error
           console.log(msg);
           this.loading = false;
           this.tratarError(msg);

         }
       );
  }

}
