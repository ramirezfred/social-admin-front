import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-wa-sender',
  templateUrl: './wa-sender.component.html',
  styleUrls: ['./wa-sender.component.scss']
})
export class WaSenderComponent {
  // URL de tu API Node.js
  private readonly URL_API = 'http://localhost:3000/api/whatsapp/send';

  // Modelo de datos del formulario
  numeroDestino: string = '';
  mensaje: string = '';

  // Estados de la interfaz
  isSubmitting: boolean = false;
  btnText: string = 'Enviar Mensaje';

  // Configuración de alertas
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'danger' = 'success';

  constructor(private http: HttpClient) {}

  enviarMensaje(): void {
    // Validar campos vacíos rápidamente
    if (!this.numeroDestino.trim() || !this.mensaje.trim()) {
      this.mostrarAlerta('Por favor, rellena todos los campos.', 'danger');
      return;
    }

    // Cambiar estados a modo "Cargando..."
    this.isSubmitting = true;
    this.btnText = 'Enviando...';
    this.showAlert = false;

    const body = {
      numeroDestino: this.numeroDestino.trim(),
      mensaje: this.mensaje.trim()
    };

    this.http.post(this.URL_API, body).subscribe(
      (data: any) => {
        this.mostrarAlerta('¡Mensaje enviado con éxito!', 'success');
        this.limpiarFormulario();
        this.restaurarBoton();
      },
      (error) => {
        console.error('Error detectado:', error);
        
        // Manejar si el servidor responde con un error de negocio o si está apagado
        const errorMsg = error.error && error.error.error 
          ? error.error.error 
          : 'No se pudo conectar con el servidor de Node.js. ¿Está encendido?';

        this.mostrarAlerta(`Error: ${errorMsg}`, 'danger');
        this.restaurarBoton();
      }
    );
  }

  private mostrarAlerta(mensaje: string, tipo: 'success' | 'danger'): void {
    this.alertMessage = mensaje;
    this.alertType = tipo;
    this.showAlert = true;
  }

  private restaurarBoton(): void {
    this.isSubmitting = false;
    this.btnText = 'Enviar Mensaje';
  }

  private limpiarFormulario(): void {
    this.numeroDestino = '';
    this.mensaje = '';
  }
}