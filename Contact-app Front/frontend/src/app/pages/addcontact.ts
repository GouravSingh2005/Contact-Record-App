import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ContactService, Contact } from '../services/contactservice';

@Component({
  selector: 'app-add-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  template: `
    <div class="form-container">
      <div class="form-card">

        <div class="form-header">
          <h2>{{ editId ? 'Update Contact' : ' Add New Contact' }}</h2>
          <p class="form-subtitle">{{ editId ? 'Update contact information' : 'Create a new contact' }}</p>
        </div>

        <!-- ERROR ALERT -->
        <div *ngIf="errorMessage" class="alert alert-error">
          <span class="alert-icon">❌</span>
          <div>
            <strong>Error</strong>
            <p>{{ errorMessage }}</p>
          </div>
        </div>

        <!-- SUCCESS ALERT -->
        <div *ngIf="successMessage" class="alert alert-success">
          <span class="alert-icon">✅</span>
          <div>
            <strong>Success</strong>
            <p>{{ successMessage }}</p>
          </div>
        </div>

        <form class="form-content">

          <!-- NAME FIELD -->
          <div class="form-group">
            <label>Name *</label>
            <input
              type="text"
              class="form-input"
              [class.error]="submitted && !contact.name"
              placeholder="Enter full name"
              [(ngModel)]="contact.name"
              name="name">
            <span class="error-text" *ngIf="submitted && !contact.name">
              Name is required
            </span>
          </div>

          <!-- EMAIL FIELD -->
          <div class="form-group">
            <label>Email *</label>
            <input
              type="email"
              class="form-input"
              [class.error]="submitted && (!contact.email || !isValidEmail(contact.email))"
              placeholder="Enter email address"
              [(ngModel)]="contact.email"
              name="email">
            <span class="error-text" *ngIf="submitted && !contact.email">
              Email is required
            </span>
            <span class="error-text" *ngIf="submitted && contact.email && !isValidEmail(contact.email)">
              Please enter a valid email
            </span>
          </div>

          <!-- PHONE FIELD -->
          <div class="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              class="form-input"
              [class.error]="submitted && (!contact.phone || !isValidPhone(contact.phone))"
              placeholder="Enter phone number"
              [(ngModel)]="contact.phone"
              name="phone">
            <span class="error-text" *ngIf="submitted && !contact.phone">
              Phone number is required
            </span>
            <span class="error-text" *ngIf="submitted && contact.phone && !isValidPhone(contact.phone)">
              Phone number must be at least 10 digits
            </span>
          </div>

          <!-- FORM ACTIONS -->
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-primary"
              (click)="saveContact()"
              [disabled]="loading">
              {{ loading ? 'Saving...' : (editId ? ' Update' : 'Save') }}
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              routerLink="/dashboard"
              [disabled]="loading">
              ← Cancel
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

    .form-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .form-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 500px;
    }

    .form-header {
      margin-bottom: 30px;
      text-align: center;
    }

    .form-header h2 {
      font-size: 28px;
      font-weight: 800;
      color: #2d3748;
      margin-bottom: 8px;
    }

    .form-subtitle {
      font-size: 14px;
      color: #718096;
    }

    /* ALERTS */
    .alert {
      padding: 16px;
      border-radius: 10px;
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .alert-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .alert-success {
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #15803d;
    }

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      color: #991b1b;
    }

    .alert strong {
      display: block;
      margin-bottom: 4px;
      font-weight: 700;
    }

    .alert p {
      font-size: 13px;
      margin: 0;
    }

    /* FORM CONTENT */
    .form-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: #2d3748;
      font-size: 14px;
    }

    .form-input {
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      background: #f8faff;
    }

    .form-input.error {
      border-color: #f56565;
      background: #fff5f5;
    }

    .form-input.error:focus {
      box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
    }

    .error-text {
      font-size: 12px;
      color: #f56565;
      font-weight: 500;
    }

    /* FORM ACTIONS */
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    .btn {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #edf2f7;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* RESPONSIVE */
    @media (max-width: 640px) {
      .form-card {
        padding: 24px;
      }

      .form-header h2 {
        font-size: 22px;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class AddContactComponent implements OnInit {

  contact: Contact = {
    name: '',
    email: '',
    phone: ''
  };

  editId: number | null = null;
  submitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    const data = history.state;

  
    if (data && data.contact) {
      this.contact = { ...data.contact };
      this.editId = data.contact.id;
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9\-\+\(\)\s]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  saveContact(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.contact.name) {
      this.errorMessage = 'Please enter a name';
      return;
    }

    if (!this.contact.email || !this.isValidEmail(this.contact.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (!this.contact.phone || !this.isValidPhone(this.contact.phone)) {
      this.errorMessage = 'Please enter a valid phone number (at least 10 digits)';
      return;
    }

    this.loading = true;

    
    if (this.editId) {
      console.log(' Updating contact:', this.contact);
      this.contactService.update(this.editId, this.contact)
        .subscribe({
          next: () => {
            console.log(' Contact updated, emitting contactsChanged');
            this.successMessage = 'Contact updated successfully!';
            this.contactService.contactsChanged.next();
            setTimeout(() => this.router.navigate(['/dashboard']), 1500);
          },
          error: (err: any) => {
            console.error(' Update failed', err);
            this.loading = false;
            this.errorMessage = err.error?.message || 'Failed to update contact. Please try again.';
          }
        });

  
    } else {
      console.log('➕ Adding new contact:', this.contact);
      this.contactService.add(this.contact)
        .subscribe({
          next: () => {
            console.log('Contact added, emitting contactsChanged');
            this.successMessage = 'Contact added successfully!';
            this.contactService.contactsChanged.next();
            setTimeout(() => this.router.navigate(['/dashboard']), 1500);
          },
          error: (err: any) => {
            console.error(' Add failed', err);
            this.loading = false;
            this.errorMessage = err.error?.message || 'Failed to add contact. Please try again.';
          }
        });
    }
  }
}

