import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  formData = {
    identifier: '',
    password: ''
  };

  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.authService.login(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.accessToken) {
          // Store username for display
          localStorage.setItem('username', response.username || 'User');
          this.showMessage('Login successful! Redirecting...', false);
          // Navigate to home page
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        } else {
          this.showMessage('Login failed', true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showMessage(error.error?.message || 'Login failed. Please check your credentials.', true);
      }
    });
  }

  private validateForm(): boolean {
    if (!this.formData.identifier.trim()) {
      this.showMessage('Email is required', true);
      return false;
    }

    if (!this.isValidEmail(this.formData.identifier)) {
      this.showMessage('Please enter a valid email address', true);
      return false;
    }

    if (!this.formData.password) {
      this.showMessage('Password is required', true);
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private showMessage(msg: string, isError: boolean): void {
    this.message = msg;
    this.isError = isError;
  }
}
