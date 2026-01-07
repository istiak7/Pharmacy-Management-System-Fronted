import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // CALL YOUR TEST API
  getTest(): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.baseUrl}/Test`);
  }

  // Test MiniExcel API - to check Bearer token in header
  getMiniExcelReport(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/Test/miniexcel`, {
      responseType: 'blob'
    });
  }
}
