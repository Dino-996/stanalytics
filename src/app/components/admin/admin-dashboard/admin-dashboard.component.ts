import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Utente } from '../../../model/utente';
import { Router } from '@angular/router';
import { UtenteService } from '../../../services/utente.service';
import { AdminBillingComponent } from '../admin-billing/admin-billing.component';
import { AdminAccountComponent } from '../admin-account/admin-account.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapBoxArrowInRight, bootstrapFileEarmarkFill, bootstrapPeopleFill } from '@ng-icons/bootstrap-icons';

/** Enumerazione per le viste disponibili dell'utente */
enum VisteUtente {
  ACCOUNT = 'account',
  BILLING = 'billing'
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [NgIcon, AdminAccountComponent, AdminBillingComponent],
  providers: [provideIcons({ bootstrapPeopleFill, bootstrapFileEarmarkFill, bootstrapBoxArrowInRight })],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  
  readonly visteUtente = VisteUtente;
  readonly visteDisponibili = Object.values(VisteUtente);

  public vistaCorrente: VisteUtente = VisteUtente.ACCOUNT;
  public utenteCorrente: Utente | null = null;

  public loading: boolean = true;

  public constructor(private authService: AuthService, private utenteService: UtenteService, private router: Router) { }

  public ngOnInit(): void {
    this.caricaUtenti();
  }

  public async logout(): Promise<void> {
    await this.authService.logout();
  }

  public cambiaVistaCorrente(vista: VisteUtente): void {
    if (this.isVistaValida(vista)) {
      this.vistaCorrente = vista;
    }
  }

  public isVistaValida(vista: VisteUtente): boolean {
    return this.visteDisponibili.includes(vista);
  }

  public isVistaCorrente(vista: VisteUtente): boolean {
    return this.vistaCorrente === vista;
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
}
