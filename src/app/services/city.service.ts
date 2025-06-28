import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface City {
  cityId: number;
  cityName: string;
}

@Injectable({ providedIn: 'root' })
export class CityService {
  private baseUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api/Cities';

  constructor(private http: HttpClient) {}

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(this.baseUrl);
  }

  addCity(city: Partial<City>): Observable<City> {
    return this.http.post<City>(this.baseUrl, city, {responseType:'text' as 'json'});
  }

  updateCity(city: City): Observable<City> {
    return this.http.put<City>(`${this.baseUrl}/${city.cityId}`, city , {responseType:'text' as 'json'});
  }

  deleteCity(cityId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${cityId}`, {responseType:'text' as 'json'});
  }
}

//Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=bookmyshowdb;Integrated Security=True;
//https://vb7dqrjl-5069.inc1.devtunnels.ms/