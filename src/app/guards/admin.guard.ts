import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class AdminGuard implements CanActivate {

  public constructor(private authService: AuthService, private router: Router) { }

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {

    await firstValueFrom(this.authService.isLoading$);
    const isAdmin = await firstValueFrom(this.authService.user$.pipe(
      filter(user => user !== null && user.role === 'admin')
    ));

    if (!isAdmin) {
      await this.authService.logout();
      this.router.navigate(['/access-denied']);
      return false;
    }

    return true;
  }
}