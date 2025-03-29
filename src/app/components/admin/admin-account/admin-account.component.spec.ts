import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdminAccountComponent } from './admin-account.component';
import { UtenteService } from '../../../services/utente.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule, NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { TitleCasePipe } from '@angular/common';
import { Utente } from '../../../model/utente';

describe('AdminAccountComponent', () => {
    let component: AdminAccountComponent;
    let fixture: ComponentFixture<AdminAccountComponent>;
    let utenteServiceSpy: jasmine.SpyObj<UtenteService>;
    let modalService: NgbModal;

    const mockUtenti: Utente[] = [
        new Utente('test1@email.com', 'Mario', 'Rossi', 'RSSMRA80A01H501A', 'Roma', 'Via Roma 1', 'user', '1'),
        new Utente('test2@email.com', 'Luigi', 'Verdi', 'VRDLGU81B02H502B', 'Milano', 'Via Milano 2', 'admin', '2')
    ];

    beforeEach(async () => {
        utenteServiceSpy = jasmine.createSpyObj('UtenteService', [
            'getUtenti', 'createUtente', 'updateUtente', 'deleteUtente'
        ]);

        await TestBed.configureTestingModule({
            imports: [
                AdminAccountComponent,
                ReactiveFormsModule,
                NgbAlertModule,
                NgbPagination,
                TitleCasePipe
            ],
            providers: [
                { provide: UtenteService, useValue: utenteServiceSpy },
                NgbModal
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminAccountComponent);
        component = fixture.componentInstance;
        modalService = TestBed.inject(NgbModal);
        utenteServiceSpy.getUtenti.and.returnValue(Promise.resolve(mockUtenti));

        fixture.detectChanges();
    });

    it('dovrebbe creare il componente', () => {
        expect(component).toBeTruthy();
    });

    it('dovrebbe inizializzare il form correttamente', () => {
        expect(component.formUtente).toBeDefined();
        expect(component.formUtente.controls['nome'].value).toBe('');
        expect(component.formUtente.controls['ruolo'].value).toBe('user');
    });

    it('dovrebbe caricare gli utenti all\'inizializzazione', fakeAsync(() => {
        const mockUtentiFiltrati = mockUtenti.filter(utenti => utenti.ruolo = 'user');
        utenteServiceSpy.getUtenti.and.returnValue(Promise.resolve(mockUtenti));

        component.ngOnInit();
        tick();
        fixture.detectChanges();

        expect(component.utentiFiltrati.length).withContext('Dovrebbe avere utenti filtrati').toBe(mockUtentiFiltrati.length);
        expect(component.utentiFiltrati).withContext('Dovrebbe filtrare solo gli user').toEqual(mockUtentiFiltrati);
        expect(utenteServiceSpy.getUtenti).withContext('Dovrebbe chiamare il servizio').toHaveBeenCalled();
    }));

    it('dovrebbe gestire errori durante il salvataggio', fakeAsync(() => {
        utenteServiceSpy.createUtente.and.returnValue(Promise.reject('Errore'));

        component.formUtente.patchValue(mockUtenti[0]);
        component.gestisciInvio();
        tick();

        expect(component.messaggio).toContain('Errore');
        expect(component.tipo).toBe('danger');
    }));

    it('dovrebbe resettare il form correttamente', () => {
        component.utenteSelezionato = mockUtenti[0];
        component.resetForm();

        expect(component.utenteSelezionato).toBeNull();
        expect(component.formUtente.controls['nome'].value).toBeNull();
        expect(component.formUtente.controls['ruolo'].value).toBe('user');
    });

    it('dovrebbe gestire la paginazione correttamente', () => {
        component.utentiFiltrati = mockUtenti;
        component.pageSize = 1;

        expect(component.getPaginazioneUtentiFiltrati().length).toBe(1);
        component.page = 2;
        expect(component.getPaginazioneUtentiFiltrati().length).toBe(1);
    });



    it('dovrebbe gestire l\'eliminazione di un utente', fakeAsync(() => {
        utenteServiceSpy.deleteUtente.and.returnValue(Promise.resolve());
        component.deleteUtente('1');
        tick();

        expect(utenteServiceSpy.deleteUtente).toHaveBeenCalledWith('1');
        expect(component.utenteSelezionato).toBeNull();
    }));

    it('dovrebbe validare i campi obbligatori', () => {
        const cfControl = component.formUtente.controls['codiceFiscale'];
        cfControl.setValue('CODICEFISCALEINVALIDO');

        expect(cfControl.hasError('pattern')).toBeTrue();
        expect(component.formUtente.invalid).toBeTrue();
    });

    it('dovrebbe mostrare messaggi di errore per campi obbligatori', () => {
        const nomeControl = component.formUtente.controls['nome'];
        nomeControl.markAsTouched();
        nomeControl.setValue('');
        fixture.detectChanges();

        const errorMessage = fixture.nativeElement.querySelector('.text-warning');
        expect(errorMessage.textContent).toContain('Inserisci un nome');
    });
});