import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Publication } from '../../@core/models/publication.model';
import { OfflineQueueService } from './offline-queue.service';

@Injectable()
export class PublicationService implements OnDestroy {

  private apiUrl = `${environment.apiUrl}/api/plaza_vestido/publications`;

  private sincronizando = false;
  private onlineTimeout: any = null;
  private onlineHandler: () => void;

  constructor(
    private http: HttpClient,
    private offlineQueue: OfflineQueueService,
  ) {

    console.log('PublicationService');

    // Bind del handler para poder removerlo después
    this.onlineHandler = () => {
      console.log('Evento ONLINE detectado');

      // Limpiar timeout anterior
      if (this.onlineTimeout) {
        clearTimeout(this.onlineTimeout);
      }

      // Esperar 5 segundos antes de sincronizar
      // para asegurar que la conexión sea estable
      this.onlineTimeout = setTimeout(() => {

        console.log('Conexión estable, iniciando sincronización');

        this.sincronizarCola();

        this.onlineTimeout = null; // Limpiar referencia después de ejecutar

      }, 5000);
    };

    // 1. Intentar sincronizar inmediatamente al cargar el servicio
    if (navigator.onLine) {
      this.sincronizarCola();
    }

    // 2. Mantener el listener para cambios de estado durante la sesión
    window.addEventListener('online', this.onlineHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.onlineHandler);
  }

  // ---- API ----
  index(userId: number): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.apiUrl}?user_id=${userId}`);
  }

  store(formData: FormData): Observable<Publication> {
    return this.http.post<Publication>(this.apiUrl, formData);
  }

  show(id: number): Observable<Publication> {
    return this.http.get<Publication>(`${this.apiUrl}/${id}`);
  }

  showNormal(id: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/publicacion/normal`);
  }

  publish(id: number): Observable<Publication> {
    return this.http.put<Publication>(`${this.apiUrl}/${id}/publish`, {});
  }

  destroy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  editar(id: number, formData: FormData): Observable<Publication> {
    return this.http.post<any>(`${this.apiUrl}/${id}/editar`, formData);
  }

  // ---- Crear con soporte offline ----
  async crearConOffline(
    userId: number,
    supplierId: number,
    supplierRazonSocial: string,
    texto: string,
    archivos: File[]
  ): Promise<'api' | 'local'> {

    // Siempre guardar en cola primero
    const localId = await this.offlineQueue.encolarCreacion({
      user_id               : userId,
      supplier_id           : supplierId,
      supplier_razon_social : supplierRazonSocial,
      texto                 : texto,
      imagenes              : archivos,
    });

    if (navigator.onLine) {
      try {
        const sincronizado = await this.sincronizarUnaPublicacion(localId);
        if (sincronizado) {
          return 'api';
        } else {
          return 'local';
        }
      } catch (error) {
        // Solo eliminar de la cola si es error 500 (error del servidor)
        // Porque significa que el servidor procesó la solicitud pero falló internamente
        if (error.status === 500) {
          console.log(`Error 500 en publicación ${localId}, eliminando de cola`);
          await this.offlineQueue.eliminarCreacion(localId);
        } else {
          // Errores 400, 401, 404, etc. - La publicación no se creó en el servidor
          // La mantenemos en cola para reintentar después
          console.log(`Error ${error.status} en publicación ${localId}, se mantiene en cola para reintentar`);
        }
        // Re-lanzamos el error para que el componente lo capture y muestre el mensaje
        throw error;
      }
    }
    return 'local';

  }

  async editarConOnline(
    publicationId: number,
    supplierId: number,
    texto: string,
    archivos: any[]
  ): Promise<any> {

    try {

      const fd = new FormData();
      fd.append('supplier_id', String(supplierId));
      fd.append('texto', texto);
      
      // Añadir imágenes
      // Recorremos el arreglo y los agregamos al FormData
      archivos.forEach((imagen) => {
        fd.append('images[]', imagen);
      });

      let res = null;
      
      // Enviar a la API
      res = await this.editar(publicationId, fd).toPromise();

      return res;
    } catch (error) {

      // Re-lanzamos el error para que el componente lo capture y muestre el mensaje
      throw error;
    }

  }

  private async sincronizarUnaPublicacion(localId: string): Promise<boolean> {
    
    let pub = null; // Declarar fuera para anularla

    try {
      // 1. Obtener la publicación pendiente
      pub = await this.offlineQueue.obtenerUna(localId);
      
      if (!pub) {
        console.warn(`Publicación ${localId} no encontrada en la cola`);
        return false;
      }
      
      // 2. Verificar que tenemos conexión
      if (!navigator.onLine) {
        console.log(`Sin conexión, no se puede sincronizar ${localId}`);
        return false;
      }
      
      // 3. Preparar FormData para la API
      const fd = new FormData();
      fd.append('user_id', String(pub.user_id));
      fd.append('supplier_id', String(pub.supplier_id));
      fd.append('texto', pub.texto);
      
      // Añadir imágenes si existen
      if (pub.imagenes && pub.imagenes.length > 0) {
        pub.imagenes.forEach((blob: Blob, index: number) => {
          const fileName = (blob as any).name || `img_${index}.jpg`;
          fd.append('images[]', blob, fileName);
        });
      }
      
      // 4. Enviar a la API
      await this.store(fd).toPromise();
      
      // 5. Eliminar de la cola después de éxito
      await this.offlineQueue.eliminarCreacion(localId);

      // Forzar liberación de referencia
      pub = null;
      
      console.log(`Publicación ${localId} sincronizada exitosamente`);
      return true;
      
    } catch (error) {
      pub = null; // Liberar referencia en caso de error
      // Propagamos el error con el status para que el llamador lo maneje
      throw error; // El error mantiene su propiedad .status
    }
  }

  // ---- Sincronización — solo creaciones ----
  async sincronizarCola(): Promise<void> {

    // Evitar sincronizaciones simultáneas
    if (this.sincronizando) {
      console.log('Ya hay una sincronización en proceso');
      return;
    }

    this.sincronizando = true;

    try {
      const ids = await this.offlineQueue.obtenerIdsPendientes();
      
      if (ids.length === 0) {
        console.log('No hay publicaciones pendientes');
        this.sincronizando = false;
        return;
      }

      console.log(`Iniciando sincronización de ${ids.length} publicaciones...`);

      for (const id of ids) {

        // Si se perdió internet, detener todo
        if (!navigator.onLine) {
          console.log('Internet perdido, deteniendo sincronización');
          break;
        }

        let pub = null; // Declarar fuera para anularla

        try {
          // 1. Leemos los datos de la DB (Transacción rápida 1)
          pub = await this.offlineQueue.obtenerUna(id);
          if (!pub) continue;

          // 2. Preparamos el FormData
          const fd = new FormData();
          fd.append('user_id', String(pub.user_id));
          fd.append('supplier_id', String(pub.supplier_id));
          fd.append('texto', pub.texto);
          // pub.imagenes.forEach((blob: Blob, index: number) => {
          //   const file = new File([blob], `img_${index}.jpg`, { type: blob.type });
          //   fd.append('images[]', file);
          // });

          // OPTIMIZACIÓN: No crees un objeto 'new File()'
          // FormData.append acepta un Blob y el nombre del archivo como 3er parámetro
          pub.imagenes.forEach((blob: Blob, index: number) => {
            fd.append('images[]', blob, `img_${index}.jpg`);
          });

          console.log(`Subiendo publicación ${id}`);

          // 3. Enviamos a la API (Aquí no hay transacciones de DB abiertas)
          await this.store(fd).toPromise();

          // 4. Borramos de la DB tras el éxito (Transacción rápida 2)
          await this.offlineQueue.eliminarCreacion(id);
          console.log(`Sincronizada con éxito: ${id}`);

          // Forzar liberación de referencia
          pub = null;

          // PAUSA ENTRE PETICIONES
          // MUY IMPORTANTE en conexiones malas
          await this.delay(2000);

        } catch (error) {
          console.error(`Error procesando publicación ${id}:`, error);
          // Si una falla, el bucle sigue con la siguiente

          // if (error.status === 0) break; // Si no hay internet, no sigas intentando

          // Si no hay conexión, detener sincronización
          if (!navigator.onLine) {
            break;
          }

          // Esperar antes de seguir
          await this.delay(3000);
        }
      }
    } catch (e) {
      console.error('Error general en la cola:', e);
    }finally {

      // Liberar flag SIEMPRE
      this.sincronizando = false;

      console.log('Sincronización finalizada');

    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}