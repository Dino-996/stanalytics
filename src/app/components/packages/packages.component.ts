import { NgClass } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ICreateOrderRequest, IPayPalConfig, NgxPayPalModule } from 'ngx-paypal';
import { Transaction } from '../../models/user.model';
import { TransactionService } from '../../services/transaction.service';

const CLIENT_ID_PAYPAL = "AS690Yj-oYGF3qVvdd8rJPmEJfzHM3ymppE1PrLAXmxQGnZ7esyqv2xj9g927Swpeo0a54gH4Xhak3oP";
type ProductName = 'Pacchetto bronze' | 'Pacchetto silver' | 'Pacchetto gold';
type Level = 'bronze' | 'silver' | 'gold';

@Component({
  selector: 'app-packages',
  imports: [
    NgxPayPalModule,
    NgClass
  ],
  templateUrl: './packages.component.html',
  styleUrl: './packages.component.css'
})

export class PackagesComponent implements OnInit, OnChanges {

  @Input() public amount: string = '0.00';
  @Input() public productName: ProductName = 'Pacchetto bronze';
  @Input() public level: Level = 'bronze';
  @Input() public millisecond: number = 0;

  public payPalConfig?: IPayPalConfig;
  public loading: boolean = true;

  public constructor(private transactionService: TransactionService) {}

  public ngOnInit(): void {
    setTimeout(() => {
      this.initConfig();
      this.loading = false;
    }, this.millisecond);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['amount'] && !changes['amount'].firstChange) {
      this.initConfig();
    }
  }

  public getColor(): string {
    switch (this.level) {
      case 'bronze':
        return 'bronze';
      case 'silver':
        return 'silver';
      case 'gold':
        return 'gold';
      default:
        return 'bronze';
    }
  }

  // Metodi privati
  private initConfig(): void {
    this.payPalConfig = {
      currency: 'EUR',
      clientId: CLIENT_ID_PAYPAL,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: this.amount,
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: this.amount
              }
            }
          },
          items: [{
            name: this.productName,
            quantity: '1',
            category: 'DIGITAL_GOODS',
            unit_amount: {
              currency_code: 'EUR',
              value: this.amount,
            },
          }]
        }]
      },
      advanced: {
        commit: 'true',
        extraQueryParams: [
          { name: 'disable-funding', value: 'venmo' },
          { name: 'enable-funding', value: 'card' },
          { name: 'buyer-country', value: 'IT' }
        ]
      },
      style: {
        label: 'paypal',
        layout: 'horizontal',
        color: 'blue',
        shape: 'pill',
        tagline: true,
        fundingicons: false,
        height: 40,
      },
      onClientAuthorization: async (data) => {
        const transaction: Omit<Transaction, 'id'> = {
          productName: this.productName,
          date: new Date().toLocaleDateString('it-IT'),
          amount: this.amount,
          level: this.level,
          status: 'Completato',
          userId: ''
        };

        try {
          await this.transactionService.createTransaction(transaction);
        } catch (error) {
          console.error('Errore nel salvataggio della transazione:', error);
        }

      },
      onCancel: async (data, actions) => {
        const transaction: Omit<Transaction, 'id'> = {
          productName: this.productName,
          date: new Date().toLocaleDateString('it-IT'),
          amount: this.amount,
          level: this.level,
          status: 'Annullato',
          userId: ''
        };

        try {
          await this.transactionService.createTransaction(transaction);
        } catch (error) {
          console.error('Errore nel salvataggio della transazione:', error);
        }
      }
    };
  }

}

