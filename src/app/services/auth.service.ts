import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);
  private isAuthenticatedSubject: BehaviorSubject<boolean>;

  isAuthenticated$;

  constructor(private http: HttpClient) {
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

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
    const refreshToken = this.isBrowser() ? localStorage.getItem('refreshToken') : null;
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
    if (this.isBrowser()) {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }

  // Check if user has token
  private hasToken(): boolean {
    return this.isBrowser() && !!localStorage.getItem('accessToken');
  }

  // Get access token
  getAccessToken(): string | null {
    return this.isBrowser() ? localStorage.getItem('accessToken') : null;
  }

  // Logout
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
    }
    this.isAuthenticatedSubject.next(false);
  }

  
  // Check if authenticated
  isAuthenticated(): boolean {
    return this.hasToken();
  }
}
