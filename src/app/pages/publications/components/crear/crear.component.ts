import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { PublicationService } from '../../../../services/publications/publication.service';
import { SupplierService } from '../../../../services/publications/supplier.service';
import { OfflineQueueService } from '../../../../services/publications/offline-queue.service';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { SesionService } from '../../../../services/sesion/sesion.service';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss']
})
export class CrearComponent implements OnInit, OnDestroy, OnChanges {

  // ---- Alertas ----
  config: ToasterConfig;
  position = 'toast-top-right';
  animationType = 'fade';
  timeout = 5000;
  toastsLimit = 5;
  isNewestOnTop = true;
  isHideOnClick = true;
  isDuplicatesPrevented = false;
  isCloseButton = true;

  public loading = false;


  // Imágenes
  // FIX: guardamos las URLs raw (string) por separado para poder revocarlas correctamente
  archivosSeleccionados: File[] = [];
  previews: { raw: string; safe: SafeUrl }[] = [];            // URLs para el <img [src]>
  MAX_IMAGENES = 9;

  // Suppliers autocomplete
  suppliersFiltrados: any[] = [];
  showDropdown = false;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  // ---- Modo de texto ----
  modoDinamico = true; // true = dinámico, false = libre

  formDinamico: FormGroup;

  codigoGenerado: string = '';

  userId: number | null = null;

  // Recibe el ID desde el padre
  @Input() idPublicacionEdit: any = null;
  @Output() edicionFinalizadaEvent = new EventEmitter<void>();

  esModoEdicion = false;

  constructor(
    private toasterService: ToasterService,
    private publicationService: PublicationService,
    private supplierService: SupplierService,
    private offlineQueue: OfflineQueueService,
    public fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private sesion_serv: SesionService,
  ) {
    this.crearFormularioDinamico();
  }

  ngOnInit() {
    const usuarioId = this.sesion_serv.getUserId();

    if(usuarioId){
      this.userId = Number(usuarioId);
    }

    this.sincronizarSuppliers();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  // ---- Alertas ----
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

  tratarError(msg: any) {
    const errorMsg = (msg.error && msg.error.message) ||
                     (msg.error && msg.error.error) ||
                     'Ocurrió un error inesperado';
    if (msg.status == 400 || msg.status == 401) {
      this.showToast('warning', 'Warning!', errorMsg);
    } else if (msg.status == 404) {
      this.showToast('info', 'Info!', errorMsg);
    } else {
      this.showToast('error', 'Error!', errorMsg);
    }
  }

  // ---- Formulario dinámico ----
  crearFormularioDinamico() {
    this.formDinamico = this.fb.group({
      supplier_id           : ['', [Validators.required]],
      supplier_razon_social : ['', [Validators.required]],
      // producto              : ['', [Validators.required]],
      tallas                : ['', [Validators.required]],
      colores               : ['', [Validators.required]],
      precio                : ['', [Validators.required]],
    });

    // Listener para el autocomplete del proveedor en modo dinámico
    const supplierDinCtrl = this.formDinamico.get('supplier_razon_social');
    if (supplierDinCtrl) {
      supplierDinCtrl.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(async (valor) => {
          if (valor && valor.length >= 1) {
            await this.buscarSupplier(valor);
          } else {
            this.suppliersFiltrados = [];
            this.showDropdown = false;
          }
        });
    }
  }

  // ---- Texto generado dinámicamente ----
  generarTexto(): string {
    const v = this.formDinamico.value;

    const proveedor = (v.supplier_razon_social || '').trim();
    // const producto  = (v.producto || '').trim();
    const precio    = (v.precio || '').trim();

    const tallas = (v.tallas || '')
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0)
      .join('\n');

    const colores = (v.colores || '')
      .split(',')
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 0)
      .join('\n');

    return `Proveedor *${proveedor}*\n\n` +
           `*${this.codigoGenerado}*\n\n` +
           `🔖 *Tallas disponibles*\n${tallas}\n\n` +
           `🎨 *Colores disponibles*\n${colores}\n\n` +
           `Precio *$${precio} MX.* c/u\n` +
           `📦 *Envíos a toda la República* con costo adicional.\n` +
           `📍 *Entrega GRATIS* al recibir en *Tulancingo, Plaza del Vestido*`;
  }

  limpiarFormulario() {
    // Liberar TODAS las URLs de memoria antes de vaciar el array
    if (this.previews && this.previews.length > 0) {
      this.previews.forEach(p => {
        // p es el objeto, p.raw es el string que necesitamos
        URL.revokeObjectURL(p.raw);
      });
    }

    this.codigoGenerado = '';

    // this.formDinamico.patchValue({
    //   supplier_id           : '',
    //   supplier_razon_social : '',
    //   // producto              : '',
    //   tallas                : '',
    //   colores               : '',
    //   precio                : '',
    // });
    // Object.values(this.formDinamico.controls).forEach(control => control.markAsUntouched());
    this.formDinamico.reset();

    this.archivosSeleccionados = [];
    this.previews = [];
    this.suppliersFiltrados = [];
    this.showDropdown = false;
  }

  // ---- Getters validación (modo dinámico) ----
  get din_supplier_razon_socialNoValido() {
    return this.formDinamico.get('supplier_razon_social').invalid &&
           this.formDinamico.get('supplier_razon_social').touched;
  }

  get din_supplier_idNoValido() {
    return this.formDinamico.get('supplier_id').invalid &&
           this.formDinamico.get('supplier_id').touched;
  }

  // get din_productoNoValido() {
  //   return this.formDinamico.get('producto').invalid &&
  //          this.formDinamico.get('producto').touched;
  // }

  get din_tallasNoValido() {
    return this.formDinamico.get('tallas').invalid &&
           this.formDinamico.get('tallas').touched;
  }

  get din_coloresNoValido() {
    return this.formDinamico.get('colores').invalid &&
           this.formDinamico.get('colores').touched;
  }

  get din_precioNoValido() {
    return this.formDinamico.get('precio').invalid &&
           this.formDinamico.get('precio').touched;
  }

  // ---- Suppliers ----
  async sincronizarSuppliers(): Promise<void> {
    await this.supplierService.sincronizar();
  }

  async buscarSupplier(termino: string): Promise<void> {
    if (navigator.onLine) {
      this.supplierService.buscar(termino).subscribe({
        next: (response: any) => {
          this.suppliersFiltrados = response.data;
          this.showDropdown = this.suppliersFiltrados.length > 0;
        },
        error: async () => {
          this.suppliersFiltrados = await this.supplierService.buscarEnLocal(termino);
          this.showDropdown = this.suppliersFiltrados.length > 0;
        }
      });
    } else {
      this.suppliersFiltrados = await this.supplierService.buscarEnLocal(termino);
      this.showDropdown = this.suppliersFiltrados.length > 0;
    }
  }

  seleccionarSupplier(item: any) {
    if (this.modoDinamico) {
      this.codigoGenerado = this.generarCodigoProducto(item.razon_social);
      this.formDinamico.patchValue({
        supplier_id           : item.id,
        supplier_razon_social : item.razon_social,
      }, { emitEvent: false });
    } 
    this.showDropdown = false;
  }

  mostrarAutocompletado() {
    this.showDropdown = this.suppliersFiltrados.length > 0;
  }

  ocultarAutocompletado() {
    setTimeout(() => this.showDropdown = false, 150);
  }

  // ---- Imágenes ----
  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    
    // 1. Validación inicial de entrada
    if (!input || !input.files || input.files.length === 0) return;

    // 2. Convertir FileList a Array para evitar perder referencias
    const nuevosArchivos = Array.from(input.files);
    const espacioDisponible = this.MAX_IMAGENES - this.archivosSeleccionados.length;

    if (espacioDisponible <= 0) {
      this.showToast('warning', '¡Atención!', `Ya alcanzaste el límite de ${this.MAX_IMAGENES} imágenes.`);
      input.value = '';
      return;
    }

    // 3. Solo procesar los archivos que caben en el espacio disponible
    const archivosAProcesar = nuevosArchivos.slice(0, espacioDisponible);
    
    this.loading = true;

    try {
      // 4. Ciclo secuencial: procesa una por una para estabilidad en móviles
      for (const file of archivosAProcesar) {
        try {
          // Esperamos a que la compresión termine antes de seguir con la siguiente
          const fileComprimido = await this.compressImage(file);
          
          // Guardamos el archivo binario para el envío a la API
          // this.archivosSeleccionados.push(fileComprimido);
          this.archivosSeleccionados = [...this.archivosSeleccionados, fileComprimido];
          
          // Creamos la URL original (la que se puede revocar)
          const rawUrl = URL.createObjectURL(fileComprimido);

          // Creamos un objeto que guarde ambas versiones
          const previewData = {
            raw: rawUrl,                                          // Para revocar después
            safe: this.sanitizer.bypassSecurityTrustUrl(rawUrl)   // Para el [src] del HTML
          };

          this.previews = [...this.previews, previewData];

        } catch (errorFile) {
          console.error(`Error procesando el archivo ${file.name}:`, errorFile);
          this.showToast('error', 'Error', `No se pudo procesar: ${file.name}`);
        }
      }

      // 5. Aviso si el usuario intentó subir más de las permitidas
      if (nuevosArchivos.length > espacioDisponible) {
        this.showToast('info', 'Info', `Solo se agregaron las primeras ${espacioDisponible} imágenes.`);
      }

    } catch (err) {
      console.error("Error general en el proceso de selección:", err);
      this.showToast('error', 'Error!', 'Ocurrió un error inesperado al cargar las imágenes.');
    } finally {
      this.loading = false;
      // 6. Limpiar el input para permitir re-seleccionar los mismos archivos si se borran
      input.value = '';
    }
  }

  async onCameraCapture(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const disponibles = this.MAX_IMAGENES - this.archivosSeleccionados.length;
    if (disponibles <= 0) {
      this.showToast('warning', 'Warning!', `Máximo ${this.MAX_IMAGENES} imágenes permitidas.`);
      input.value = '';
      return;
    }

    try {
      const fileOriginal = input.files[0];
      const fileComprimido = await this.compressImage(fileOriginal);
      this.archivosSeleccionados.push(fileComprimido);
      
      // Creamos la URL original (la que se puede revocar)
      const rawUrl = URL.createObjectURL(fileComprimido);

      // Creamos un objeto que guarde ambas versiones
      const previewData = {
        raw: rawUrl,                                          // Para revocar después
        safe: this.sanitizer.bypassSecurityTrustUrl(rawUrl)   // Para el [src] del HTML
      };

      this.previews = [...this.previews, previewData];

    } catch (e) {
      this.showToast('error', 'Error', 'No se pudo procesar la foto de la cámara.');
    }

    input.value = '';
  }

  eliminarImagen(index: number) {
    // 1. Obtenemos el objeto de la vista previa
    const preview = this.previews[index];

    // 2. Liberamos la memoria usando la URL raw (original)
    if (preview && preview.raw) {
      URL.revokeObjectURL(preview.raw);
    }

    // 3. Eliminamos el archivo del array de envío a la API
    this.archivosSeleccionados = [
      ...this.archivosSeleccionados.slice(0, index),
      ...this.archivosSeleccionados.slice(index + 1)
    ];

    // 4. Eliminamos el objeto de vista previa del array
    this.previews = [
      ...this.previews.slice(0, index),
      ...this.previews.slice(index + 1)
    ];
  }


  // ---- Guardar ----
  guardar(): void {
    if (this.archivosSeleccionados.length === 0) {
      this.showToast('warning', 'Warning!', 'Selecciona al menos una imagen.');
      return;
    }

    if (this.modoDinamico) {
      if (this.formDinamico.invalid) {
        this.showToast('warning', 'Warning!', 'Ingresa los campos requeridos.');
        Object.values(this.formDinamico.controls).forEach(control => control.markAsTouched());
        return;
      }
    } 

    // Si userId es null o 0, entra en la validación
    if (!this.userId) {
      this.showToast('warning', 'Warning!', 'Usuario inválido, inicia sesión nuevamente.');
      return;
    }

    this.crear();
  }

  async crear(): Promise<void> {
    this.loading = true;

    try {
      let userId: number;
      let supplierId: number;
      let supplierRazonSocial: string;
      let texto: string;

      // if (this.modoDinamico) {
        userId              = this.userId;
        supplierId          = Number(this.formDinamico.value.supplier_id);
        supplierRazonSocial = this.formDinamico.value.supplier_razon_social;
        texto               = this.generarTexto();
      // } 

      const resultado = await this.publicationService.crearConOffline(
        userId,
        supplierId,
        supplierRazonSocial,
        texto,
        this.archivosSeleccionados
      );

      this.loading = false;

      if (resultado !== 'api') {
        this.showToast('info', 'Info!', 'Sin conexión. Publicación guardada localmente, se sincronizará al reconectar.');
      }

      this.limpiarFormulario();

    } catch (err) {
      this.loading = false;
      
      // --- CAPTURA DEL ERROR ESPECÍFICO ---
      if (err instanceof Error && err.message === 'Límite de publicaciones offline alcanzado') {
        this.showToast('warning', 'Límite alcanzado', err.message);
      } else {
        // Para cualquier otro error (error de API, error de base de datos, etc.)
        this.tratarError(err);
      }
      // ------------------------------------
    }
  }

  async compressImage(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      
        // 1. Creamos una URL temporal que apunta al archivo (muy ligero)
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        
        img.src = objectUrl;
      
        img.onload = () => {
          const maxWidth = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth * height) / width;
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // El truco está en limpiar después de generar el Blob
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { 
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              // --- LIMPIEZA CRÍTICA DE MEMORIA ---
          
              // Liberamos la URL del objeto inmediatamente
              URL.revokeObjectURL(objectUrl);
              
              // Limpiamos el canvas para liberar memoria de video/gráficos
              canvas.width = 0;
              canvas.height = 0;
              
              // Eliminamos la referencia de la imagen
              img.src = '';
              
              resolve(compressedFile);
            } else {
              reject(new Error('Error al generar el Blob'));
            }
          }, 'image/jpeg', 0.5);
        };

        img.onerror = (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        };
      

    });
  }

  generarCodigoProducto(razonSocial: string): string {
    const iniciales = razonSocial
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(p => p.length > 0)
      .map(p => p[0])
      .slice(0, 5)
      .join('');

    const now = new Date();

    const fecha = String(now.getFullYear()).slice(2)
                + String(now.getMonth() + 1).padStart(2, '0')
                + String(now.getDate()).padStart(2, '0');

    const hora  = String(now.getHours()).padStart(2, '0')
                + String(now.getMinutes()).padStart(2, '0')
                + String(now.getSeconds()).padStart(2, '0');

    return `${iniciales}-${fecha}-${hora}`;
  }

  //#region Editar publicacion

  // Detecta cuando el padre le envía un nuevo ID
  ngOnChanges(changes: SimpleChanges) {
    if (changes['idPublicacionEdit'] && changes['idPublicacionEdit'].currentValue) {
      this.esModoEdicion = true;
      this.limpiarFormulario();
      this.cargarPublicacionParaEditar(changes['idPublicacionEdit'].currentValue);
    } else {
      // Cuando el ID pasa a ser null
      this.esModoEdicion = false;
      this.limpiarFormulario();
    }
  }

  cargarPublicacionParaEditar(id: any) {

    this.loading = true;
    const that = this;

    // 1. Obtener la data y los archivos PRIMERO
    this.publicationService.show(id).subscribe({
      next: async (response: any) => {
        try {

          // console.log(response);

          that.formDinamico.patchValue({
            supplier_id           : response.supplier_id,
          }, { emitEvent: false });

          that.parsearTexto(response.texto);

          const archivos: any[] = await that.obtenerBlobs(response);

          for (const file of archivos) {

            try {
              // Esperamos a que la compresión termine antes de seguir con la siguiente
              // const fileComprimido = await that.compressImage(file);
              
              // Guardamos el archivo binario para el envío a la API
              // this.archivosSeleccionados.push(fileComprimido);
              that.archivosSeleccionados = [...that.archivosSeleccionados, file];
              
              // Creamos la URL original (la que se puede revocar)
              const rawUrl = URL.createObjectURL(file);

              // Creamos un objeto que guarde ambas versiones
              const previewData = {
                raw: rawUrl,                                          // Para revocar después
                safe: that.sanitizer.bypassSecurityTrustUrl(rawUrl)   // Para el [src] del HTML
              };

              that.previews = [...that.previews, previewData];

            } catch (errorFile) {
              console.error(`Error procesando el archivo ${file.name}:`, errorFile);
              that.showToast('error', 'Error', `No se pudo procesar: ${file.name}`);
            }            
            
          }

          that.loading = false;
          
        } catch (err) {
          that.tratarError(err);
        } finally {
          that.loading = false;
        }
      },
      error(msg) {
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  guardarEdit(): void {
    if (this.archivosSeleccionados.length === 0) {
      this.showToast('warning', 'Warning!', 'Selecciona al menos una imagen.');
      return;
    }

    if (this.modoDinamico) {
      if (this.formDinamico.invalid) {
        this.showToast('warning', 'Warning!', 'Ingresa los campos requeridos.');
        Object.values(this.formDinamico.controls).forEach(control => control.markAsTouched());
        return;
      }
    } 

    // Si userId es null o 0, entra en la validación
    if (!this.userId) {
      this.showToast('warning', 'Warning!', 'Usuario inválido, inicia sesión nuevamente.');
      return;
    }

    if (!this.idPublicacionEdit) {
      this.showToast('warning', 'Warning!', 'Publicación inválida.');
      return;
    }

    if (!navigator.onLine) {
      this.showToast('warning', 'Warning!', 'Necesitas conexión a internet.');
      return;
    }

    this.editar();
  }

  async editar(): Promise<void> {
    this.loading = true;

    try {
      let publicationID: number;
      let supplierId: number;
      let texto: string;

      publicationID       = this.idPublicacionEdit;
      supplierId          = Number(this.formDinamico.value.supplier_id);
      texto               = this.generarTexto();

      const resultado = await this.publicationService.editarConOnline(
        publicationID,
        supplierId,
        texto,
        this.archivosSeleccionados
      );

      console.log(resultado);

      this.loading = false;

      this.limpiarFormulario();

      this.edicionFinalizadaEvent.emit(); // Avisa al padre que terminó

    } catch (err) {
      this.loading = false;
      this.tratarError(err);
    }
  }
  
  cancelarEdicion() {
    this.limpiarFormulario()
    this.edicionFinalizadaEvent.emit(); // Limpia el estado en el padre
  }

  parsearTexto(texto: string): void {
    // Normalizar saltos de línea
    const t = texto.replace(/\r\n/g, '\n');

    // Proveedor
    const proveedorMatch = t.match(/Proveedor \*(.+?)\*/);
    const proveedor = proveedorMatch ? proveedorMatch[1].trim() : '';

    // Código
    const codigoMatch = t.match(/\n\n\*(.+?)\*\n/);
    const codigo = codigoMatch ? codigoMatch[1].trim() : '';

    // Tallas
    const tallasMatch = t.match(/🔖 \*Tallas disponibles\*\n([\s\S]+?)\n\n/);
    const tallas = tallasMatch
      ? tallasMatch[1].split('\n').map((t: string) => t.trim()).filter((t: string) => t.length > 0).join(', ')
      : '';

    // Colores
    const coloresMatch = t.match(/🎨 \*Colores disponibles\*\n([\s\S]+?)\n\n/);
    const colores = coloresMatch
      ? coloresMatch[1].split('\n').map((c: string) => c.trim()).filter((c: string) => c.length > 0).join(', ')
      : '';

    // Precio
    const precioMatch = t.match(/Precio \*\$(.+?) MX\.\*/);
    const precio = precioMatch ? precioMatch[1].trim() : '';

    this.formDinamico.patchValue({
      supplier_razon_social: proveedor,
      precio: precio,
      tallas: tallas,
      colores: colores,
    }, { emitEvent: false });

    if (codigo) {
      this.codigoGenerado = codigo;
    }
  }

  private async obtenerBlobs(pub: any): Promise<any[]> {
    return Promise.all(
      pub.images.map(async (img: any, i: number) => {
        // Si la url es base64 (offline) o URL normal (online)
        const res  = await fetch(img.url);
        const blob = await res.blob();
        return new File([blob], `imagen_${i}.jpg`, { type: blob.type });
      })
    );
  }

  //#endregion

}