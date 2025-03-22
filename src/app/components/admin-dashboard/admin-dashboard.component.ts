import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapDoorOpenFill, bootstrapFileEarmarkFill, bootstrapPeopleFill, bootstrapUpload } from '@ng-icons/bootstrap-icons';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { AdminAccountComponent } from '../admin-account/admin-account.component';
import { AdminBilingComponent } from '../admin-biling/admin-biling.component';

enum AdminView {
  ACCOUNT = 'account',
  BILLING = 'billing'
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    AdminAccountComponent,
    AdminBilingComponent
  ],
  providers: [
    provideIcons({
      bootstrapDoorOpenFill,
      bootstrapPeopleFill,
      bootstrapUpload,
      bootstrapFileEarmarkFill
    })
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})

export class AdminDashboardComponent implements OnInit {
  readonly adminViews = AdminView;
  readonly availableViews = Object.values(AdminView);

  public currentView: AdminView = AdminView.ACCOUNT;
  public currentUser: User | null = null;

  public constructor(private authService: AuthService, private router: Router) { }

  public get userDisplayName(): string {
    if (!this.currentUser?.name) return '';
    return this.currentUser.name.charAt(0).toUpperCase() + this.currentUser.name.substring(1);
  }

  public get userAvatar(): string {
    return this.currentUser?.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
  }

  public ngOnInit(): void {
    this.loadAdminData();
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public changeCurrentView(view: string): void {
    if (this.isValidView(view)) {
      this.currentView = view as AdminView;
    }
  }

  public isCurrentView(view: string): boolean {
    return this.currentView === view;
  }

  // private method

  private loadAdminData(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  private isValidView(view: string): boolean {
    return this.availableViews.includes(view as AdminView);
  }
}