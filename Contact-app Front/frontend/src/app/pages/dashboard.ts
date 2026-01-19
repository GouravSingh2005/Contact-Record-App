import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ContactService, Contact } from '../services/contactservice';
import { AuthService } from '../services/authservice';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- LOGOUT CONFIRMATION MODAL -->
    <div class="modal-overlay" *ngIf="showLogoutModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        <h2 class="modal-title">Confirm Logout</h2>
        <p class="modal-message">Are you sure you want to logout from your account?</p>
        
        <div class="modal-actions">
          <button type="button" class="btn-cancel" (click)="closeModal()">
            Cancel
          </button>
          <button type="button" class="btn-confirm" (click)="confirmLogout()">
            Yes, Logout
          </button>
        </div>
      </div>
    </div>

    <div class="dashboard">

      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-content">
          <h5 class="sidebar-title"> My Profile</h5>

          <div class="profile-box">
            <div class="profile-icon">{{ user.name?.charAt(0)?.toUpperCase() || 'U' }}</div>
            <p class="profile-name">{{ user.name || 'User' }}</p>
            <p class="profile-email">{{ user.email }}</p>

            <button
              type="button"
              class="btn-profile"
              routerLink="/update-profile">
               Update Profile
            </button>

            <button
              type="button"
              class="btn-logout"
              (click)="onLogout()">
               Logout
            </button>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="content">
        <div class="content-header">
          <div>
            <h2 class="greeting">{{ greeting }}, {{ user.name || 'User' }} 👋</h2>
            <p class="subtitle">Manage your contacts effortlessly</p>
          </div>

          <button
            type="button"
            class="btn-add"
            routerLink="/add-contact">
             Add Contact
          </button>
        </div>

        <!-- LOADING -->
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading contacts...</p>
        </div>

        <!-- NO CONTACTS -->
        <div *ngIf="!loading && contacts.length === 0" class="empty-state">
          <div class="empty-icon"></div>
          <h3>No Contacts Yet</h3>
          <p>Start by adding your first contact</p>
          <button class="btn-add" routerLink="/add-contact">
            Add Your First Contact
          </button>
        </div>

        <!-- CONTACT LIST -->
        <div *ngIf="!loading && contacts.length > 0" class="contacts-section">
          <div class="section-header">
            <h3 class="section-title">Your Contacts ({{ contacts.length }})</h3>
            
            <div class="page-size-selector">
              <label>Show:</label>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="page-size-select">
                <option [value]="10">10</option>
                <option [value]="20">20</option>
                <option [value]="50">50</option>
              </select>
              <span>per page</span>
            </div>
          </div>

          <div class="pagination-info">
            Showing {{ getStartIndex() + 1 }} to {{ getEndIndex() }} of {{ contacts.length }} contacts
          </div>
          
          <div class="contacts-grid">
            <div
              class="contact-card"
              *ngFor="let c of paginatedContacts; trackBy: trackById">

              <div class="contact-avatar">{{ c.name?.charAt(0)?.toUpperCase() || 'C' }}</div>

              <div class="contact-info">
                <h6 class="contact-name">{{ c.name }}</h6>
                <p class="contact-email">
                  <a [href]="'mailto:' + c.email">📧 {{ c.email }}</a>
                </p>
                <p class="contact-phone">
                  <a [href]="'tel:' + c.phone">☎️ {{ c.phone }}</a>
                </p>
              </div>

              <div class="contact-actions">
                <button
                  type="button"
                  class="btn-edit"
                  (click)="editContact(c)"
                  title="Edit Contact">
                  Edit
                </button>

                <button
                  type="button"
                  class="btn-delete"
                  (click)="deleteContact(c.id!)"
                  title="Delete Contact">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- PAGINATION CONTROLS -->
          <div class="pagination" *ngIf="totalPages > 1">
            <button 
              class="page-btn" 
              [disabled]="currentPage === 1"
              (click)="goToPage(currentPage - 1)">
              ← Previous
            </button>

            <button 
              *ngFor="let page of getPageNumbers()"
              class="page-btn"
              [class.active]="page === currentPage"
              (click)="goToPage(page)">
              {{ page }}
            </button>

            <button 
              class="page-btn" 
              [disabled]="currentPage === totalPages"
              (click)="goToPage(currentPage + 1)">
              Next →
            </button>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .dashboard {
      display: flex;
      height: 100vh;
      background: #f5f7fa;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* SIDEBAR */
    .sidebar {
      width: 320px;
      background: white;
      padding: 30px 20px;
      border-right: 1px solid #e2e8f0;
      overflow-y: auto;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
    }

    .sidebar-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .sidebar-title {
      font-size: 18px;
      font-weight: 700;
      color: #2d3748;
    }

    .profile-box {
      background: #4a90e2;
      border-radius: 12px;
      padding: 25px;
      color: white;
      text-align: center;
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
    }

    .profile-icon {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      margin: 0 auto 15px;
      border: 2px solid rgba(255, 255, 255, 0.4);
    }

    .profile-name {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .profile-email {
      font-size: 12px;
      opacity: 0.95;
      margin-bottom: 20px;
      word-break: break-all;
    }

    .btn-profile {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.4);
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      font-size: 13px;
    }

    .btn-profile:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.6);
    }

    .btn-logout {
      background: rgba(231, 76, 60, 0.9);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.6);
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      font-size: 13px;
      margin-top: 10px;
    }

    .btn-logout:hover {
      background: rgba(192, 57, 43, 1);
      border-color: white;
    }

    /* MAIN CONTENT */
    .content {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
      background: #f5f7fa;
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .greeting {
      font-size: 32px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 14px;
      color: #718096;
    }

    .btn-add {
      background: #4a90e2;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
    }

    .btn-add:hover {
      background: #357abd;
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
    }

    .btn-add:active {
      transform: translateY(1px);
    }

    /* LOADING STATE */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      padding: 60px 20px;
      color: #718096;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e2e8f0;
      border-top: 4px solid #4a90e2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* EMPTY STATE */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      padding: 80px 20px;
      color: #718096;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #2d3748;
    }

    .empty-state p {
      font-size: 14px;
      margin-bottom: 20px;
    }

    /* CONTACTS SECTION */
    .contacts-section {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #64748b;
    }

    .page-size-select {
      padding: 6px 12px;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      background: white;
      color: #2d3748;
      transition: all 0.2s ease;
    }

    .page-size-select:hover {
      border-color: #4a90e2;
    }

    .page-size-select:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    .pagination-info {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .contacts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .contact-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .contact-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
      border-color: #cbd5e0;
    }

    .contact-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #4a90e2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .contact-info {
      flex: 1;
      min-width: 180px;
      overflow: hidden;
    }

    .contact-name {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .contact-email,
    .contact-phone {
      font-size: 13px;
      color: #718096;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .contact-email a,
    .contact-phone a {
      color: #4a90e2;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .contact-email a:hover,
    .contact-phone a:hover {
      color: #357abd;
      text-decoration: underline;
    }

    .contact-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
      margin-left: auto;
    }

    .btn-edit,
    .btn-delete {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-edit {
      background: #e8f4ff;
      color: #4a90e2;
    }

    .btn-edit:hover {
      background: #4a90e2;
      color: white;
    }

    .btn-delete {
      background: #fee;
      color: #e74c3c;
    }

    .btn-delete:hover {
      background: #e74c3c;
      color: white;
    }

    /* PAGINATION */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 40px;
      flex-wrap: wrap;
    }

    .page-btn {
      padding: 10px 16px;
      border: 1px solid #cbd5e0;
      background: white;
      color: #2d3748;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
      min-width: 44px;
    }

    .page-btn:hover:not(:disabled) {
      background: #4a90e2;
      color: white;
      border-color: #4a90e2;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
    }

    .page-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #4a90e2 100%);
      color: white;
      border-color: #4a90e2;
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: #f7fafc;
    }

    /* SCROLLBAR */
    .content::-webkit-scrollbar {
      width: 8px;
    }

    .content::-webkit-scrollbar-track {
      background: #f5f7fa;
    }

    .content::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 4px;
    }

    .content::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }

    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: #f7fafc;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }

    /* LOGOUT MODAL */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-icon {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
    }

    .modal-title {
      font-size: 26px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 12px;
    }

    .modal-message {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 32px;
      line-height: 1.6;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-cancel,
    .btn-confirm {
      padding: 12px 32px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 140px;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-cancel:hover {
      background: #e2e8f0;
      transform: translateY(-2px);
    }

    .btn-confirm {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-confirm:hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .dashboard {
        flex-direction: column;
        height: auto;
      }

      .sidebar {
        width: 100%;
        padding: 20px;
        border-right: none;
        border-bottom: 1px solid #e2e8f0;
      }

      .content {
        padding: 20px;
      }

      .greeting {
        font-size: 24px;
      }

      .content-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .contacts-grid {
        grid-template-columns: 1fr;
      }

      .contact-card {
        flex-wrap: wrap;
      }

      .modal-content {
        padding: 30px 20px;
      }

      .modal-actions {
        flex-direction: column;
      }

      .btn-cancel,
      .btn-confirm {
        width: 100%;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .pagination {
        gap: 6px;
      }

      .page-btn {
        padding: 8px 12px;
        font-size: 13px;
        min-width: 36px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {

  user: any = {};
  greeting = '';
  contacts: Contact[] = [];
  loading = true;
  showLogoutModal = false;

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  paginatedContacts: Contact[] = [];

  constructor(
    private router: Router,
    private contactService: ContactService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadUser();
    this.loadContacts();

    
    this.contactService.contactsChanged.subscribe(() => {
      console.log(' contactsChanged event received! Reloading contacts...');
      this.loadContacts();
    });
  }

  loadUser(): void {
    this.user = this.authService.getUser();
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good Morning';
    else if (hour < 17) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';
  }

  loadContacts(): void {
    this.loading = true;
    console.log(' Loading contacts...');

    this.contactService.getAll().subscribe({
      next: (data: Contact[]) => {
      
        this.contacts = data;
        this.updatePagination();
        this.loading = false;
        
        this.cdr.detectChanges();
        console.log(' Change detection triggered');
      },
      error: err => {
        console.error('❌ Error loading contacts:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.contacts.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedContacts = this.contacts.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, this.currentPage + 2);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.contacts.length);
  }

  deleteContact(id: number): void {
    this.contactService.delete(id).subscribe(() => {
      this.loadContacts();
    });
  }

  editContact(contact: Contact): void {
    this.router.navigate(
      ['/add-contact'],
      { state: { contact } }
    );
  }

  trackById(index: number, contact: Contact): number {
    return contact.id || index;
  }

  onLogout(): void {
    this.showLogoutModal = true;
  }

  closeModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log(' Logged out - token cleared');
    
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }
}
