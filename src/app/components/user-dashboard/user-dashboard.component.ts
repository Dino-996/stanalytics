import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapBox2Fill, bootstrapClockHistory, bootstrapBoxArrowInRight, bootstrapPersonFill } from '@ng-icons/bootstrap-icons';
import { User } from '../../models/user.model';
import { UserConsultingPackageComponent } from '../user-consulting-package/user-consulting-package.component';
import { UserConsultingHistoryComponent } from '../user-consulting-history/user-consulting-history.component';

enum UserView {
  CONSULTING_PACKAGES = 'consulting packages',
  CONSULTING_HISTORY = 'consulting history'
}

@Component({
  selector: 'app-user-dashboard',
  imports: [
    NgIcon,
    UserConsultingPackageComponent,
    UserConsultingHistoryComponent
  ],
  providers: [provideIcons({
    bootstrapBoxArrowInRight,
    bootstrapPersonFill,
    bootstrapClockHistory,
    bootstrapBox2Fill
  })],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})

export class UserDashboardComponent implements OnInit {

  readonly userViews = UserView;
  readonly availableViews = Object.values(UserView);

  public currentView: UserView = UserView.CONSULTING_HISTORY;
  public currentUser: User | null = null;
  

  public constructor(private authService: AuthService, private router: Router) { }

  public get userDisplayName(): string {
    if (!this.currentUser?.name) {
      return ''
    };
    return this.currentUser.name.charAt(0).toUpperCase() + this.currentUser.name.substring(1);
  }

  public get userAvatar(): string {
    return this.currentUser?.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
  }

  public ngOnInit(): void {
    this.loadUserData();
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public changeCurrentView(view: string): void {
    if (this.isValidView(view)) {
      this.currentView = view as UserView;
    }
  }

  public isCurrentView(view: string): boolean {
    return this.currentView === view;
  }

  // Metodi privati
  private loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  private isValidView(view: string): boolean {
    return this.availableViews.includes(view as UserView);
  }

}
