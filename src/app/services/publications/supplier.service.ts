import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class SupplierService {

  private apiUrl = `${environment.apiUrl}/plaza_vestido/suppliers`;
  private dbName = 'publicaciones_db';
  private storeName = 'suppliers';

  constructor(private http: HttpClient) {}

  // ---- API ----
  index(params: string = ''): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?status=true${params}`);
  }

  buscar(termino: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?status=true&search=${termino}`);
  }

  // ---- IndexedDB ----
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 2);  // ← versión 2, igual que offline-queue
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains('suppliers')) {
          db.createObjectStore('suppliers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('publicaciones_queue')) {
          db.createObjectStore('publicaciones_queue', { keyPath: '_localId' });
        }
        if (!db.objectStoreNames.contains('publicar_queue')) {
          db.createObjectStore('publicar_queue', { keyPath: '_localId' });
        }
      };
      req.onsuccess = (e: any) => resolve(e.target.result as IDBDatabase);
      req.onerror   = (e: any) => reject(e.target.error); 
    });
  }

  async guardarEnLocal(suppliers: any[]): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    store.clear();
    suppliers.forEach(s => store.put(s));
  }

  async obtenerDeLocal(): Promise<any[]> {
    const db = await this.openDB();
    return new Promise<any[]>((resolve, reject) => {  // ← tipo explícito en Promise
      const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
      const req = store.openCursor();                  // ← openCursor en lugar de getAll
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
      req.onerror = (e: any) => reject(e);
    });
  }

  async buscarEnLocal(termino: string): Promise<any[]> {
    const todos: any[] = await this.obtenerDeLocal();
    const t = termino.toUpperCase();
    return todos.filter(s =>
      (s.razon_social && s.razon_social.toUpperCase().includes(t)) ||
      (s.categoria    && s.categoria.toUpperCase().includes(t))    ||
      (s.email        && s.email.toUpperCase().includes(t))
    );
  }

  // ---- Sincronizar ----
  // Llama a la API, guarda en local y devuelve el listado
  async sincronizar(): Promise<any[]> {
    return new Promise<any[]>((resolve) => {  // ← tipo explícito en Promise
      this.index().subscribe({
        next: async (response: any) => {
          const suppliers: any[] = response.data;
          await this.guardarEnLocal(suppliers);
          resolve(suppliers);
        },
        error: async () => {
          const local: any[] = await this.obtenerDeLocal();
          resolve(local);
        }
      });
    });
  }
}