import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PublicationService } from '../../../../services/publications/publication.service';
import { Publication } from '../../../../@core/models/publication.model';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {

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

  listado: Publication[] = [];
  filteredItems: Publication[] = [];
  inputTermino = '';

  // Paginación
  pages: number = 4;
  pageSize: number = 20;
  pageNumber: number = 0;
  currentIndex: number = 1;
  items: Publication[] = [];
  pagesIndex: Array<number> = [];
  pageStart: number = 1;

  // Modal eliminar
  modalRef: any;
  selectObj: Publication = null;
  modalEliminarVisible = false;

  // Modal previsualizar
  modalPrevisualizarVisible = false;
  compartiendo = false;

  // ---- Modo aleatorio ----
  modoAleatorio = true;
  publicacionActual: Publication = null;
  indicesUsados: number[] = [];

  @Output() cont_publications_event : EventEmitter<number> = new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private toasterService: ToasterService,
    private publicationService: PublicationService,
  ) {}

  ngOnInit() {
    this.cont_publications_event.emit(0);
    this.getListado();
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

  open(modal) {
    this.modalRef = this.modalService.open(modal, {
      size: 'lg',
      backdrop: 'static',
      container: 'nb-layout',
      keyboard: false
    });
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

  // ---- Tabla ----
  init() {
    this.currentIndex = 1;
    this.pageStart = 1;
    this.pages = 4;
    this.pageNumber = parseInt('' + (this.filteredItems.length / this.pageSize));
    if (this.filteredItems.length % this.pageSize != 0) {
      this.pageNumber++;
    }
    if (this.pageNumber < this.pages) {
      this.pages = this.pageNumber;
    }
    this.refreshItems();
  }

  FilterByTermino() {
    if (this.inputTermino != '') {
      this.filteredItems = this.listado.filter(item =>
        item.supplier.razon_social.toUpperCase().includes(this.inputTermino.toUpperCase()) ||
        item.texto.toUpperCase().includes(this.inputTermino.toUpperCase())
      );
    } else {
      this.filteredItems = this.listado;
    }
    this.init();
  }

  fillArray(): any {
    var obj = new Array();
    for (var index = this.pageStart; index < this.pageStart + this.pages; index++) {
      obj.push(index);
    }
    return obj;
  }

  refreshItems() {
    this.items = this.filteredItems.slice(
      (this.currentIndex - 1) * this.pageSize,
      this.currentIndex * this.pageSize
    );
    this.pagesIndex = this.fillArray();
  }

  prevPage() {
    if (this.currentIndex > 1) { this.currentIndex--; }
    if (this.currentIndex < this.pageStart) { this.pageStart = this.currentIndex; }
    this.refreshItems();
  }

  nextPage() {
    if (this.currentIndex < this.pageNumber) { this.currentIndex++; }
    if (this.currentIndex >= (this.pageStart + this.pages)) {
      this.pageStart = this.currentIndex - this.pages + 1;
    }
    this.refreshItems();
  }

  setPage(index: number) {
    this.currentIndex = index;
    this.refreshItems();
  }

  // ---- API ----
  getListado(): void {
    this.listado = [];
    this.filteredItems = this.listado;
    this.init();
    this.loading = true;

    var that = this;

    this.publicationService.index()
    .subscribe({
      next(response: Publication[]) {
        that.listado = response;
        that.filteredItems = that.listado;
        that.init();
        that.loading = false;

        if (that.listado.length == 0) {
          that.showToast('info', 'Info!', 'No hay publicaciones pendientes.');
        } else if (that.modoAleatorio) {
          // Al refrescar en modo aleatorio, reiniciar y mostrar una nueva publicación
          that.indicesUsados = [];
          that.siguienteAleatoria();
        }

        that.cont_publications_event.emit(that.listado.length);
      },
      error(msg) {
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  // ---- Refrescar en modo aleatorio ----
  refrescarModoAleatorio(): void {
    this.publicacionActual = null;
    this.indicesUsados = [];
    this.cont_publications_event.emit(0);
    this.getListado();
  }

  // ---- Previsualizar ----
  abrirModalPrevisualizar(item: Publication, modal: any) {
    if (item._offline) {
      // Publicación local — ya tiene todo, no necesita ir a la API
      this.selectObj = item;
      this.modalPrevisualizarVisible = true;
      this.open(modal);
    } else {
      // Publicación del backend — traer con imágenes en base64
      this.loading = true;
      var that = this;

      this.publicationService.show(item.id)
      .subscribe({
        next(response: Publication) {
          that.loading = false;
          that.selectObj = response;
          that.modalPrevisualizarVisible = true;
          that.open(modal);
        },
        error(msg) {
          that.loading = false;
          that.tratarError(msg);
        }
      });
    }
  }

  cerrarModalPrevisualizar() {
    this.modalPrevisualizarVisible = false;
    this.selectObj = null;
    if (this.modalRef) { this.modalRef.close(); }
  }

  // ---- Publicar ----
  async publicar(): Promise<void> {

    if (!navigator.onLine) {
      this.showToast('warning', 'Warning!', 'Necesitas conexión a internet para publicar.');
      return;
    }


    const nav = navigator as any;

    if (!nav.share) {
      this.showToast('warning', 'Warning!', 'Tu navegador no soporta esta función. Usa Chrome en móvil.');
      return;
    }

    try {
      const archivos = await this.obtenerBlobs(this.selectObj);

      if (!nav.canShare || !nav.canShare({ files: archivos })) {
        this.showToast('warning', 'Warning!', 'El dispositivo no permite compartir estos archivos.');
        return;
      }

      this.compartiendo = true;

      await nav.share({
        title : 'Publicación',
        text  : this.selectObj.texto,
        files : archivos
      });

      this.marcarPublicada(this.selectObj.id);

    } catch (err) {
      if (err && (err as any).name !== 'AbortError') {
        this.showToast('error', 'Error!', 'Error al compartir.');
      }
    } finally {
      this.compartiendo = false;
    }
  }

  private marcarPublicada(id: number): void {
    this.loading = true;
    var that = this;

    this.publicationService.publish(id)
    .subscribe({
      next(response: Publication) {
        that.loading = false;
        // that.showToast('success', 'Success!', 'Publicación marcada como publicada.');
        that.cerrarModalPrevisualizar();
        that.getListado();
      },
      error(msg) {
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  private async obtenerBlobs(pub: Publication): Promise<File[]> {
    return Promise.all(
      pub.images.map(async (img: any, i: number) => {
        // Si la url es base64 (offline) o URL normal (online)
        const res  = await fetch(img.url);
        const blob = await res.blob();
        return new File([blob], `imagen_${i}.jpg`, { type: blob.type });
      })
    );
  }

  // ---- Eliminar ----
  abrirModalEliminar(item: Publication, modal: any) {
    this.selectObj = item;
    this.modalEliminarVisible = true;
    this.modalRef = this.modalService.open(modal, {
      // size: 'sm',
      backdrop: 'static',
      container: 'nb-layout',
      keyboard: false
    });
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.selectObj = null;
    if (this.modalRef) { this.modalRef.close(); }
  }

  confirmarEliminar(): void {
    this.loading = true;
    var that = this;
    const eliminandoEnModoAleatorio = that.modoAleatorio;

    this.publicationService.destroy(this.selectObj.id)
    .subscribe({
      next() {
        that.loading = false;
        // that.showToast('success', 'Success!', 'Publicación eliminada.');
        that.cerrarModalEliminar();

        if (eliminandoEnModoAleatorio) {
          // Sacar del listado local y pasar a la siguiente sin recargar todo
          const idEliminado = that.selectObj ? that.selectObj.id : null;
          that.listado = that.listado.filter(p => p.id !== idEliminado);
          that.filteredItems = that.listado;
          that.init();
          that.siguienteAleatoria();
          that.cont_publications_event.emit(that.listado.length);
        } else {
          that.getListado();
        }
      },
      error(msg) {
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  activarModoAleatorio(): void {
    if (this.listado.length === 0) {
      this.showToast('info', 'Info!', 'No hay publicaciones disponibles.');
      return;
    }
    this.indicesUsados = [];
    this.modoAleatorio = true;
    this.siguienteAleatoria();
  }

  desactivarModoAleatorio(): void {
    this.modoAleatorio = false;
    this.publicacionActual = null;
    this.indicesUsados = [];
    this.getListado();
  }

  siguienteAleatoria(): void {
    // Indices disponibles — los que no han sido usados aún
    const disponibles = this.listado
      .map((_, i) => i)
      .filter(i => !this.indicesUsados.includes(i));

    if (disponibles.length === 0) {
      this.showToast('info', 'Info!', 'Ya recorriste todas las publicaciones. Recargando...');
      this.refrescarModoAleatorio();
      return;
    }

    const randomIndex = disponibles[Math.floor(Math.random() * disponibles.length)];
    this.indicesUsados.push(randomIndex);
    this.publicacionActual = this.listado[randomIndex];
  }

  async publicarAleatoria(): Promise<void> {
    if (!navigator.onLine) {
      this.showToast('warning', 'Warning!', 'Necesitas conexión a internet.');
      return;
    }

    const nav = navigator as any;
    if (!nav.share) {
      this.showToast('warning', 'Warning!', 'Usa Chrome en móvil.');
      return;
    }

    this.loading = true;
    const that = this;

    // 1. Obtener la data y los archivos PRIMERO
    this.publicationService.show(this.publicacionActual.id).subscribe({
      next: async (response: Publication) => {
        try {
          const archivos = await that.obtenerBlobs(response);

          if (!nav.canShare || !nav.canShare({ files: archivos })) {
            that.loading = false;
            that.showToast('warning', 'Warning!', 'Dispositivo no compatible.');
            return;
          }

          that.loading = false; // Quitamos el loading antes del share
          that.compartiendo = true;

          // 2. LLAMAR A SHARE INMEDIATAMENTE
          // Esto mantiene la activación del usuario activa
          await nav.share({
            title: 'Publicación',
            text: response.texto,
            files: archivos
          });

          // 3. SI EL SHARE FUE EXITOSO, RECIÉN AHÍ MARCAMOS EN API
          // El usuario ya vio el menú y eligió WhatsApp
          const marcadaOk = await that.marcarPublicadaAleatoria(response.id);

          if (marcadaOk) {
            that.listado = that.listado.filter(p => p.id !== response.id);
            that.filteredItems = that.listado;
            that.init();
            that.siguienteAleatoria();
            that.cont_publications_event.emit(that.listado.length);
          }

        } catch (err) {
          // Si el usuario cancela el menú de compartir, entra aquí como 'AbortError'
          if (err && (err as any).name !== 'AbortError') {
            that.showToast('error', 'Error!', 'Error al compartir.');
          }
        } finally {
          that.compartiendo = false;
          that.loading = false;
        }
      },
      error(msg) {
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  private marcarPublicadaAleatoria(id: number): Promise<boolean> {
    this.loading = true;
    var that = this;

    return new Promise(function(resolve) {
      that.publicationService.publish(id)
      .subscribe({
        next: function(response: Publication) {
          that.loading = false;
          resolve(true);
        },
        error: function(msg) {
          that.loading = false;
          that.tratarError(msg);
          resolve(false);
        }
      });
    });
  }
}