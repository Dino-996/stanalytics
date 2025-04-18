import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Stato, Transazione } from '../../../model/transazione';
import { Utente } from '../../../model/utente';
import { TransazioneService } from '../../../services/transazione.service';
import { UtenteService } from '../../../services/utente.service';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { bootstrapCurrencyEuro, bootstrapFileEarmarkFill, bootstrapPersonCheckFill, bootstrapPersonFill, bootstrapSearch, bootstrapInfoCircleFill, bootstrapFiletypeCsv } from '@ng-icons/bootstrap-icons';
import { GeneratoreCSV } from '../../../util/generatore-csv';
import { saliSopra } from '../../../util/utilita';

/**
 * Componente per la gestione amministrativa delle transazioni
 */
@Component({
  selector: 'app-admin-billing',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    NgbPagination,
    NgClass,
    NgIcon,
  ],
  providers: [
    provideIcons({
      bootstrapFileEarmarkFill,
      bootstrapPersonCheckFill,
      bootstrapPersonFill,
      bootstrapSearch,
      bootstrapCurrencyEuro,
      bootstrapInfoCircleFill,
      bootstrapFiletypeCsv
    })
  ],
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.css']
})
export class AdminBillingComponent {

  /** Pagina corrente per la lista utenti */
  paginaUtenteCorrente = 1;
  /** Numero di utenti per pagina */
  dimensionePaginaUtenti = 3;
  /** Numero massimo di pagine visualizzabili per gli utenti */
  dimensioneMassimaUtenti = 5;

  /** Pagina corrente per la lista transazioni */
  paginaTransazioneCorrente = 1;
  /** Numero di transazioni per pagina */
  dimensionePaginaTransazioni = 3;
  /** Numero massimo di pagine visualizzabili per le transazioni */
  dimensioneMassimaTransazioni = 5;

  /** Lista completa degli utenti */
  private utenti: Utente[] = [];
  /** Utenti filtrati per visualizzazione */
  public utentiFiltrati: Utente[] = [];
  /** Utente attualmente selezionato */
  public utenteSelezionato: Utente | null = null;
  /** Transazioni dell'utente selezionato */
  public transazioniUtente: Transazione[] = [];

  /** Servizio per la gestione degli utenti */
  public utenteService: UtenteService = inject(UtenteService);
  /**Servizio per la gestione delle transazioni */
  public transazioneService: TransazioneService = inject(TransazioneService);

  /**
   * Hook di inizializzazione del componente
   * Carica la lista degli utenti all'avvio
   */
  public async ngOnInit(): Promise<void> {
    await this.caricaUtenti();
    saliSopra();
  }

  /**
   * Carica tutti gli utenti dal servizio e applica filtro base
   */
  private async caricaUtenti(): Promise<void> {
    try {
      this.utenti = await this.utenteService.getUtenti();
      this.utentiFiltrati = this.utenti.filter(utente => utente.ruolo === 'user');
    } catch (error) {
      console.error('Errore nel caricamento utenti:', error);
    }
  }

  /**
   * Carica i dettagli di un utente e le relative transazioni
   * @param userId ID dell'utente da caricare
   */
  public async getUtenteSelezionato(userId: string): Promise<void> {
    try {
      this.utenteSelezionato = await this.utenteService.getUtenteById(userId);
      this.transazioniUtente = await this.transazioneService.getTransazioniByUserId(userId);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    }
  }

  /**
   * Restituisce la pagina corrente di utenti
   * @returns Sottoinsieme di utenti per la paginazione
   */
  public getPaginazioneUtente(): Utente[] {
    const indiceIniziale = (this.paginaUtenteCorrente - 1) * this.dimensionePaginaUtenti;
    return this.utentiFiltrati.slice(indiceIniziale, indiceIniziale + this.dimensionePaginaUtenti);
  }

  /**
   * Restituisce la pagina corrente di transazioni
   * @returns Sottoinsieme di transazioni per la paginazione
   */
  public getPaginazioneTransazione(): Transazione[] {
    const indiceIniziale = (this.paginaTransazioneCorrente - 1) * this.dimensionePaginaTransazioni;
    return this.transazioniUtente.slice(indiceIniziale, indiceIniziale + this.dimensionePaginaTransazioni);
  }

  /**
   * Restituisce le classi CSS per lo stato della transazione
   * @param stato Stato della transazione
   * @returns Classe CSS corrispondente
   */
  public getStato(stato: Stato): string {
    return stato === 'completato' ? 'badge bg-success' : 'badge bg-danger';
  }

  /**
   * Restituisce le classi CSS per la categoria della transazione
   * @param categoria Categoria della transazione
   * @returns Classe CSS corrispondente
   */
  public getCategoria(categoria: string): string {
    switch (categoria) {
      case ('silver'):
        return 'silver';
      case ('gold'):
        return 'gold';
      default:
        return 'bronze';
    }
  }

  /** 
   * Permette di scaricare i dati dell'utente
   * e delle transazioni in un file CSV
   * @param utente Utente attualmente selezionato
   * @param transazioni Transazioni dell'utente selezionato
   */
  public esportaDatiUtente(utente: Utente, transazioni: Transazione[]) {
    const contenutoCSV = GeneratoreCSV.generaFile(utente, transazioni);
    const nomeFile = `dati_${utente.cognome}_${utente.nome}.csv`;
    GeneratoreCSV.scaricaCSV(contenutoCSV, nomeFile);
  }

}