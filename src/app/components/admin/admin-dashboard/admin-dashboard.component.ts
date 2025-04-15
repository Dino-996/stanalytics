import { Component } from '@angular/core';
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

/**
 * Componente per la dashbord dell'amministratore
 */
@Component({
  selector: 'app-admin-dashboard',
  imports: [NgIcon, AdminAccountComponent, AdminBillingComponent],
  providers:[provideIcons({bootstrapPeopleFill, bootstrapFileEarmarkFill, bootstrapBoxArrowInRight})],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {

  /** Enum delle viste disponibili per l'utente */
  readonly visteUtente = VisteUtente;
  /** Viste disponibili visibili all'utente */
  readonly visteDisponibili = Object.values(VisteUtente);
  /** Vista attualmente visibile sulla dashbord */
  public vistaCorrente: VisteUtente = VisteUtente.ACCOUNT;
  /** Utente attualmente autenticato o selzionato */
  public utenteCorrente: Utente | null = null;
  /** Componente che indica una fase di caricamento */
  public loading: boolean = true;

  public constructor(private authService: AuthService, private utenteService: UtenteService, private router: Router) { }

  /**
   * Hook di inizializzazione del componente
   * Carica l'utente corrente 
   */
  public ngOnInit(): void {
    this.caricaUtenti();
  }

  /** L'utente corrente o autentico 
   * esce dalla sessione di lavoro 
  */
  public async logout(): Promise<void> {
    await this.authService.logout();
  }

  /**
   * Cambia la vista attualmente selezionata 
   * nella dashbord
   * @param vista Vista selezionata dall'utente
   */
  public cambiaVistaCorrente(vista: VisteUtente): void {
    if (this.isVistaValida(vista)) {
      this.vistaCorrente = vista;
    }
  }

  /**
   * Verifica se la vista selezionata è 
   * disponibile e valida per l'utente
   * @param vista Vista selezionata dall'utente
   * @returns true se la vista selezionata è compresa nelle viste dispobili
   */
  public isVistaValida(vista: VisteUtente): boolean {
    return this.visteDisponibili.includes(vista);
  }

  /**
   * Verfica se la vista selezionata dall'utente è
   * la vista corrente attiva
   * @param vista Vista selezionata dall'utente
   * @returns true se la vista selezionata è la stessa della vista corrente
   */
  public isVistaCorrente(vista: VisteUtente): boolean {
    return this.vistaCorrente === vista;
  }

  /**
   * Carica l'utente autenticato 
   * Se utente esistente completa caricamento
   * Se inesistente effettua logout e reinderizza 
   * alla pagina di login
   */
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
