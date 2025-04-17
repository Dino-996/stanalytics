import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UtenteService } from '../services/utente.service';
import { Utente } from '../model/utente';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  private authService = inject(AuthService);
  private utenteService = inject(UtenteService);
  private router = inject(Router);

  async canActivate(): Promise<boolean> {
    const currentUser = this.authService.getUtenteCorrente();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const utente = await this.utenteService.getUtenteById(currentUser.uid);
      
      if (utente && utente.ruolo === 'admin') {
        return true;
      } else {
        this.router.navigate(['/user-dashboard']);
        return false;
      }

    } catch (error) {
      console.error('Errore verifica ruolo admin:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
