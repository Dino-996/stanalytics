import { Component, OnInit } from '@angular/core';
import { Transaction } from '../../models/user.model';
import { TransactionService } from '../../services/transaction.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowClockwise, bootstrapClockHistory } from '@ng-icons/bootstrap-icons';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-user-consulting-history',
  imports: [
    NgIcon,
    NgClass,
    CurrencyPipe
  ],
  providers: [provideIcons({
    bootstrapClockHistory,
    bootstrapArrowClockwise
  })],
  templateUrl: './user-consulting-history.component.html',
  styleUrls: ['./user-consulting-history.component.css'],
  standalone: true,
})

export class UserConsultingHistoryComponent implements OnInit {

  public transactions: Transaction[] = [];
  public loading = true;
  public error: string | null = null;

  public constructor(private transactionService: TransactionService) { }

  public ngOnInit(): void {
    this.loadTransactions();
  }

  public async loadTransactions() {
    try {
      this.loading = true;
      this.error = null;
      this.transactions = await this.transactionService.getUserTransactions();

      if (this.transactions) { 
        this.loading = false; 
      }

    } catch (err) {
      console.error('Errore nel caricamento delle transazioni:', err);
      this.error = 'Impossibile caricare le transazioni. Riprova più tardi.';
      this.transactions = [];
    } finally {
      this.loading = false;
    }
  }

  public getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'completato':
        return 'badge bg-success';
      case 'in attesa':
        return 'badge bg-warning text-dark';
      case 'annullato':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  public getProductNameColor(productName: string): string {
    const name = productName.toLowerCase();
    if (name.includes('bronzo')) {
      return 'bronze';
    } else if (name.includes('silver')) {
      return 'silver';
    } else if (name.includes('gold')) {
      return 'gold';
    } else {
      return 'bronze';
    }
  }

}