import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    cityId: number;
    city?: string; // Optional, for display if needed
    createdAt?: string;
    cityName?: string; // Added for convenience, if city name is needed directly
    // Add other user fields as needed
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api/Users';

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        // The API returns users with city as a string, not cityId
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

    /**
     * Calls the admin update user API to update user details as an admin.
     * @param user The user object containing updated details (must include userId, fullName, email, role, cityId)
     */
    adminUpdateUser(user: { userId: number; fullName: string; email: string; role: string; cityId: number }): Observable<User> {
        // Backend expects: { userId, fullName, email, role, cityId }
        return this.http.put<User>(`${this.apiUrl}/AdminUpdate/${user.userId}`, user, { responseType: 'text' as 'json' });
    }
}
