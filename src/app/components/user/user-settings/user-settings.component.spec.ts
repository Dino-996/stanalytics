import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSettingsComponent } from './user-settings.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth.service';
import { TransazioneService } from '../../../services/transazione.service';
import { UtenteService } from '../../../services/utente.service';
import { Router } from '@angular/router';

describe('UserSettingsComponent', () => {
    let component: UserSettingsComponent;
    let fixture: ComponentFixture<UserSettingsComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let transazioneServiceSpy: jasmine.SpyObj<TransazioneService>;
    let utenteServiceSpy: jasmine.SpyObj<UtenteService>;
    let modalServiceSpy: jasmine.SpyObj<NgbModal>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const authServiceMock = jasmine.createSpyObj('AuthService', ['updateEmail', 'updatePassword', 'logout', 'getUtenteCorrente', 'deleteAccount']);
        const transazioneServiceMock = jasmine.createSpyObj('TransazioneService', ['cancellaTransazioni']);
        const utenteServiceMock = jasmine.createSpyObj('UtenteService', ['deleteUtente']);
        const modalServiceMock = jasmine.createSpyObj('NgbModal', ['open']);
        const routerMock = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, UserSettingsComponent],  // Aggiungi il componente come import
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: TransazioneService, useValue: transazioneServiceMock },
                { provide: UtenteService, useValue: utenteServiceMock },
                { provide: NgbModal, useValue: modalServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UserSettingsComponent);
        component = fixture.componentInstance;
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        transazioneServiceSpy = TestBed.inject(TransazioneService) as jasmine.SpyObj<TransazioneService>;
        utenteServiceSpy = TestBed.inject(UtenteService) as jasmine.SpyObj<UtenteService>;
        modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

        fixture.detectChanges();
    });

    it('dovrebbe creare il componente', () => {
        expect(component).toBeTruthy();
    });

    it('dovrebbe chiamare onAggiornaEmail() quando i modulo e\' inviato', async () => {
        component.formAggiornaAccount.setValue({
            passwordEmailCorrente: 'current-password',
            aggiornaEmail: 'new-email@example.com'
        });
        authServiceSpy.updateEmail.and.returnValue(Promise.resolve());
        spyOn(component, 'inviaMessaggio');

        await component.onAggiornaEmail();

        expect(authServiceSpy.updateEmail).toHaveBeenCalledWith('new-email@example.com', 'current-password');
        expect(component.inviaMessaggio).toHaveBeenCalledWith('Controlla la tua casella di posta per verificare l\'email.\nControlla anche nello spam!', 'success');
    });

    it('dovrebbe visualizzare un messaggio di errore se l\'aggiornamento dell\'e-mail non riesce', async () => {
        component.formAggiornaAccount.setValue({
            passwordEmailCorrente: 'wrong-password',
            aggiornaEmail: 'new-email@example.com'
        });
        authServiceSpy.updateEmail.and.returnValue(Promise.reject({ code: 'auth/invalid-credential' }));
        spyOn(component, 'inviaMessaggio');

        await component.onAggiornaEmail();

        expect(component.inviaMessaggio).toHaveBeenCalledWith('La password attuale non è corretta', 'warning', false);
    });

    it('dovrebbe chiamare onAggiornamentoPassword quando il modulo viene inviato', async () => {
        component.formAggiornaPassword.setValue({
            passwordCorrente: 'current-password',
            nuovaPassword: 'NewPassword123!'
        });
        authServiceSpy.updatePassword.and.returnValue(Promise.resolve());
        spyOn(component, 'inviaMessaggio');

        await component.onAggiornaPassword();

        expect(authServiceSpy.updatePassword).toHaveBeenCalledWith('current-password', 'NewPassword123!');
        expect(component.inviaMessaggio).toHaveBeenCalledWith('Password aggiornata correttamente!', 'success');
    });

    it('dovrebbe visualizzare un messaggio di errore se l\'aggiornamento della password non riesce', async () => {
        component.formAggiornaPassword.setValue({
            passwordCorrente: 'wrong-password',
            nuovaPassword: 'NewPassword123!'
        });
        authServiceSpy.updatePassword.and.returnValue(Promise.reject({ code: 'auth/invalid-credential' }));
        spyOn(component, 'inviaMessaggio');

        await component.onAggiornaPassword();

        expect(component.inviaMessaggio).toHaveBeenCalledWith('La password attuale non è corretta', 'warning', false);
    });

    it('dovrebbe avviare un conto alla rovescia quando si aggiorna la password', async () => {
        component.formAggiornaPassword.setValue({
            passwordCorrente: 'current-password',
            nuovaPassword: 'NewPassword123!'
        });
        authServiceSpy.updatePassword.and.returnValue(Promise.resolve());
        spyOn(component, 'contoAllaRovescia');

        await component.onAggiornaPassword();

        expect(component.contoAllaRovescia).toHaveBeenCalledWith(10, 1000);
    });

    it('dovrebbe aprire il modale e chiamare eliminaAccount', () => {
        const mockModal = jasmine.createSpyObj('NgbModal', ['open']);
        modalServiceSpy.open.and.returnValue(mockModal);
        const mockResult = Promise.resolve('confirm');
        spyOn(component, 'eliminaAccount');

        component.apriModale(mockModal);

        expect(modalServiceSpy.open).toHaveBeenCalled();
        expect(component.eliminaAccount).toHaveBeenCalled();
    });

    it('dovrebbe visualizzare un messaggio di successo quando l\'account viene eliminato', () => {
        spyOn(component, 'inviaMessaggio');
        spyOn(authServiceSpy, 'deleteAccount').and.returnValue(Promise.resolve());
        spyOn(transazioneServiceSpy, 'cancellaTransazioni').and.returnValue(Promise.resolve());
        spyOn(routerSpy, 'navigate');

        component.eliminaAccount('user-uid');

        expect(authServiceSpy.deleteAccount).toHaveBeenCalled();
        expect(transazioneServiceSpy.cancellaTransazioni).toHaveBeenCalledWith('user-uid');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('dovrebbe reimpostare il modulo dopo un aggiornamento e-mail riuscito', async () => {
        component.formAggiornaAccount.setValue({
            passwordEmailCorrente: 'current-password',
            aggiornaEmail: 'new-email@example.com'
        });
        authServiceSpy.updateEmail.and.returnValue(Promise.resolve());
        spyOn(component, 'resetForm');

        await component.onAggiornaEmail();

        expect(component.resetForm).toHaveBeenCalledWith(component.formAggiornaAccount);
    });

    it('dovrebbe reimpostare il modulo dopo un aggiornamento della password riuscito', async () => {
        component.formAggiornaPassword.setValue({
            passwordCorrente: 'current-password',
            nuovaPassword: 'NewPassword123!'
        });
        authServiceSpy.updatePassword.and.returnValue(Promise.resolve());
        spyOn(component, 'resetForm');

        await component.onAggiornaPassword();

        expect(component.resetForm).toHaveBeenCalledWith(component.formAggiornaPassword);
    });
});
