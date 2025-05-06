import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageAnalysisService {
  private apiUrl = 'https://ecf7-102-26-80-186.ngrok-free.app'; // URL to the Flask API  http://127.0.0.1:5000

  constructor(private http: HttpClient) { }

  /**
   * Analyzes an image and returns package dimensions and description
   * @param imageFile - The image file to analyze
   * @returns Observable with the analysis results
   */
  analyzeImage(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    return this.http.post(`${this.apiUrl}/describe`, formData);
  }

  /**
   * Check if the API is available
   * @returns Observable with the health status
   */
  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}