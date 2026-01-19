import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/authservice';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">

        <h3 class="text-center mb-3">Register</h3>

  
        <div *ngIf="errorMessage"
             class="alert alert-danger py-2">
          {{ errorMessage }}
        </div>

        
        <input
          type="text"
          class="form-control mb-2"
          placeholder="Full Name"
          [(ngModel)]="registerData.name">

        <small class="text-danger"
               *ngIf="submitted && !registerData.name">
          Name is required
        </small>

 
        <input
          type="email"
          class="form-control mt-3 mb-2"
          placeholder="Email"
          [(ngModel)]="registerData.email">

        <small class="text-danger"
               *ngIf="submitted && !registerData.email">
          Email is required
        </small>

        
        <input
          type="password"
          class="form-control mt-3 mb-2"
          placeholder="Password"
          [(ngModel)]="registerData.password">

        <small class="text-danger"
               *ngIf="submitted && !registerData.password">
          Password is required
        </small>

        <button
          type="button"
          class="btn btn-success w-100 mt-3"
          [disabled]="loading"
          (click)="register()">

          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>

        <p class="text-center text-muted small mt-3">
          Already have an account?
          <a routerLink="/login">Login</a>
        </p>

      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: calc(100vh - 140px);
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f8f9fa;
    }

    .auth-card {
      width: 100%;
      max-width: 380px;
      padding: 30px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
  `]
})
export class RegisterComponent {

  registerData = {
    name: '',
    email: '',
    password: ''
  };

  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.submitted = true;
    this.errorMessage = '';


    if (
      !this.registerData.name ||
      !this.registerData.email ||
      !this.registerData.password
    ) {
      return;
    }

    this.loading = true;

    this.authService.register(this.registerData)
      .subscribe({
        next: () => {
 
          this.router.navigate(['/login']);
        },
        error: err => {
          this.loading = false;

    
          if (err.status === 400) {
            this.errorMessage = 'User already exists or invalid data';
          } else {
            this.errorMessage = 'Server error. Please try again later.';
          }
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
