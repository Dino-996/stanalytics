import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapDoorOpenFill, bootstrapFileEarmarkFill, bootstrapPeopleFill, bootstrapUpload } from '@ng-icons/bootstrap-icons';
import { Router } from '@angular/router';
import { AdminAccountComponent } from '../admin-account/admin-account.component';
import { AdminBilingComponent } from '../admin-biling/admin-biling.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    NgIcon,
    AdminAccountComponent,
    AdminBilingComponent
  ],
  providers: [provideIcons({
    bootstrapDoorOpenFill,
    bootstrapPeopleFill,
    bootstrapUpload,
    bootstrapFileEarmarkFill
  })],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})

export class AdminDashboardComponent implements OnInit {

  readonly choice: string[] = ['account', 'billing'];
  public currentView = 'account';
  public currentUser: User | null = null;

  public constructor(private authService: AuthService, private router: Router) { }

  public ngOnInit(): void {
    this.loadAdminData();
  }

  private loadAdminData(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  public logout() {
    this.authService.logout();
  }

  public changeCurrentView(type: string) {
    if (this.choice.includes(type)) {
      this.currentView = type;
    }
    return this.currentView;
  }

}