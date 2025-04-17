import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UtenteService } from '../services/utente.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

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
      
      if (utente && utente.ruolo === 'user') {
        return true;
      } else if (utente && utente.ruolo === 'admin') {
        this.router.navigate(['/admin-dashboard']);
        return false;
      } else {
        this.router.navigate(['/login']);
        return false;
      }

    } catch (error) {
      console.error('Errore verifica ruolo utente:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}