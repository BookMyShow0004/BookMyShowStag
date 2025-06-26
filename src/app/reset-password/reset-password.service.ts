import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResetPasswordService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api';

  constructor(private http: HttpClient) {}

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Users/ResetPassword`, { email });
  }
}
