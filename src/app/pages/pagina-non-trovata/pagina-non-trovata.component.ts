import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UtenteService } from '../../services/utente.service';
import { Utente } from '../../model/utente';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowBarLeft } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-pagina-non-trovata',
  imports: [
    NgIcon
  ],
  providers:[provideIcons({
    bootstrapArrowBarLeft
  })],
  templateUrl: './pagina-non-trovata.component.html',
  styleUrl: './pagina-non-trovata.component.css'
})

export class PaginaNonTrovataComponent {

  public router = inject(Router);
  public authService = inject(AuthService);
  public utenteService = inject(UtenteService);

  public async gestisciRotte(): Promise<void> {
    const utenteDaVerificare = await this.getUtenteCorrenteAutenticato();

    if (utenteDaVerificare) {

      if (utenteDaVerificare?.ruolo === 'user') {
        this.tornaAllaDashboardUtente();
      } else {
        this.tornaAllaDashboardAmministratore();
      }

    } else {
      this.tornaAllaHome();
    }

  }

  private async getUtenteCorrenteAutenticato(): Promise<Utente | null> {
    const utenteCorrente = this.authService.getUtenteCorrente();
    let utenteCorrenteAutenticato = null;

    if (utenteCorrente) {
      utenteCorrenteAutenticato = await this.utenteService.getUtenteById(utenteCorrente.uid);
    }

    return utenteCorrenteAutenticato;
  }

  private tornaAllaHome(): void {
    this.router.navigate(['']);
  }

  private tornaAllaDashboardUtente(): void {
    this.router.navigate(['/user-dashboard']);
  }

  private tornaAllaDashboardAmministratore(): void {
    this.router.navigate(['/admin-dashboard']);
  }

}