import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbAlertModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { AdminAccountComponent } from './admin-account.component';
import { UtenteService } from '../../../services/utente.service';
import { TransazioneService } from '../../../services/transazione.service';
import { Utente } from '../../../model/utente';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapInfoCircleFill, bootstrapExclamationOctagonFill, bootstrapPeopleFill, bootstrapPersonFillAdd, bootstrapPersonFillGear, bootstrapCheckCircleFill } from '@ng-icons/bootstrap-icons';

describe('AdminAccountComponent', () => {
    let component: AdminAccountComponent;
    let fixture: ComponentFixture<AdminAccountComponent>;
    let utenteServiceSpy: jasmine.SpyObj<UtenteService>;
    let transazioneServiceSpy: jasmine.SpyObj<TransazioneService>;
    let modalServiceSpy: jasmine.SpyObj<NgbModal>;

    beforeEach(waitForAsync(() => {
        utenteServiceSpy = jasmine.createSpyObj('UtenteService', ['getUtenti', 'createUtente', 'updateUtente', 'deleteUtente']);
        transazioneServiceSpy = jasmine.createSpyObj('TransazioneService', ['cancellaTransazioni']);
        modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);

        TestBed.configureTestingModule({
            imports: [AdminAccountComponent, ReactiveFormsModule, NgbAlertModule, NgbPagination, NgIcon],
            providers: [
                { provide: UtenteService, useValue: utenteServiceSpy },
                { provide: TransazioneService, useValue: transazioneServiceSpy },
                { provide: NgbModal, useValue: modalServiceSpy },
                provideIcons({
                    bootstrapInfoCircleFill,
                    bootstrapExclamationOctagonFill,
                    bootstrapPeopleFill,
                    bootstrapPersonFillAdd,
                    bootstrapPersonFillGear,
                    bootstrapCheckCircleFill
                })
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminAccountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('dovrebbe creare il componente', () => {
        expect(component).toBeTruthy();
    });

    it('dovrebbe chiamare utenteService.createUtente() in una form valida', async () => {
        const utente: Utente = {
            email: 'test@example.com',
            nome: 'Test',
            cognome: 'User',
            codiceFiscale: 'ABCDEF12A12A123X',
            citta: 'Test City',
            indirizzo: 'Test Address',
            ruolo: 'user',
            fotoURL: ''
        };
        component.formUtente.setValue(utente);
        utenteServiceSpy.createUtente.and.returnValue(Promise.resolve('123'));

        await component.gestisciInvio();

        expect(utenteServiceSpy.createUtente).toHaveBeenCalledWith(utente);
    });

    it('dovrebbe caricare e filtrare gli utenti all\'inizializzazione', async () => {
        const utenti: Utente[] = [
            { id: '1', email: 'test1@example.com', nome: 'Mario', cognome: 'Rossi', codiceFiscale: 'RSSMRA00A01H501X', citta: 'Roma', indirizzo: 'Via Roma 1', ruolo: 'user' },
            { id: '2', email: 'test2@example.com', nome: 'Luigi', cognome: 'Verdi', codiceFiscale: 'VRDLGI00B02G888Y', citta: 'Milano', indirizzo: 'Via Milano 2', ruolo: 'admin' },
            { id: '3', email: 'test3@example.com', nome: 'Anna', cognome: 'Bianchi', codiceFiscale: 'BNCANN00C03F205Z', citta: 'Napoli', indirizzo: 'Via Napoli 3', ruolo: 'user' }
        ];
        utenteServiceSpy.getUtenti.and.returnValue(Promise.resolve(utenti));

        await component.ngOnInit();

        expect(component.utentiFiltrati.length).toBe(2);
        expect(component.utentiFiltrati[0].ruolo).toBe('user');
        expect(component.utentiFiltrati[1].ruolo).toBe('user');
    });

    it('dovrebbe chiamare utenteService.updateUtente in modalità modifica', async () => {
        const utente: Utente = {
            id: '1',
            email: 'test1@example.com',
            nome: 'Mario',
            cognome: 'Rossi',
            codiceFiscale: 'RSSMRA00A01H501X',
            citta: 'Roma',
            indirizzo: 'Via Roma 1',
            ruolo: 'user',
            fotoURL: ''
        };
        component.utenteSelezionato = utente;
        component.formUtente.setValue({
            email: utente.email,
            nome: utente.nome,
            cognome: utente.cognome,
            codiceFiscale: utente.codiceFiscale,
            citta: utente.citta,
            indirizzo: utente.indirizzo,
            ruolo: utente.ruolo,
            fotoURL: utente.fotoURL
        });
        utenteServiceSpy.updateUtente.and.returnValue(Promise.resolve());

        await component.gestisciInvio();

        if (utente.id) {
            expect(utenteServiceSpy.updateUtente).toHaveBeenCalledWith(utente.id, {
                email: utente.email,
                nome: utente.nome,
                cognome: utente.cognome,
                codiceFiscale: utente.codiceFiscale,
                citta: utente.citta,
                indirizzo: utente.indirizzo,
                ruolo: utente.ruolo,
                fotoURL: utente.fotoURL
            });
        }
    });

    it('dovrebbe chiamare transazioneService.cancellaTransazioni() e utenteService.deleteUtente() all\'eliminazione', async () => {
        const utente: Utente = { id: '1', email: 'test1@example.com', nome: 'Mario', cognome: 'Rossi', codiceFiscale: 'RSSMRA00A01H501X', citta: 'Roma', indirizzo: 'Via Roma 1', ruolo: 'user' };
        transazioneServiceSpy.cancellaTransazioni.and.returnValue(Promise.resolve());
        utenteServiceSpy.deleteUtente.and.returnValue(Promise.resolve());
        utenteServiceSpy.getUtenti.and.returnValue(Promise.resolve([]));

        if (utente.id) {
            await component.deleteUtente(utente.id);

            expect(transazioneServiceSpy.cancellaTransazioni).toHaveBeenCalledWith(utente.id);
            expect(utenteServiceSpy.deleteUtente).toHaveBeenCalledWith(utente.id);
        }
    });

    it('dovrebbe visualizzare il messaggio di notifica se non ci sono utenti', async () => {
        utenteServiceSpy.getUtenti.and.returnValue(Promise.resolve([]));

        await component.ngOnInit();

        expect(component.messaggio).toBe('Nessun utente trovato');
        expect(component.tipo).toBe('info');
        expect(component.isVisibile).toBe(true);
    });

    it('dovrebbe gestire l\'errore durante l\'eliminazione', async () => {
        const utente: Utente = { id: '1', email: 'test1@example.com', nome: 'Mario', cognome: 'Rossi', codiceFiscale: 'RSSMRA00A01H501X', citta: 'Roma', indirizzo: 'Via Roma 1', ruolo: 'user' };
        const errorMessage = 'Errore durante l\'eliminazione';
        transazioneServiceSpy.cancellaTransazioni.and.returnValue(Promise.reject(errorMessage));

        if (utente.id) {
            await component.deleteUtente(utente.id);
        }

        expect(component.messaggio).toBe('Errore durante l\'eliminazione: ' + errorMessage);
        expect(component.tipo).toBe('danger');
        expect(component.isVisibile).toBe(true);
    });

    it('dovrebbe impostare utenteSelezionato e compilare il form in modalità modifica', () => {
        const utente: Utente = { id: '1', email: 'test1@example.com', nome: 'Mario', cognome: 'Rossi', codiceFiscale: 'RSSMRA00A01H501X', citta: 'Roma', indirizzo: 'Via Roma 1', ruolo: 'user', fotoURL: '' };

        component.editUtente(utente);

        expect(component.utenteSelezionato).toEqual(utente);
        expect(component.formUtente.value).toEqual({
            email: utente.email,
            nome: utente.nome,
            cognome: utente.cognome,
            codiceFiscale: utente.codiceFiscale,
            citta: utente.citta,
            indirizzo: utente.indirizzo,
            ruolo: utente.ruolo,
            fotoURL: utente.fotoURL
        });
    });

    it('dovrebbe gestire l\'errore durante l\'aggiornamento dell\'utente', async () => {
        const utente: Utente = { id: '1', email: 'test1@example.com', nome: 'Mario', cognome: 'Rossi', codiceFiscale: 'RSSMRA00A01H501X', citta: 'Roma', indirizzo: 'Via Roma 1', ruolo: 'user', fotoURL: '' };
        const errorMessage = 'Errore durante l\'aggiornamento';
        utenteServiceSpy.updateUtente.and.returnValue(Promise.reject(errorMessage));
        component.utenteSelezionato = utente;
        component.formUtente.setValue({
            email: utente.email,
            nome: utente.nome,
            cognome: utente.cognome,
            codiceFiscale: utente.codiceFiscale,
            citta: utente.citta,
            indirizzo: utente.indirizzo,
            ruolo: utente.ruolo,
            fotoURL: utente.fotoURL
        });

        await component.gestisciInvio();

        expect(component.messaggio).toBe(errorMessage);
        expect(component.tipo).toBe('danger');
        expect(component.isVisibile).toBe(true);
    });

});