import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    cityId: number;
    city?: string; 
    createdAt?: string;
    cityName?: string; 
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

    updateUser(user: User): Observable<any> {
        return this.http.put(`${this.apiUrl}/${user.userId}`, user, { responseType: 'text' as 'json' });
    }

    addUser(user: Partial<User>): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    deleteUser(userId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${userId}`, { responseType: 'text' as 'json' });
    }

    adminUpdateUser(user: { userId: number; fullName: string; email: string; role: string; cityId: number }): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/AdminUpdate/${user.userId}`, user, { responseType: 'text' as 'json' });
    }
}
