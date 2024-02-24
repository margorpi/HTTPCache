import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { LocalCacheService } from './local-cache.service';
import { Observable, from, of, catchError, throwError} from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HTTPCacheService {
  data : any = null;
  constructor(private localCacheService : LocalCacheService, private http: HttpClient) { }
  private async loadFileFromCache(filename : string) : Promise<any>{
    let cache = null;
    try{
      cache = await this.localCacheService.getData(filename);
    } catch (error) {
      cache = null;
    }
    return cache;
  }
  private async saveFileToCache(filename : string, etag : string | null, body : any) : Promise<void>{
    if(etag !== null){
      await this.localCacheService.setData(filename, {etag : etag, body : body});
    }
  }
  private httpClientGet(domain: string, filename: string, cache : any) : Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if(cache !== null){
      headers = headers.set('If-None-Match', cache.etag);
    }
    return this.http.get<any>(`${domain}/${filename}`, { headers: headers, observe: 'response' })
      .pipe(map(response => {
          console.log('map to write cache');
          from(this.saveFileToCache(filename, response.headers.get('ETag')!, response.body)).subscribe();
          return response.body;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 304) {
            console.log('catch 304 error')
            return of(cache.body);
          } 
          return throwError(() => new Error(`Status ${error.status} - ${error.message}`));
        })
      );
  }
  get<T>(url : string): Observable<{data: T}> {
    const parsedUrl = new URL(url);
    const domain = `${parsedUrl.protocol}//${parsedUrl.host}`;
    const filename = parsedUrl.pathname.substring(1) + parsedUrl.search;
    return from(this.loadFileFromCache(filename)).pipe(
      switchMap(cache => {
        return this.httpClientGet(domain, filename, cache);
      })
    );
  }

}
