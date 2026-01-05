import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-send-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './send-otp.component.html',
  styleUrl: './send-otp.component.scss'
})
export class SendOtpComponent {
  email: string = '';
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email) {
      this.showMessage('Please enter your email address', true);
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.authService.sendOtp({ email: this.email }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          this.showMessage('OTP sent successfully! Check your email.', false);
          // Store email for verification step
          sessionStorage.setItem('otpEmail', this.email);
          // Navigate to verify OTP page after short delay
          setTimeout(() => {
            this.router.navigate(['/auth/verify-otp']);
          }, 1500);
        } else {
          this.showMessage(response.message || 'Failed to send OTP', true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showMessage(error.error?.message || 'An error occurred. Please try again.', true);
      }
    });
  }

  private showMessage(msg: string, isError: boolean): void {
    this.message = msg;
    this.isError = isError;
  }
}
