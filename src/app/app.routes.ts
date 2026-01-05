import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'send-otp',
        loadComponent: () => import('./auth/send-otp/send-otp.component').then(m => m.SendOtpComponent)
      },
      {
        path: 'verify-otp',
        loadComponent: () => import('./auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  }
];
