import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbAlertModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Utente, Ruolo } from '../../../model/utente';
import { UtenteService } from '../../../services/utente.service';
import { TitleCasePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapInfoCircleFill, bootstrapExclamationOctagonFill, bootstrapPeopleFill, bootstrapPersonFillAdd, bootstrapPersonFillGear, bootstrapCheckCircleFill } from '@ng-icons/bootstrap-icons';
import { TransazioneService } from '../../../services/transazione.service';

// Tipo per i messaggi di notifica
type tipoDiMessaggio = 'success' | 'info' | 'warning' | 'danger' | 'primary' | 'secondary' | 'light' | 'dark';

/**
 * Componente per la gestione amministrativa degli utenti
 * Permette CRUD utenti con paginazione e modali di conferma
 */
@Component({
  selector: 'app-admin-account',
  imports: [
    ReactiveFormsModule,
    NgbAlertModule,
    NgbPagination,
    TitleCasePipe,
    NgIcon
  ],
  providers:[provideIcons({
    bootstrapInfoCircleFill,
    bootstrapExclamationOctagonFill,
    bootstrapPeopleFill,
    bootstrapPersonFillAdd,
    bootstrapPersonFillGear,
    bootstrapCheckCircleFill
  })],
  templateUrl: './admin-account.component.html',
  styleUrl: './admin-account.component.css'
})

export class AdminAccountComponent {

  // PROPRIETÀ
  /** Lista completa degli utenti */
  public utenti: Utente[] | null = null;

  /** Lista filtrata degli utenti (solo ruolo 'user') */
  public utentiFiltrati: Utente[] = [];

  /** FormGroup per la gestione del form utente */
  readonly formUtente: FormGroup;

  /** Utente attualmente selezionato per modifica/eliminazione */
  public utenteSelezionato: Utente | null = null;

  /** Lista dei ruoli disponibili */
  public ruoli: Ruolo[] = ['user', 'admin'];

  /** Servizio modale di ng-bootstrap */
  private modalService = inject(NgbModal);

  // PAGINAZIONE
  /** Pagina corrente */
  public paginaCorrente = 1;
  /** Elementi per pagina */
  public dimensionePagina = 1;
  /** Numero massimo di pagine visibili */
  public dimensioneMassima = 3;

  // NOTIFICHE
  /** Visibilità messaggio */
  public isVisibile: boolean = false;
  /** Testo del messaggio */
  public messaggio: string = '';
  /** Tipo di messaggio (stile) */
  public tipo: tipoDiMessaggio = 'primary';

  /**
   * Costruttore - Inizializza il form con validatori
   * @param fb Servizio per la creazione di form reattivi
   * @param utenteService Servizio per le operazioni CRUD sugli utenti
   */
  public constructor(private fb: FormBuilder, private utenteService: UtenteService, private transazioneService: TransazioneService) {
    this.formUtente = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      codiceFiscale: ['', [Validators.required, Validators.pattern(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/)]],
      citta: ['', Validators.required],
      indirizzo: ['', Validators.required],
      ruolo: ['user', Validators.required],
      fotoURL: ['']
    });
  }

  // GETTER PER ACCESSO AI CONTROLLI DEL FORM
  public get email() { return this.formUtente.get('email'); }
  public get nome() { return this.formUtente.get('nome'); }
  public get cognome() { return this.formUtente.get('cognome'); }
  public get codiceFiscale() { return this.formUtente.get('codiceFiscale'); }
  public get citta() { return this.formUtente.get('citta'); }
  public get indirizzo() { return this.formUtente.get('indirizzo'); }

  /**
   * Hook del ciclo di vita Angular - Carica gli utenti all'inizializzazione
   */
  public async ngOnInit(): Promise<void> {
    await this.caricaUtenti();
  }

  /**
   * Carica gli utenti dal servizio e applica filtro ruolo
   */
  private async caricaUtenti(): Promise<void> {
    try {
      this.utenti = await this.utenteService.getUtenti();
      this.utentiFiltrati = this.utenti.filter(utente => utente.ruolo === 'user');
      if(this.utentiFiltrati.length === 0) {
        this.inviaMessaggio('Nessun utente trovato', 'info', false);
      }
    } catch (error) {
      this.inviaMessaggio('Impossibile caricare utenti: ', 'danger');
    }
  }

  /**
   * Gestisce l'invio del form per creazione/modifica utente
   */
  public async gestisciInvio(): Promise<void> {
    if (this.formUtente.invalid) {
      this.inviaMessaggio('Form non valido', 'danger');
      return;
    }

    const datiUtente = this.formUtente.value;

    try {
      if (this.utenteSelezionato) {
        await this.utenteService.updateUtente(this.utenteSelezionato.id!, datiUtente);
        this.inviaMessaggio('Utente aggiornato con successo', 'success');
      } else {
        await this.utenteService.createUtente(datiUtente);
        this.inviaMessaggio('Utente creato con successo', 'success');
      }

      this.resetForm();
      await this.caricaUtenti();
    } catch (error) {
      this.inviaMessaggio(error+'', 'danger');
    }
  }

  /**
   * Prepara il form per la modifica di un utente
   * @param utente - Utente da modificare
   */
  public editUtente(utente: Utente): void {
    this.utenteSelezionato = utente;
    this.formUtente.patchValue({ ...utente, ruolo: utente.ruolo || 'user' });
  }

  /**
   * Apre la modale di conferma eliminazione
   * @param contenuto - Template della modale
   * @param utente - Utente da eliminare
   */
  public apriModaleEliminazione(contenuto: any, utente: Utente):void {
    this.utenteSelezionato = utente;
    this.modalService.open(contenuto, { ariaLabelledBy: 'modal-title', centered: true }).result.then(async (risultato) => {
      if (risultato === 'confirm') {
        await this.deleteUtente(utente.id!);
      }
    }).catch(() => (this.utenteSelezionato = null));
  }

  /**
   * Elimina un utente dal sistema
   * @param userId - ID dell'utente da eliminare
   */
  public async deleteUtente(idUtente: string): Promise<void> {
    try {
      await this.transazioneService.cancellaTransazioni(idUtente);
      await this.utenteService.deleteUtente(idUtente);
      await this.caricaUtenti();
      this.utenteSelezionato = null;
    } catch (error) {
      this.inviaMessaggio("Errore durante l'eliminazione: " + error, 'danger');
    }
  }

  /**
   * Resetta il form alla stato iniziale
   */
  public resetForm(): void {
    this.formUtente.reset({ ruolo: 'user' });
    this.utenteSelezionato = null;
  }

  /**
   * Restituisce la pagina corrente di utenti filtrati
   * @returns Sottoinsieme di utenti per la paginazione
   */
  public getPaginazioneUtentiFiltrati() {
    const indiceIniziale = (this.paginaCorrente - 1) * this.dimensionePagina;
    return this.utentiFiltrati.slice(indiceIniziale, indiceIniziale + this.dimensionePagina);
  }

  /**
   * Determina se siamo in modalità modifica
   * @returns True se è selezionato un utente da modificare
   */
  public get isEditMode(): boolean {
    return !!this.utenteSelezionato;
  }

  /**
   * Mostra un messaggio temporaneo
   * @param messaggio - Testo da visualizzare
   * @param tipo - Stile del messaggio
   */
  private inviaMessaggio(messaggio: string, tipo: tipoDiMessaggio, timer:boolean = true): void {
    this.tipo = tipo;
    this.isVisibile = true;
    this.messaggio = messaggio;
    if(timer) {
      setTimeout(() => {
        this.isVisibile = false;
        this.messaggio = '';
      }, 5000)
    }
  }
}