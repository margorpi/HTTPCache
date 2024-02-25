import { Component } from '@angular/core';
import { HTTPCacheService } from './httpcache.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  template: `
    <button (click)="getData()">Get Data</button>
    <p>{{message}}</p>`
})

export class AppComponent {
  title = 'ETagCachingDemo';
  message : string = '';
  constructor(private http : HTTPCacheService){}
  getData() : void{
    this.http.get<string>('http://127.0.0.1/test.json').subscribe({next : (data) => {
      console.log('subscribe data');
      console.log(data);
      this.message = data.message;
    }});
  }
}