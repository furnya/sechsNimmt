import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  getRandomSequence(min: number, max: number): Observable<number[]> {
    return this.http
      .get(
        'https://www.random.org/sequences/?min=' +
          min +
          '&max=' +
          max +
          '&col=1&format=plain&rnd=new', {
              responseType: 'text'
          }
      )
      .pipe(
        map((response: string) => {
          return response.trim().split('\n').map(n => Number(n));
        })
      );
  }
}
