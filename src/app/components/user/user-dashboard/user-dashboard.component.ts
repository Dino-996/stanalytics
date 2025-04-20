import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Utente } from '../../../model/utente';
import { UtenteService } from '../../../services/utente.service';
import { Router } from '@angular/router';
import { UserConsultingHistoryComponent } from '../user-consulting-history/user-consulting-history.component';
import { UserConsultingPackageComponent } from '../user-consulting-package/user-consulting-package.component';
import { UserSettingsComponent } from '../user-settings/user-settings.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapBoxArrowInRight, bootstrapBoxes, bootstrapClockHistory, bootstrapGearWideConnected, bootstrapPersonFill } from '@ng-icons/bootstrap-icons';
import { UserInfoComponent } from '../user-info/user-info.component';

enum VisteUtente {
  INFO = 'info',
  CONSULTING_PACKAGE = 'package',
  CONSULTING_HISTORY = 'history',
  SETTINGS = 'settings'
}

@Component({
  selector: 'app-user-dashboard',
  imports: [NgIcon, UserConsultingHistoryComponent, UserConsultingHistoryComponent, UserConsultingPackageComponent, UserSettingsComponent, UserInfoComponent],
  providers: [provideIcons({ bootstrapBoxes, bootstrapClockHistory, bootstrapBoxArrowInRight, bootstrapGearWideConnected, bootstrapPersonFill })],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})

export class UserDashboardComponent implements OnInit {

  readonly visteUtente = VisteUtente;
  readonly visteDisponibili = Object.values(VisteUtente);

  public vistaCorrente: VisteUtente = VisteUtente.INFO;
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
