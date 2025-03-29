import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { TransazioneService } from '../../../services/transazione.service';
import { Categoria, Transazione } from '../../../model/transazione';
import { UtenteService } from '../../../services/utente.service';
import { Utente } from '../../../model/utente';
import { Router } from '@angular/router';
import { NgxPayPalModule, IPayPalConfig } from 'ngx-paypal';
import { CurrencyPipe, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapBoxes } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-user-consulting-package',
  imports: [NgxPayPalModule, NgStyle, CurrencyPipe,FormsModule, NgIcon],
  providers:[provideIcons({bootstrapBoxes})],
  templateUrl: './user-consulting-package.component.html',
  styleUrl: './user-consulting-package.component.css'
})

export class UserConsultingPackageComponent {
  public selectedPackage: string = '';
  public payPalConfigBronze?: IPayPalConfig;
  public payPalConfigSilver?: IPayPalConfig;
  public payPalConfigGold?: IPayPalConfig;
  public isPayPalLoading: boolean = false;

  public transactionStatus: 'success' | 'error' | 'none' = 'none';
  public transactionMessage: string = '';

  public idUtente: string = '';

  public constructor(private transazioneService: TransazioneService, private authService: AuthService, private utenteService: UtenteService, private router: Router) { }

  public async ngOnInit(): Promise<void> {
    this.initConfigs();
    this.caricaIdUtenteCorrente();
  }

  private async caricaIdUtenteCorrente():Promise<void> {
    this.idUtente = await this.authService.getIdUtente();
  }

  private initConfigs(): void {
    setTimeout(() => {
      this.initConfigBronze();
      this.initConfigSilver();
      this.initConfigGold();
      this.isPayPalLoading = true;
    }, 5000);
  }

  private initConfigBronze(): void {
    this.payPalConfigBronze = this.createPayPalConfig('Pacchetto bronze', '239.00');
  }

  private initConfigSilver(): void {
    this.payPalConfigSilver = this.createPayPalConfig('Pacchetto silver', '479.00');
  }

  private initConfigGold(): void {
    this.payPalConfigGold = this.createPayPalConfig('Pacchetto gold', '739.00');
  }

  private createPayPalConfig(name: string, price: string): IPayPalConfig {
    const dataOggi = new Date();
    return {
      currency: 'EUR',
      clientId: 'AS690Yj-oYGF3qVvdd8rJPmEJfzHM3ymppE1PrLAXmxQGnZ7esyqv2xj9g927Swpeo0a54gH4Xhak3oP',
      createOrderOnClient: () => ({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: price,
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: price
              }
            }
          },
          items: [{
            name: name,
            quantity: '1',
            category: 'DIGITAL_GOODS',
            unit_amount: {
              currency_code: 'EUR',
              value: price,
            },
          }]
        }]
      }),
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'horizontal',
        color: 'blue',
        shape: 'pill',
        tagline: false,
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then((details: any) => {
          this.transactionStatus = 'success';
          this.transactionMessage = 'Pagamento andato a buon fine!';
        });
      },
      onClientAuthorization: (data) => {
        if (!this.idUtente) {
          this.transactionStatus = 'error';
          this.transactionMessage = 'Errore: utente non trovato.';
          return;
        }
        const transazione = new Transazione(`Pacchetto ${this.getPackageLevel(this.selectedPackage).toLowerCase()}`, new Date(), this.getPackagePrice(this.selectedPackage).toString(), this.getPackageLevel(this.selectedPackage).toLowerCase() as Categoria, 'completato', this.idUtente);
        try {
          this.transazioneService.creaTransazione(transazione);
          this.transactionStatus = 'success';
          this.transactionMessage = 'Transazione creata con successo!';
        } catch (error) {
          this.transactionStatus = 'error';
          this.transactionMessage = 'Errore durante la creazione della transazione.';
        }
      },
      onCancel: (data, actions) => {
        if (!this.idUtente) {
          this.transactionStatus = 'error';
          this.transactionMessage = 'Errore: utente non trovato.';
          return;
        }
        const transazione = new Transazione(`Pacchetto ${this.getPackageLevel(this.selectedPackage).toLowerCase()}`, new Date(), this.getPackagePrice(this.selectedPackage).toString(), this.getPackageLevel(this.selectedPackage).toLowerCase() as Categoria, 'annullato', this.idUtente);
        try {
          this.transazioneService.creaTransazione(transazione);
          this.transactionStatus = 'error';
          this.transactionMessage = 'Pagamento annullato.';
        } catch (error) {
          this.transactionStatus = 'error';
          this.transactionMessage = 'Errore durante la creazione della transazione.';
        }
      },
      onError: (err) => {
        this.transactionStatus = 'error';
        this.transactionMessage = 'Errore durante il pagamento.';
      }
    };
  }

  public getPayPalConfig(packageName: string): IPayPalConfig | undefined {
    switch (packageName) {
      case 'bronze':
        return this.payPalConfigBronze;
      case 'silver':
        return this.payPalConfigSilver;
      case 'gold':
        return this.payPalConfigGold;
      default:
        return undefined;
    }
  }

  public getPackageLevel(packageName: string): string {
    switch (packageName) {
      case 'bronze':
        return 'BRONZE';
      case 'silver':
        return 'SILVER';
      case 'gold':
        return 'GOLD';
      default:
        return '';
    }
  }

  public getPackagePrice(packageName: string): number {
    switch (packageName) {
      case 'bronze':
        return 239;
      case 'silver':
        return 479;
      case 'gold':
        return 739;
      default:
        return 0;
    }
  }

  public getPackageColor(packageName: string): string {
    switch (packageName) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      default:
        return '#FFFFFF';
    }
  }

  public getDescription(packageName: string): string {
    switch (packageName) {
      case 'bronze':
        return 'Abbonamento mensile';
      case 'silver':
        return 'Abbonamento trimestrale';
      case 'gold':
        return 'Abbonamento semestrale';
      default:
        return 'Istruzioni operative online';
    }
  }
}
