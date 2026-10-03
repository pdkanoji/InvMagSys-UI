import { Component, OnInit, inject, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { selectCurrentUser, selectUserRole } from '../../../store/auth/auth.selectors';
import { logout, loadUser } from '../../../store/auth/auth.actions';
import { loadPermissions } from '../../../store/permissions/permissions.actions';
import { selectPermissions } from '../../../store/permissions/permissions.selectors';
import { ApiService } from '../../../core/services/api.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatDividerModule, LoadingSpinnerComponent,
  ],
  template: `
    <div class="layout-container">

      <!-- ===== TOP BAR ===== -->
      <mat-toolbar class="top-bar">
        <button mat-icon-button class="hamburger-btn" *ngIf="isMobile" (click)="toggleSidenav()">
          <mat-icon>{{ sidenavOpen ? 'menu_open' : 'menu' }}</mat-icon>
        </button>

        <div class="topbar-logo" routerLink="/dashboard">
          <div class="topbar-logo__icon">
            <mat-icon>inventory_2</mat-icon>
          </div>
          <div class="topbar-logo__text">
            Inventory
            <span>Management</span>
          </div>
        </div>

        <div class="topbar-search">
          <mat-icon class="topbar-search__icon">search</mat-icon>
          <input class="topbar-search__input" placeholder="Search anything..." />
        </div>

        <span class="spacer"></span>

        <div class="topbar-actions">
          <div class="topbar-notif-badge">
            <button mat-icon-button class="topbar-icon-btn" (click)="checkStock()" title="Notifications">
              <mat-icon>notifications_none</mat-icon>
            </button>
            <span class="notif-dot"></span>
          </div>

          <button class="topbar-user" [matMenuTriggerFor]="userMenu">
            <div class="topbar-user__avatar">{{ initials$ | async }}</div>
            <div class="topbar-user__info">
              <span class="topbar-user__name">{{ (currentUser$ | async)?.first_name }} {{ (currentUser$ | async)?.last_name }}</span>
              <span class="topbar-user__role">{{ userRole$ | async }}</span>
            </div>
            <mat-icon style="font-size:16px;width:16px;height:16px;color:#9aa5b4;margin-left:4px;">keyboard_arrow_down</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              <strong>{{ (currentUser$ | async)?.first_name }} {{ (currentUser$ | async)?.last_name }}</strong>
              <span class="role-badge">{{ userRole$ | async }}</span>
            </div>
            <mat-divider></mat-divider>
            <a mat-menu-item routerLink="/profile"><mat-icon>person_outline</mat-icon> Profile</a>
            <button mat-menu-item (click)="onLogout()"><mat-icon>logout</mat-icon> Logout</button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- ===== BODY ===== -->
      <div class="main-wrapper">
        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav
            [opened]="sidenavOpen"
            [mode]="isMobile ? 'over' : 'side'"
            class="sidenav"
            [class.sidenav--open]="sidenavOpen && isMobile"
            (closedStart)="sidenavOpen = false"
          >
            <nav class="sidenav-nav">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                <mat-icon>grid_view</mat-icon><span>Dashboard</span>
              </a>

              <ng-container *ngIf="(perms$ | async) as perms">

                <div class="nav-section-title" *ngIf="perms['products']?.view || perms['categories']?.view">Products</div>
                <a *ngIf="perms['products']?.view" routerLink="/products" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>inventory_2</mat-icon><span>Products</span>
                </a>
                <a *ngIf="perms['categories']?.view" routerLink="/categories" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>category</mat-icon><span>Categories</span>
                </a>

                <div class="nav-section-title" *ngIf="perms['inventory']?.view || perms['purchases']?.view || perms['sales']?.view">Inventory</div>
                <a *ngIf="perms['inventory']?.view" routerLink="/inventory" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>layers</mat-icon><span>Stock</span>
                </a>
                <a *ngIf="perms['purchases']?.view" routerLink="/purchases" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>shopping_bag</mat-icon><span>Purchases</span>
                </a>
                <a *ngIf="perms['purchase_returns']?.view || perms['purchases']?.view" routerLink="/purchase-returns" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>keyboard_return</mat-icon><span>Purchase Returns</span>
                </a>
                <a *ngIf="perms['sales']?.view" routerLink="/sales" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>receipt_long</mat-icon><span>Sales</span>
                </a>
                <a *ngIf="perms['sale_returns']?.view || perms['sales']?.view" routerLink="/sale-returns" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>assignment_return</mat-icon><span>Sale Returns</span>
                </a>

                <div class="nav-section-title" *ngIf="perms['suppliers']?.view || perms['customers']?.view || perms['warehouses']?.view">Partners</div>
                <a *ngIf="perms['suppliers']?.view" routerLink="/suppliers" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>local_shipping</mat-icon><span>Suppliers</span>
                </a>
                <a *ngIf="perms['customers']?.view" routerLink="/customers" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>people_outline</mat-icon><span>Customers</span>
                </a>
                <a *ngIf="perms['warehouses']?.view" routerLink="/warehouses" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>warehouse</mat-icon><span>Warehouses</span>
                </a>

                <div class="nav-section-title" *ngIf="perms['reports']?.view || perms['users']?.view || perms['audit_logs']?.view || perms['notifications']?.view">System</div>
                <a *ngIf="perms['reports']?.view" routerLink="/reports" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>bar_chart</mat-icon><span>Reports</span>
                </a>
                <a *ngIf="(userRole$ | async) === 'super_admin' || (userRole$ | async) === 'admin'" routerLink="/roles" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>admin_panel_settings</mat-icon><span>Roles</span>
                </a>
                <a *ngIf="perms['users']?.view" routerLink="/users" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>manage_accounts</mat-icon><span>Users</span>
                </a>
                <a *ngIf="perms['audit_logs']?.view" routerLink="/audit-logs" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>history</mat-icon><span>Audit Logs</span>
                </a>
                <a *ngIf="perms['notifications']?.view" routerLink="/notifications" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
                  <mat-icon>notifications_none</mat-icon><span>Notifications</span>
                </a>

              </ng-container>
            </nav>
          </mat-sidenav>

          <mat-sidenav-content class="page-content">
            <router-outlet></router-outlet>
          </mat-sidenav-content>
        </mat-sidenav-container>
        <nav class="mobile-bottom-nav" *ngIf="isMobile" aria-label="Main navigation">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="mobile-bottom-nav__item">
            <mat-icon>grid_view</mat-icon><span>Home</span>
          </a>
          <a *ngIf="(perms$ | async)?.['products']?.view" routerLink="/products" routerLinkActive="active" class="mobile-bottom-nav__item">
            <mat-icon>inventory_2</mat-icon><span>Products</span>
          </a>
          <a *ngIf="(perms$ | async)?.['inventory']?.view" routerLink="/inventory" routerLinkActive="active" class="mobile-bottom-nav__item">
            <mat-icon>layers</mat-icon><span>Stock</span>
          </a>
          <a *ngIf="(perms$ | async)?.['sales']?.view" routerLink="/sales" routerLinkActive="active" class="mobile-bottom-nav__item">
            <mat-icon>receipt_long</mat-icon><span>Sales</span>
          </a>
          <button type="button" class="mobile-bottom-nav__item" (click)="toggleSidenav()" aria-label="Open all navigation">
            <mat-icon>apps</mat-icon><span>More</span>
          </button>
        </nav>
        <app-loading-spinner></app-loading-spinner>
      </div>
    </div>
  `,
})
export class LayoutComponent implements OnInit {
  sidenavOpen = true;
  isMobile = false;
  private store = inject(Store);
  private api = inject(ApiService);

  currentUser$ = this.store.select(selectCurrentUser);
  userRole$ = this.store.select(selectUserRole);
  perms$ = this.store.select(selectPermissions);
  initials$ = this.currentUser$.pipe(
    map(u => u ? `${(u.first_name || '')[0] || ''}${(u.last_name || '')[0] || ''}`.toUpperCase() : 'U'),
  );

  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth <= 960;
    if (mobile !== this.isMobile) {
      this.isMobile = mobile;
      this.sidenavOpen = !mobile;
    }
    this.updateHamburger();
  }

  ngOnInit(): void {
    this.store.dispatch(loadUser());
    this.store.dispatch(loadPermissions());
    this.isMobile = window.innerWidth <= 960;
    this.sidenavOpen = !this.isMobile;
    this.updateHamburger();
  }

  private updateHamburger(): void {
    const btn = document.querySelector<HTMLElement>('.hamburger-btn');
    if (btn) btn.style.display = this.isMobile ? 'flex' : 'none';
  }

  toggleSidenav(): void { this.sidenavOpen = !this.sidenavOpen; }
  closeSidenav(): void { this.sidenavOpen = false; }
  onNavClick(): void { if (this.isMobile) this.closeSidenav(); }
  onLogout(): void { this.store.dispatch(logout()); }
  checkStock(): void { this.api.post('notifications/check-stock', {}).subscribe(); }
}
