import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ 
  providedIn: 'root' 
})
export class AuthGuard implements CanActivate {

  private authService = inject(AuthService);
  private router = inject(Router);

  public canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

}
