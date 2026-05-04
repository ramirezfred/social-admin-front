import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Publication } from '../../@core/models/publication.model';
import { OfflineQueueService } from './offline-queue.service';

@Injectable()
export class PublicationService {

  private apiUrl = `${environment.apiUrl}/plaza_vestido/publications`;

  constructor(
    private http: HttpClient,
    private offlineQueue: OfflineQueueService,
  ) {

    console.log('PublicationService');

    // 1. Intentar sincronizar inmediatamente al cargar el servicio
    if (navigator.onLine) {
      this.sincronizarCola();
    }

    // 2. Mantener el listener para cambios de estado durante la sesión
    window.addEventListener('online', () => {
      console.log('Conexión restaurada, sincronizando...');
      this.sincronizarCola();
    });
  }

  // ---- API ----
  index(): Observable<Publication[]> {
    return this.http.get<Publication[]>(this.apiUrl);
  }

  store(formData: FormData): Observable<Publication> {
    return this.http.post<Publication>(this.apiUrl, formData);
  }

  show(id: number): Observable<Publication> {
    return this.http.get<Publication>(`${this.apiUrl}/${id}`);
  }

  publish(id: number): Observable<Publication> {
    return this.http.put<Publication>(`${this.apiUrl}/${id}/publish`, {});
  }

  destroy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ---- Crear con soporte offline ----
  async crearConOffline(
    supplierId: number,
    supplierRazonSocial: string,
    texto: string,
    archivos: File[]
  ): Promise<'api' | 'local'> {

    if (navigator.onLine) {
      return new Promise<'api' | 'local'>((resolve, reject) => {
        const fd = new FormData();
        fd.append('supplier_id', String(supplierId));
        fd.append('texto', texto);
        archivos.forEach(f => fd.append('images[]', f as any));

        this.store(fd).subscribe({
          next : () => resolve('api'),
          error: (err) => reject(err),
        });
      });

    } else {

      await this.offlineQueue.encolarCreacion({
        supplier_id           : supplierId,
        supplier_razon_social : supplierRazonSocial,
        texto                 : texto,
        imagenes              : archivos,
      });

      return 'local';
    }
  }

  // ---- Sincronización — solo creaciones ----
  async sincronizarCola1(): Promise<void> {
    const creaciones = await this.offlineQueue.obtenerCreacionesPendientes();
    console.log(`${creaciones.length} publicaciones pendientes.`);


    if (creaciones.length === 0) return;

    console.log(`Sincronizando ${creaciones.length} publicaciones pendientes...`);

    for (const pub of creaciones) {
      try {
        const fd = new FormData();
        fd.append('supplier_id', String(pub.supplier_id));
        fd.append('texto', pub.texto);
        
        // En IndexedDB los archivos se guardan como Blobs
        pub.imagenes.forEach((blob: Blob, index: number) => {
          const file = new File([blob], `img_${index}.jpg`, { type: blob.type });
          fd.append('images[]', file);
        });

        // Usamos toPromise para asegurar que la ejecución espere la respuesta
        await this.store(fd).toPromise();
        
        // Si tuvo éxito, borramos de IndexedDB
        await this.offlineQueue.eliminarCreacion(pub._localId);
        console.log('Publicación sincronizada con éxito');

      } catch (e) {
        console.error('Error sincronizando publicación individual:', e);
        // No cortamos el bucle para que intente con la siguiente
      }
    }
  } 

  async sincronizarCola(): Promise<void> {
    try {
      const ids = await this.offlineQueue.obtenerIdsPendientes();
      
      if (ids.length === 0) return;
      console.log(`Iniciando sincronización de ${ids.length} publicaciones...`);

      for (const id of ids) {

        let pub = null; // Declarar fuera para anularla

        try {
          // 1. Leemos los datos de la DB (Transacción rápida 1)
          pub = await this.offlineQueue.obtenerUna(id);
          if (!pub) continue;

          // 2. Preparamos el FormData
          const fd = new FormData();
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

          // 3. Enviamos a la API (Aquí no hay transacciones de DB abiertas)
          await this.store(fd).toPromise();

          // 4. Borramos de la DB tras el éxito (Transacción rápida 2)
          await this.offlineQueue.eliminarCreacion(id);
          console.log(`Sincronizada con éxito: ${id}`);

          // Forzar liberación de referencia
          pub = null;

        } catch (error) {
          console.error(`Error procesando publicación ${id}:`, error);
          // Si una falla, el bucle sigue con la siguiente

          // if (error.status === 0) break; // Si no hay internet, no sigas intentando
        }
      }
      console.log('Proceso de sincronización terminado.');
    } catch (e) {
      console.error('Error general en la cola:', e);
    }
  }

}