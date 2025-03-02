import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carpooling } from '../../FrontOffices/models/carpooling';
import { Router } from '@angular/router'; // Import the Router

@Injectable({
  providedIn: 'root'
})
export class CarpoolingService {
  private apiUrl = 'http://localhost:8084/api/carpoolings';

  constructor(private http: HttpClient, private router: Router) {} // Inject the Router

  private getHeaders(): HttpHeaders {
    // Utilisez "token" en minuscules pour récupérer le token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      this.router.navigate(['/login']); // Redirige vers la page de login si le token est absent
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllCarpoolings(): Observable<Carpooling[]> {
    return this.http.get<Carpooling[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getCarpooling(id: number): Observable<Carpooling> {
    return this.http.get<Carpooling>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  addCarpooling(carpooling: Carpooling): Observable<Carpooling> {
    return this.http.post<Carpooling>(`${this.apiUrl}/add`, carpooling, { 
      headers: this.getHeaders() 
  });  }

  updateCarpooling(carpooling: Carpooling): Observable<Carpooling> {
    return this.http.put<Carpooling>(
        `${this.apiUrl}/update/${carpooling.id}`, // URL: /api/carpoolings/update/{id}
        carpooling, 
        { headers: this.getHeaders() }
    );
}
deleteCarpooling(id: number): Observable<any> {
  return this.http.delete(
      `${this.apiUrl}/delete/${id}`, // URL: /api/carpoolings/delete/{id}
      { headers: this.getHeaders() }
  );
}
}
