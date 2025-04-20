import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AdminBillingComponent } from './admin-billing.component';
import { UtenteService } from '../../../services/utente.service';
import { TransazioneService } from '../../../services/transazione.service';
import { GeneratoreCSV } from '../../../util/generatore-csv';
import { Utente } from '../../../model/utente';
import { Transazione } from '../../../model/transazione';

describe('AdminBillingComponent', () => {
    let component: AdminBillingComponent;
    let fixture: ComponentFixture<AdminBillingComponent>;
    let utenteServiceSpy: jasmine.SpyObj<UtenteService>;
    let transazioneServiceSpy: jasmine.SpyObj<TransazioneService>;
    let generatoreCSVSpy: jasmine.SpyObj<GeneratoreCSV>;

    beforeEach(waitForAsync(() => {
        utenteServiceSpy = jasmine.createSpyObj('UtenteService', ['getUtenti', 'getUtenteById']);
        transazioneServiceSpy = jasmine.createSpyObj('TransazioneService', ['getTransazioniByUserId']);
        generatoreCSVSpy = jasmine.createSpyObj('GeneratoreCSV', ['generaFile', 'scaricaCSV']);

        TestBed.configureTestingModule({
            imports: [AdminBillingComponent],
            providers: [
                { provide: UtenteService, useValue: utenteServiceSpy },
                { provide: TransazioneService, useValue: transazioneServiceSpy },
                { provide: GeneratoreCSV, useValue: generatoreCSVSpy }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminBillingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('dovrebbe creare il componente', () => {
        expect(component).toBeTruthy();
    });

    it('dovrebbe caricare gli utenti all\'inizializzazione', async () => {
        const utenti: Utente[] = [
            { id: '1', email: 'test1@example.com', nome: 'Mario', cognome: 'Rossi', codiceFiscale: 'RSSMRA00A01H501X', citta: 'Roma', indirizzo: 'Via Roma 1', ruolo: 'user', fotoURL: '' },
            { id: '2', email: 'test2@example.com', nome: 'Luigi', cognome: 'Verdi', codiceFiscale: 'VRDLGI00B02G888Y', citta: 'Milano', indirizzo: 'Via Milano 2', ruolo: 'admin', fotoURL: '' },
            { id: '3', email: 'test3@example.com', nome: 'Anna', cognome: 'Bianchi', codiceFiscale: 'BNCANN00C03F205Z', citta: 'Napoli', indirizzo: 'Via Napoli 3', ruolo: 'user', fotoURL: '' }
        ];
        utenteServiceSpy.getUtenti.and.returnValue(Promise.resolve(utenti));

        await component.ngOnInit();

        expect(component.utentiFiltrati.length).toBe(2);
        expect(component.utentiFiltrati[0].ruolo).toBe('user');
        expect(component.utentiFiltrati[1].ruolo).toBe('user');
    });

    it('dovrebbe caricare i dettagli dell\'utente e le transazioni al momento della selezione', async () => {
        const utente: Utente = { id: '1', email: 'test1@example.com', nome: 'Mario', cognome: 'Rossi', codiceFiscale: 'RSSMRA00A01H501X', citta: 'Roma', indirizzo: 'Via Roma 1', ruolo: 'user', fotoURL: '' };
        const transazioni: Transazione[] = [
            { nomeProdotto: 'Prodotto 1', data: new Date(), prezzo: '10.00', categoria: 'gold', stato: 'completato', idUtente: '1' },
            { nomeProdotto: 'Prodotto 2', data: new Date(), prezzo: '20.00', categoria: 'silver', stato: 'annullato', idUtente: '1' }
        ];

        utenteServiceSpy.getUtenteById.and.returnValue(Promise.resolve(utente));
        transazioneServiceSpy.getTransazioniByUserId.and.returnValue(Promise.resolve(transazioni));

        await component.getUtenteSelezionato(utente.id!);

        expect(component.utenteSelezionato).toEqual(utente);
        expect(component.transazioniUtente).toEqual(transazioni);
    });

    it('dovrebbe gestire l\'errore durante il caricamento degli utenti', async () => {
        const errorMessage = 'Errore durante il caricamento degli utenti';
        utenteServiceSpy.getUtenti.and.returnValue(Promise.reject(errorMessage));
        spyOn(console, 'error');

        await component.ngOnInit();

        expect(console.error).toHaveBeenCalledWith('Errore nel caricamento utenti:', errorMessage);
    });

    it('dovrebbe gestire l\'errore durante il caricamento dei dettagli dell\'utente', async () => {
        const errorMessage = 'Errore durante il caricamento dei dati';
        utenteServiceSpy.getUtenteById.and.returnValue(Promise.reject(errorMessage));
        spyOn(console, 'error');

        await component.getUtenteSelezionato('1');

        expect(console.error).toHaveBeenCalledWith('Errore nel caricamento dei dati:', errorMessage);
    });

    it('dovrebbe generare e scaricare il file CSV', () => {
        const utente: Utente = { id: '1', email: 'test1@example.com', nome: 'Mario', cognome: 'Rossi', codiceFiscale: 'RSSMRA00A01H501X', citta: 'Roma', indirizzo: 'Via Roma 1', ruolo: 'user', fotoURL: '' };
        const transazioni: Transazione[] = [
            { nomeProdotto: 'Prodotto 1', data: new Date(), prezzo: '10.00', categoria: 'gold', stato: 'completato', idUtente: '1' },
            { nomeProdotto: 'Prodotto 2', data: new Date(), prezzo: '20.00', categoria: 'silver', stato: 'annullato', idUtente: '1' }
        ];
        const contenutoCSV = 'nome,cognome,prodotto,prezzo\nMario,Rossi,Prodotto 1,10.00\nMario,Rossi,Prodotto 2,20.00';
        spyOn(GeneratoreCSV, 'generaFile').and.returnValue(contenutoCSV);
        spyOn(GeneratoreCSV, 'scaricaCSV');

        component.esportaDatiUtente(utente, transazioni);

        expect(GeneratoreCSV.generaFile).toHaveBeenCalledWith(utente, transazioni);
        expect(GeneratoreCSV.scaricaCSV).toHaveBeenCalledWith(contenutoCSV, 'dati_Rossi_Mario.csv');
    });

    it('dovrebbe restituire le classi CSS corrette per lo stato della transazione', () => {
        expect(component.getStato('completato')).toBe('badge bg-success');
        expect(component.getStato('annullato')).toBe('badge bg-danger');
    });

    it('dovrebbe restituire le classi CSS corrette per la categoria della transazione', () => {
        expect(component.getCategoria('gold')).toBe('gold');
        expect(component.getCategoria('silver')).toBe('silver');
        expect(component.getCategoria('bronze')).toBe('bronze');
    });
});