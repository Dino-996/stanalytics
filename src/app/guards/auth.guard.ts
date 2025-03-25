import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators'; // Importante: Aggiungi l'import di filter
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  /*
    public constructor(private authService: AuthService, private router: Router) { }
  
    public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
      await firstValueFrom(this.authService.isLoading$);
  
      const user = await firstValueFrom(this.authService.user$.pipe(filter(u => u !== null)));
  
      if (!user) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
      return true;
    }
      */

  public constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Aspetta che lo stato di caricamento sia completato
      await firstValueFrom(this.authService.isLoading$);

      // Ottieni l'utente corrente
      const user = await firstValueFrom(
        this.authService.user$.pipe(filter(u => u !== null))
      );

      // Se non c'è un utente, reindirizza ad access denied
      if (!user) {
        this.router.navigate(['/access-denied'], {
          queryParams: {
            returnUrl: state.url
          }
        });
        return false;
      }

      return true;
    } catch (error) {
      // In caso di errore, reindirizza ad access denied
      this.router.navigate(['/access-denied'], {
        queryParams: {
          returnUrl: state.url
        }
      });
      return false;
    }
  }
}