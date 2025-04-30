import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {
  private apiUrl = 'http://localhost:8084/pointsrelais/confirmer';

  constructor(private http: HttpClient) {}

  confirmerTransfert(pointRelaisId: number): Observable<string> {
    return this.http.post(this.apiUrl + '/' + pointRelaisId, null, { responseType: 'text' });
  }
}
