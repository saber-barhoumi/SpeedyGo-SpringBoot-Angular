import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Returns } from 'src/app/models/return';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReturnService {
  private apiUrl = 'http://localhost:8084/returns';

  constructor(private http: HttpClient) {}

  addReturn(returnData: Returns): Observable<Returns> {
    return this.http.post<Returns>(this.apiUrl, returnData);
  }

  getAllReturns(): Observable<Returns[]> {
    return this.http.get<Returns[]>(this.apiUrl);
  }
}
