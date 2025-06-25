import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    createdAt?: string;
    city?: string;
    // Add other user fields as needed
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api/Users';

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    updateUserRole(userId: number, newRole: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${userId}/role`, { role: newRole });
    }
}
