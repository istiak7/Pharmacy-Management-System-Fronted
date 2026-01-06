import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse } from './api.service';

// Interfaces for Auth
export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface RegisterRequest {
  roleId: number;
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthToken {
  id: number;
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Send OTP to email
  sendOtp(request: SendOtpRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/User/send-otp`, request);
  }

  // Verify OTP
  verifyOtp(request: VerifyOtpRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/User/verify-otp`, request);
  }

  // Register new user
  register(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/User/registration`, request);
  }

  // Login
  login(request: LoginRequest): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${this.baseUrl}/User/login`, request).pipe(
      tap(response => {
        if (response && response.accessToken) {
          this.storeTokens(response);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  // Refresh Token
  refreshToken(): Observable<ApiResponse<AuthToken>> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<ApiResponse<AuthToken>>(`${this.baseUrl}/User/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        if (response.isSuccess && response.data) {
          this.storeTokens(response.data);
        }
      })
    );
  }

  // Store tokens in localStorage
  private storeTokens(tokens: AuthToken): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  // Check if user has token
  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Logout
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    this.isAuthenticatedSubject.next(false);
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.hasToken();
  }
}
