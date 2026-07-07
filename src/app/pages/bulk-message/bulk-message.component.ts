import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbSpinnerService, NbThemeService } from '@nebular/theme';

import { Location } from '@angular/common';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { SocialApiService } from '../../services/social/api/api.service';
import { WhatsappService } from '../../services/whatsapp/whatsapp.service';

@Component({
  selector: 'app-bulk-message',
  styleUrls: ['./bulk-message.component.scss'],
  templateUrl: './bulk-message.component.html',
})

export class BulkMessageComponent implements OnInit, OnDestroy {

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

	loading = false;

	messageForm: FormGroup;
	// status: string = 'DISCONNECTED';
	status: string = 'CONNECTED';
	qrCode: string = '';
	isLoading: boolean = false;
	isSending: boolean = false;
	sendProgress: number = 0;
	selectedFiles: File[] = [];

	private statusIntervalId: any;

	constructor( 
		private _location: Location,
		public nbspinnerservice:NbSpinnerService,
		public themeService:NbThemeService,
		private api_serv: SocialApiService,
		private modalService: NgbModal,
		private toasterService: ToasterService,
		private whatsappService: WhatsappService,
    	private fb: FormBuilder
		
	)
	{
		
		this.createForm();
	}

	ngOnInit() {

		//this.themeService.changeTheme('cosmic');
		this.themeService.changeTheme('default');

		// this.checkStatus();
		// // Verificar estado cada 10 segundos
		// this.statusIntervalId = setInterval(() => this.checkStatus(), 10000);
	}

	ngOnDestroy() {
		if (this.statusIntervalId) {
		clearInterval(this.statusIntervalId);
		console.log('Intervalo de estado destruido correctamente.');
		}
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

	createForm() {
		this.messageForm = this.fb.group({
		contacts: this.fb.array([]),
		message: ['', Validators.required],
		files: [[]]
		});
	}

	get contacts(): FormArray {
		return this.messageForm.get('contacts') as FormArray;
	}

	addContact() {
		const contactGroup = this.fb.group({
		user: ['', Validators.required],
		numero: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
		});
		this.contacts.push(contactGroup);
	}

	removeContact(index: number) {
		this.contacts.removeAt(index);
	}

	// Cargar contactos desde un archivo CSV
	loadContactsFromCSV(event: any) {
		const file = event.target.files[0];
		if (file) {
		const reader = new FileReader();
		reader.onload = (e: any) => {
			const csv = e.target.result as string;
			const lines = csv.split('\n');
			// Asumiendo formato: user,numero
			lines.forEach(line => {
			if (line.trim()) {
				const [user, numero] = line.split(',');
				if (user && numero) {
				this.contacts.push(this.fb.group({
					user: user.trim(),
					numero: numero.trim()
				}));
				}
			}
			});
		};
		reader.readAsText(file);
		}
	}

	// Manejar archivos adjuntos
	onFileSelected(event: any) {
		this.selectedFiles = event.target.files;
	}

	// Convertir archivos a Base64 para la API
	async prepareFiles(): Promise<any[]> {
		const filesData = [];
		for (const file of this.selectedFiles) {
		const base64 = await this.fileToBase64(file);
		filesData.push({
			fileName: file.name,
			mimeType: file.type,
			fileBase64: base64.split(',')[1] // Eliminar el prefijo data:image/...
		});
		}
		return filesData;
	}

	fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = error => reject(error);
		});
	}

	// Enviar mensajes masivos
	async sendBulkMessages() {
		if (this.messageForm.invalid) {
		alert('Por favor completa todos los campos requeridos');
		return;
		}

		if (this.status !== 'CONNECTED') {
		alert('WhatsApp no está conectado. Por favor inicia sesión primero.');
		return;
		}

		this.isSending = true;
		this.sendProgress = 0;

		try {
		const contacts = this.messageForm.get('contacts').value;
		const message = this.messageForm.get('message').value;
		const files = await this.prepareFiles();

		this.whatsappService.sendBulkMessages(contacts, message, files)
			.subscribe(
			response => {
				console.log('Envío iniciado:', response);
				alert('El envío masivo ha comenzado en segundo plano');
				this.isSending = false;
			},
			error => {
				console.error('Error al enviar:', error);
				alert('Error al iniciar el envío masivo');
				this.isSending = false;
			}
			);
		} catch (error) {
		console.error('Error preparando archivos:', error);
		this.isSending = false;
		}
	}

	// Verificar estado de la conexión
	checkStatus() {
		this.whatsappService.getStatus().subscribe(
		(response: any) => {
			this.status = response.status;
			if (response.status === 'WAITING_QR') {
			this.qrCode = response.qr;
			}
		},
		error => console.error('Error checking status:', error)
		);
	}

	// Iniciar sesión
	login() {
		this.isLoading = true;
		this.whatsappService.login().subscribe(
		(response: any) => {
			console.log('Login response:', response);
			this.isLoading = false;
			this.checkStatus();
		},
		error => {
			console.error('Login error:', error);
			this.isLoading = false;
		}
		);
	}

	// Reiniciar sesión
	reset() {
		if (confirm('¿Estás seguro de reiniciar la sesión? Se perderá la conexión actual.')) {
		this.isLoading = true;
		this.whatsappService.resetSession().subscribe(
			(response: any) => {
			console.log('Reset response:', response);
			this.isLoading = false;
			this.status = 'DISCONNECTED';
			this.qrCode = '';
			},
			error => {
			console.error('Reset error:', error);
			this.isLoading = false;
			}
		);
		}
	}

	// Detener sesión
	stop() {
		if (confirm('¿Detener el navegador? La sesión se mantendrá guardada.')) {
		this.isLoading = true;
		this.whatsappService.stopSession().subscribe(
			(response: any) => {
			console.log('Stop response:', response);
			this.isLoading = false;
			this.status = 'DISCONNECTED';
			},
			error => {
			console.error('Stop error:', error);
			this.isLoading = false;
			}
		);
		}
	}


}
