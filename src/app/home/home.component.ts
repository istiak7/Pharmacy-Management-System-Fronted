import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  username: string = '';
  testApiStatus: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }
    // Get username from localStorage or decode from token
    this.username = localStorage.getItem('username') || 'User';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Test API call to check Bearer token
  testBearerToken(): void {
    this.isLoading = true;
    this.testApiStatus = 'Calling API...';
    
    this.apiService.getMiniExcelReport().subscribe({
      next: (blob) => {
        this.isLoading = false;
        this.testApiStatus = '✅ Success! Bearer token is working. File received.';
        
        // Optional: Download the file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.testApiStatus = '❌ Error 401: Unauthorized - Bearer token missing or invalid';
        } else if (err.status === 0) {
          this.testApiStatus = '❌ Error: Cannot connect to server. Is backend running?';
        } else {
          this.testApiStatus = `❌ Error ${err.status}: ${err.message}`;
        }
        console.error('API Error:', err);
      }
    });
  }
}
