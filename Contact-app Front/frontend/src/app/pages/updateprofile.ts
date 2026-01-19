import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/authservice';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="update-profile-container">
      <div class="update-profile-card">
        <div class="card-header">
          <h2>Update Profile</h2>
          <p class="subtitle">Update your account information</p>
        </div>

        <form (ngSubmit)="onSubmit()" #profileForm="ngForm">
          <!-- Name Field -->
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="user.name"
              required
              placeholder="Enter your full name"
              class="form-control"
              #nameField="ngModel">
            <span class="error-message" *ngIf="nameField.invalid && nameField.touched">
              Name is required
            </span>
          </div>

          <!-- Email Field (Read-only) -->
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="user.email"
              readonly
              class="form-control readonly-field"
              placeholder="Email cannot be changed">
            <small class="info-text"> Email address cannot be changed</small>
          </div>

          <!-- Password Field (Optional) -->
          <div class="form-group">
            <label for="password">New Password (Optional)</label>
            <input
              [type]="showPassword ? 'text' : 'password'"
              id="password"
              name="password"
              [(ngModel)]="user.password"
              placeholder="Leave blank to keep current password"
              class="form-control"
              minlength="6"
              #passwordField="ngModel">
            
            <div class="checkbox-container">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [(ngModel)]="showPassword"
                  name="showPassword"
                  class="checkbox-input">
                <span class="checkbox-text">👁️ Show Password</span>
              </label>
            </div>

            <span class="error-message" *ngIf="passwordField.invalid && passwordField.touched">
              Password must be at least 6 characters
            </span>
            <small class="info-text"> Leave blank if you don't want to change your password</small>
          </div>

          <!-- Error/Success Messages -->
          <div class="message error-box" *ngIf="errorMessage">
            ❌ {{ errorMessage }}
          </div>

          <div class="message success-box" *ngIf="successMessage">
            ✅ {{ successMessage }}
          </div>

          <!-- Action Buttons -->
          <div class="button-group">
            <button
              type="submit"
              class="btn-submit"
              [disabled]="profileForm.invalid || loading">
              <span *ngIf="!loading">Update Profile</span>
              <span *ngIf="loading"> Updating...</span>
            </button>

            <button
              type="button"
              class="btn-cancel"
              (click)="goBack()"
              [disabled]="loading">
              ← Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .update-profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .update-profile-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 500px;
      padding: 40px;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .card-header h2 {
      font-size: 28px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 14px;
      color: #718096;
    }

    .form-group {
      margin-bottom: 24px;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 8px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.readonly-field {
      background: #f7fafc;
      color: #718096;
      cursor: not-allowed;
    }

    .info-text {
      display: block;
      font-size: 12px;
      color: #718096;
      margin-top: 6px;
    }

    .checkbox-container {
      margin-top: 10px;
      margin-bottom: 8px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: normal;
      margin-bottom: 0;
    }

    .checkbox-input {
      width: 18px;
      height: 18px;
      cursor: pointer;
      margin-right: 8px;
    }

    .checkbox-text {
      font-size: 13px;
      color: #4a5568;
      user-select: none;
    }

    .error-message {
      display: block;
      color: #e74c3c;
      font-size: 12px;
      margin-top: 6px;
      font-weight: 500;
    }

    .message {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    .error-box {
      background: #fee;
      color: #e74c3c;
      border: 1px solid #fcc;
    }

    .success-box {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn-submit,
    .btn-cancel {
      width: 100%;
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-submit {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: #f7fafc;
      color: #2d3748;
      border: 2px solid #e2e8f0;
    }

    .btn-cancel:hover:not(:disabled) {
      background: #edf2f7;
      border-color: #cbd5e0;
    }

    .btn-cancel:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .update-profile-card {
        padding: 30px 20px;
      }

      .card-header h2 {
        font-size: 24px;
      }
    }
  `]
})
export class UpdateProfileComponent implements OnInit {
  user: any = {
    name: '',
    email: '',
    password: ''
  };

  errorMessage = '';
  successMessage = '';
  loading = false;
  showPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const currentUser = this.authService.getUser();
    this.user = {
      name: currentUser.name || '',
      email: currentUser.email || '',
      password: '' 
    };
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    const token = this.authService.getToken();
    
    if (!token) {
      this.errorMessage = 'Authentication token not found. Please login again.';
      this.loading = false;
      return;
    }

    const updateData: any = {
      name: this.user.name
    };

    if (this.user.password && this.user.password.trim() !== '') {
      updateData.password = this.user.password;
    }

    console.log(' Sending update request to: PUT /auth/profile');
    console.log('Update data:', updateData);

    this.authService.updateProfile(updateData).subscribe({
      next: (response) => {
        console.log('Profile updated successfully:', response);
        
   
        const updatedUser = {
          name: this.user.name,
          email: this.user.email
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.successMessage = 'Profile updated successfully!';
        this.loading = false;

       
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('Profile update error:', err);
        console.error('Error status:', err.status);
        console.error(' Error message:', err.error);
        
        if (err.status === 403) {
          this.errorMessage = 'Access denied. Please logout and login again.';
        } else if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else {
          this.errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
        }
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
