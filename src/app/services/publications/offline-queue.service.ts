import { Injectable } from '@angular/core';

@Injectable()
export class OfflineQueueService {

  private dbName = 'publicaciones_db';
  private storeCrear = 'publicaciones_queue';

  private readonly MAX_PUBLICACIONES = 500;

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 2);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains('suppliers')) {
          db.createObjectStore('suppliers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.storeCrear)) {
          db.createObjectStore(this.storeCrear, { keyPath: '_localId' });
        }
      };
      req.onsuccess = (e: any) => resolve(e.target.result as IDBDatabase);
      req.onerror   = (e: any) => reject(e.target.error);
    });
  }

  private async put(storeName: string, value: any): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const req = db.transaction(storeName, 'readwrite')
                    .objectStore(storeName)
                    .put(value);
      req.onsuccess = () => resolve();
      req.onerror   = (e: any) => reject(e.target.error);
    });
  }

  private async getAll(storeName: string): Promise<any[]> {
    const db = await this.openDB();
    return new Promise<any[]>((resolve, reject) => {
      const store = db.transaction(storeName, 'readonly').objectStore(storeName);
      const req   = store.openCursor();
      const results: any[] = [];
      req.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = (e: any) => reject(e.target.error);
    });
  }

  private async delete(storeName: string, key: string): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const req = db.transaction(storeName, 'readwrite')
                    .objectStore(storeName)
                    .delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = (e: any) => reject(e.target.error);
    });
  }

  // ---- publicaciones_queue ----
  async encolarCreacion(formData: {
    user_id: number,
    supplier_id: number,
    supplier_razon_social: string,
    texto: string,
    imagenes: File[],
  }): Promise<string> {

    const pendientes = await this.obtenerIdsPendientes();
  
    if (pendientes.length >= this.MAX_PUBLICACIONES) {
      throw new Error('Límite de publicaciones offline alcanzado');
    }

    const localId = `local_${Date.now()}`;
    await this.put(this.storeCrear, { ...formData, _localId: localId });
    return localId;
  }

  async obtenerCreacionesPendientes(): Promise<any[]> {
    return this.getAll(this.storeCrear);
  }

  async eliminarCreacion(localId: string): Promise<void> {
    return this.delete(this.storeCrear, localId);
  }

  /**
   * Obtiene solo los IDs locales para no saturar la memoria,
   * permitiendo procesar cada uno de forma independiente.
   */
  async obtenerIdsPendientes(): Promise<string[]> {
    const db = await this.openDB();
    return new Promise<string[]>((resolve, reject) => {
      const ids: string[] = [];
      // Abrimos la transacción en modo readonly para que sea más rápida
      const transaction = db.transaction(this.storeCrear, 'readonly');
      const store = transaction.objectStore(this.storeCrear);
      
      // openCursor es el método más estándar y compatible en Angular 5 / TS antiguo
      const req = store.openCursor();

      req.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          // Guardamos la llave (ID) y saltamos al siguiente sin procesar el valor
          ids.push(cursor.key as string);
          cursor.continue();
        } else {
          // Cuando ya no hay más elementos, resolvemos el array de IDs
          resolve(ids);
        }
      };

      req.onerror = (e: any) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * Obtiene una única publicación por su ID local
   */
  async obtenerUna(localId: string): Promise<any> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(this.storeCrear, 'readonly')
                    .objectStore(this.storeCrear)
                    .get(localId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

}