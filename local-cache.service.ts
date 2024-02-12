import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LocalCacheService {
  private db: IDBDatabase | null = null;
  private dbName : string = 'CacheDB';
  private storeName : string = 'httpGet';

  constructor() { 
    this.initDb();
  }

  private initDb(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(); 
      };

      request.onerror = (event) => {
        console.error('Database error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error); 
      };
    });
  }

  getData(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('IndexedDB is not initialized');
        return;
      }
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result ? (event.target as IDBRequest).result : null);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  setData(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('IndexedDB is not initialized');
        return;
      }
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}
