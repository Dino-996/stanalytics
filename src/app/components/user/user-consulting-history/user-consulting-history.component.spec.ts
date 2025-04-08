import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { UserConsultingHistoryComponent } from './user-consulting-history.component';
import { TransazioneService } from '../../../services/transazione.service';
import { AuthService } from '../../../services/auth.service';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapClockHistory, bootstrapArrowClockwise, bootstrapInfoCircleFill } from '@ng-icons/bootstrap-icons';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Transazione } from '../../../model/transazione';

describe('UserConsultingHistoryComponent', () => {
    let component: UserConsultingHistoryComponent;
    let fixture: ComponentFixture<UserConsultingHistoryComponent>;
    let transazioneServiceSpy: jasmine.SpyObj<TransazioneService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    const mockTransazioni: Transazione[] = [
        new Transazione(
            'Pacchetto base',
            new Date('2024-03-01T10:00:00'),
            '50',
            'bronze',
            'completato',
            'utente123'
        ),
        new Transazione(
            'Pacchetto premium',
            new Date('2024-02-15T14:30:00'),
            '150',
            'gold',
            'annullato',
            'utente123'
        )
    ];

    beforeEach(waitForAsync(() => {
        transazioneServiceSpy = jasmine.createSpyObj('TransazioneService', ['getTransazioniByUserId']);
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getIdUtente']);

        TestBed.configureTestingModule({
            imports: [
                UserConsultingHistoryComponent,
                NgbPagination,
                NgIcon,
                NgClass
            ],
            providers: [
                CurrencyPipe,
                DatePipe,
                { provide: TransazioneService, useValue: transazioneServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                provideIcons({
                    bootstrapClockHistory,
                    bootstrapArrowClockwise,
                    bootstrapInfoCircleFill
                })
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserConsultingHistoryComponent);
        component = fixture.componentInstance;
    });

    it('dovrebbe creare il componente', () => {
        expect(component).toBeTruthy();
    });

    it('dovrebbe caricare le transazioni all\'inizializzazione', fakeAsync(() => {
        authServiceSpy.getIdUtente.and.resolveTo('utente123');
        transazioneServiceSpy.getTransazioniByUserId.and.resolveTo(mockTransazioni);

        component.ngOnInit();
        tick();

        expect(component.transactions.length).toBe(2);
        expect(component.filteredTransactions.length).toBe(2);
        expect(component.loading).toBeFalse();
        expect(component.error).toBeNull();
    }));

    it('dovrebbe gestire l\'errore durante l\'inizializzazione', fakeAsync(() => {
        authServiceSpy.getIdUtente.and.resolveTo('utente123');
        transazioneServiceSpy.getTransazioniByUserId.and.rejectWith('Errore');

        component.ngOnInit();
        tick();

        expect(component.error).toBe('Errore nel recupero delle transazioni');
        expect(component.loading).toBeFalse();
        expect(component.transactions.length).toBe(0);
    }));

    it('dovrebbe filtrare le transazioni in base allo stato', () => {
        component.transactions = mockTransazioni;
        component.filterStatus = 'completato';
        component.applyFilters();

        expect(component.filteredTransactions.length).toBe(1);
        expect(component.filteredTransactions[0].stato).toBe('completato');
    });

    it('dovrebbe ordinare le transazioni in ordine crescente e decrescente', () => {
        component.transactions = [...mockTransazioni];

        component.sortDirection = 'desc';
        component.applyFilters();
        expect(component.filteredTransactions[0].data.getTime()).toBeGreaterThan(component.filteredTransactions[1].data.getTime());

        component.sortDirection = 'asc';
        component.applyFilters();
        expect(component.filteredTransactions[0].data.getTime()).toBeLessThan(component.filteredTransactions[1].data.getTime());
    });

    it('dovrebbe restituire transazioni paginate', () => {
        component.filteredTransactions = Array.from({ length: 25 }, (_, i) =>
            new Transazione(
                `Prodotto ${i + 1}`,
                new Date(),
                '99',
                'silver',
                'completato',
                'utente123'
            )
        );
        component.page = 2;
        component.pageSize = 10;

        const result = component.paginatedTransaction();
        expect(result.length).toBe(10);
        expect(result[0].nomeProdotto).toBe('Prodotto 11');
    });

    it('dovrebbe restituire la classe di badge corretta in base allo stato', () => {
        expect(component.getStatusClass('completato')).toBe('badge bg-success');
        expect(component.getStatusClass('annullato')).toBe('badge bg-danger');
    });

    it('dovrebbe restituire la classe corretta per la categoria di consulenza', () => {
        expect(component.getProductNameColor('gold')).toBe('gold');
        expect(component.getProductNameColor('silver')).toBe('silver');
        expect(component.getProductNameColor('altro')).toBe('default-color');
    });
});
