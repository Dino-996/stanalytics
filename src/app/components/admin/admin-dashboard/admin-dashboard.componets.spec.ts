import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { UtenteService } from '../../../services/utente.service';
import { Router } from '@angular/router';
import { Utente } from '../../../model/utente';
import { IdTokenResult } from 'firebase/auth';

const mockRouter = {
    navigate: jasmine.createSpy('navigate')
};

const mockUtente: Utente = new Utente(
    'test@example.com',
    'Mario',
    'Rossi',
    'RSSMRA80A01H501Z',
    'Roma',
    'Via Roma 1',
    'admin',
    '123',
    'http://example.com/avatar.png'
);

describe('AdminDashboardComponent', () => {
    let component: AdminDashboardComponent;
    let fixture: ComponentFixture<AdminDashboardComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let utenteServiceSpy: jasmine.SpyObj<UtenteService>;

    beforeEach(async () => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getUtenteCorrente', 'logout']);
        utenteServiceSpy = jasmine.createSpyObj('UtenteService', ['getUtenteById']);

        await TestBed.configureTestingModule({
            imports: [AdminDashboardComponent],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: UtenteService, useValue: utenteServiceSpy },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminDashboardComponent);
        component = fixture.componentInstance;
    });

    it('dovrebbe creare il componente', () => {
        expect(component).toBeTruthy();
    });

    it('dovrebbe inizializzare vistaCorrente su ACCOUNT', () => {
        expect(component.vistaCorrente).toBe('account');
    });

    it('dovrebbe cambiare vista corrente se valida', () => {
        component.cambiaVistaCorrente(component.visteUtente.BILLING);
        expect(component.vistaCorrente).toBe('billing');
    });

    it('non dovrebbe cambiare vista se non valida', () => {
        component.cambiaVistaCorrente('invalid' as any);
        expect(component.vistaCorrente).toBe('account');
    });

    it('dovrebbe riconoscere viste valide', () => {
        expect(component.isVistaValida(component.visteUtente.ACCOUNT)).toBeTrue();
        expect(component.isVistaValida(component.visteUtente.BILLING)).toBeTrue();
        expect(component.isVistaValida('fake' as any)).toBeFalse();
    });

    it('dovrebbe confermare se una vista è la corrente', () => {
        component.vistaCorrente = component.visteUtente.BILLING;
        expect(component.isVistaCorrente(component.visteUtente.BILLING)).toBeTrue();
        expect(component.isVistaCorrente(component.visteUtente.ACCOUNT)).toBeFalse();
    });

    it('dovrebbe chiamare logout', fakeAsync(() => {
        authServiceSpy.logout.and.returnValue(Promise.resolve());
        component.logout();
        tick();
        expect(authServiceSpy.logout).toHaveBeenCalled();
    }));

    it('dovrebbe caricare utente correttamente se autenticato', fakeAsync(() => {
        authServiceSpy.getUtenteCorrente.and.returnValue({
            uid: '123',
            emailVerified: false,
            isAnonymous: false,
            metadata: {} as any,
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: function (): Promise<void> {
                throw new Error('Function not implemented.');
            },
            getIdToken: function (forceRefresh?: boolean): Promise<string> {
                throw new Error('Function not implemented.');
            },
            getIdTokenResult: function (forceRefresh?: boolean): Promise<IdTokenResult> {
                throw new Error('Function not implemented.');
            },
            reload: function (): Promise<void> {
                throw new Error('Function not implemented.');
            },
            toJSON: function (): object {
                throw new Error('Function not implemented.');
            },
            displayName: null,
            email: null,
            phoneNumber: null,
            photoURL: null,
            providerId: ''
        });
        utenteServiceSpy.getUtenteById.and.returnValue(Promise.resolve(mockUtente));

        component.ngOnInit();
        tick();

        expect(component.utenteCorrente).toEqual(mockUtente);
        expect(component.loading).toBeFalse();
    }));

    it('dovrebbe fare logout e redirect se utente è null', fakeAsync(() => {
        authServiceSpy.getUtenteCorrente.and.returnValue(null);
        authServiceSpy.logout.and.returnValue(Promise.resolve());

        component.ngOnInit();
        tick();

        expect(authServiceSpy.logout).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('dovrebbe gestire errori e fare logout', fakeAsync(() => {
        authServiceSpy.getUtenteCorrente.and.returnValue({
            uid: '123',
            emailVerified: false,
            isAnonymous: false,
            metadata: {} as any,
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: function (): Promise<void> {
                throw new Error('Function not implemented.');
            },
            getIdToken: function (forceRefresh?: boolean): Promise<string> {
                throw new Error('Function not implemented.');
            },
            getIdTokenResult: function (forceRefresh?: boolean): Promise<IdTokenResult> {
                throw new Error('Function not implemented.');
            },
            reload: function (): Promise<void> {
                throw new Error('Function not implemented.');
            },
            toJSON: function (): object {
                throw new Error('Function not implemented.');
            },
            displayName: null,
            email: null,
            phoneNumber: null,
            photoURL: null,
            providerId: ''
        });
        utenteServiceSpy.getUtenteById.and.returnValue(Promise.reject('Errore'));
        authServiceSpy.logout.and.returnValue(Promise.resolve());

        component.ngOnInit();
        tick();

        expect(authServiceSpy.logout).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        expect(component.loading).toBeFalse();
    }));
});
