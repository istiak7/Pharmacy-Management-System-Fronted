import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss'
})
export class VerifyOtpComponent implements OnInit {
  email: string = '';
  otp: string = '';
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;
  resendLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get email from session storage
    this.email = sessionStorage.getItem('otpEmail') || '';
    if (!this.email) {
      this.router.navigate(['/auth/send-otp']);
    }
  }

  onSubmit(): void {
    if (!this.otp || this.otp.length < 4) {
      this.showMessage('Please enter a valid OTP', true);
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.authService.verifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          this.showMessage('OTP verified successfully!', false);
          // Mark email as verified for registration
          sessionStorage.setItem('emailVerified', 'true');
          // Navigate to registration page
          setTimeout(() => {
            this.router.navigate(['/auth/register']);
          }, 1500);
        } else {
          this.showMessage(response.message || 'Invalid OTP', true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showMessage(error.error?.message || 'Verification failed. Please try again.', true);
      }
    });
  }

  resendOtp(): void {
    this.resendLoading = true;
    this.message = '';

    this.authService.sendOtp({ email: this.email }).subscribe({
      next: (response) => {
        this.resendLoading = false;
        if (response.isSuccess) {
          this.showMessage('OTP resent successfully!', false);
        } else {
          this.showMessage(response.message || 'Failed to resend OTP', true);
        }
      },
      error: (error) => {
        this.resendLoading = false;
        this.showMessage(error.error?.message || 'Failed to resend OTP', true);
      }
    });
  }

  private showMessage(msg: string, isError: boolean): void {
    this.message = msg;
    this.isError = isError;
  }
}
