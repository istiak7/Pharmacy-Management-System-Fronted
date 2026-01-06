import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  formData = {
    roleId: 2, // Default role (e.g., 2 = User, 1 = Admin)
    username: '',
    email: '',
    password: '',
    confirmPassword: '' // For frontend validation only
  };

  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get verified email from session storage
    const verifiedEmail = sessionStorage.getItem('otpEmail');
    const isVerified = sessionStorage.getItem('emailVerified');

    if (verifiedEmail && isVerified === 'true') {
      this.formData.email = verifiedEmail;
    }
  }

  onSubmit(): void {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.message = '';

    // Send only the fields required by the API (exclude confirmPassword)
    const registerData = {
      roleId: this.formData.roleId,
      username: this.formData.username,
      email: this.formData.email,
      password: this.formData.password
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Check if response has user data (id and accessToken)
        if (response && response.id && response.accessToken) {
          this.showMessage('Registration successful! Redirecting to login...', false);
          // Clear session storage
          sessionStorage.removeItem('otpEmail');
          sessionStorage.removeItem('emailVerified');
          // Navigate to login
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.showMessage('Registration failed', true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showMessage(error.error?.message || 'Registration failed. Please try again.', true);
      }
    });
  }

  private validateForm(): boolean {
    if (!this.formData.username.trim()) {
      this.showMessage('Username is required', true);
      return false;
    }

    if (!this.formData.email.trim()) {
      this.showMessage('Email is required', true);
      return false;
    }

    if (!this.isValidEmail(this.formData.email)) {
      this.showMessage('Please enter a valid email address', true);
      return false;
    }

    if (!this.formData.password) {
      this.showMessage('Password is required', true);
      return false;
    }

    if (this.formData.password.length < 6) {
      this.showMessage('Password must be at least 6 characters', true);
      return false;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.showMessage('Passwords do not match', true);
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

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private showMessage(msg: string, isError: boolean): void {
    this.message = msg;
    this.isError = isError;
  }
}
