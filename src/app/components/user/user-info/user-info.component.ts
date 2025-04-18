import { Component, inject, OnInit } from '@angular/core';
import { bootstrapPersonFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../../services/auth.service';
import { UtenteService } from '../../../services/utente.service';
import { Utente } from '../../../model/utente';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  imports: [NgIcon],
  providers: [provideIcons({ bootstrapPersonFill })],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})

export class UserInfoComponent implements OnInit {

  public utenteCorrente: Utente | null = null;

  public loading: boolean = false;

  private authService = inject(AuthService);
  private utenteService = inject(UtenteService);
  private router = inject(Router);

  public async ngOnInit(): Promise<void> {
    await this.caricaUtenti();
  }

  private async caricaUtenti(): Promise<void> {
    try {
      const utente = this.authService.getUtenteCorrente();
      if (utente) {
        this.utenteCorrente = await this.utenteService.getUtenteById(utente.uid);
        this.loading = false;
      } else {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Errore nel caricamento utente:', error);
      this.loading = false;
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  public logout() {
    this.authService.logout();
  }

}
