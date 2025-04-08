import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDashboardComponent } from './user-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { UtenteService } from '../../../services/utente.service';
import { Router } from '@angular/router';
import { Utente } from '../../../model/utente';
import { Component } from '@angular/core';

@Component({ selector: 'app-user-consulting-history', standalone: true, template: '' })
class MockConsultingHistoryComponent { }

@Component({ selector: 'app-user-consulting-package', standalone: true, template: '' })
class MockConsultingPackageComponent { }

@Component({ selector: 'app-user-settings', standalone: true, template: '' })
class MockUserSettingsComponent { }

describe('UserDashboardComponent', () => {
    let component: UserDashboardComponent;
    let fixture: ComponentFixture<UserDashboardComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let utenteService: jasmine.SpyObj<UtenteService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'getUtenteCorrente']);
        const utenteServiceSpy = jasmine.createSpyObj('UtenteService', ['getUtenteById']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [
                UserDashboardComponent,
                MockConsultingHistoryComponent,
                MockConsultingPackageComponent,
                MockUserSettingsComponent
            ],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: UtenteService, useValue: utenteServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UserDashboardComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        utenteService = TestBed.inject(UtenteService) as jasmine.SpyObj<UtenteService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

        fixture.detectChanges();
    });

    it('dovrebbe creare il componente', () => {
        expect(component).toBeTruthy();
    });

    it('dovrebbe chiamare caricaUtenti() all\'inizializzazione', async () => {
        const spy = spyOn<any>(component, 'caricaUtenti');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('dovrebbe eseguire il logout', async () => {
        authService.logout.and.resolveTo();
        await component.logout();
        expect(authService.logout).toHaveBeenCalled();
    });

    it('dovrebbe cambiare vista corrente se la vista è valida', () => {
        component.cambiaVistaCorrente(component.visteUtente.SETTINGS);
        expect(component.vistaCorrente).toBe(component.visteUtente.SETTINGS);
    });

    it('non dovrebbe cambiare vista se la vista non è valida', () => {
        component.cambiaVistaCorrente('non_valida' as any);
        expect(component.vistaCorrente).toBe(component.visteUtente.CONSULTING_HISTORY);
    });

    it('isVistaValida dovrebbe restituire true per vista valida', () => {
        expect(component.isVistaValida(component.visteUtente.CONSULTING_PACKAGE)).toBeTrue();
    });

    it('isVistaValida dovrebbe restituire false per vista non valida', () => {
        expect(component.isVistaValida('invalida' as any)).toBeFalse();
    });

    it('isVistaCorrente dovrebbe restituire true solo per la vista corrente', () => {
        component.vistaCorrente = component.visteUtente.CONSULTING_HISTORY;
        expect(component.isVistaCorrente(component.visteUtente.CONSULTING_HISTORY)).toBeTrue();
        expect(component.isVistaCorrente(component.visteUtente.SETTINGS)).toBeFalse();
    });

    it('dovrebbe caricare l\'utente se presente', async () => {
        const mockUtente = { uid: '123' } as any;
        const mockDettagli = { nome: 'Mario' } as Utente;
        authService.getUtenteCorrente.and.returnValue(mockUtente);
        utenteService.getUtenteById.and.resolveTo(mockDettagli);

        await (component as any).caricaUtenti();

        expect(component.utenteCorrente).toEqual(mockDettagli);
        expect(component.loading).toBeFalse();
    });

    it('dovrebbe fare logout e reindirizzare se utente non trovato', async () => {
        authService.getUtenteCorrente.and.returnValue(null);
        authService.logout.and.stub();
        router.navigate.and.stub();

        await (component as any).caricaUtenti();

        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
});
