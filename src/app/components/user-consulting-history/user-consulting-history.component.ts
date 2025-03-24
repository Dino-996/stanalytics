import { Component, OnInit } from '@angular/core';
import { Transaction } from '../../models/user.model';
import { TransactionService } from '../../services/transaction.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowClockwise, bootstrapClockHistory } from '@ng-icons/bootstrap-icons';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-consulting-history',
  imports: [
    NgIcon,
    NgClass,
    CurrencyPipe,
    DatePipe,
    NgbPagination
  ],
  providers: [
    provideIcons({
    bootstrapClockHistory,
    bootstrapArrowClockwise
  })],
  templateUrl: './user-consulting-history.component.html',
  styleUrls: ['./user-consulting-history.component.css'],
  standalone: true,
})

export class UserConsultingHistoryComponent implements OnInit {

  public page: number = 1;
  public pageSize: number = 4;
  public maxSize: number = 3;

  public transactions: Transaction[] = [];
  public filteredTransactions: Transaction[] = [];
  public loading = true;
  public error: string | null = null;

  public sortDirection: 'asc' | 'desc' = 'desc';
  public filterStatus: 'all' | 'completato' | 'annullato' = 'all';

  public constructor(private transactionService: TransactionService) { }

  public ngOnInit(): void {
    this.loadTransactions();
  }

  public async loadTransactions() {
    try {
      this.loading = true;
      this.error = null;
      this.transactions = await this.transactionService.getUserTransactions();
      this.applyFilters();

      if (this.transactions) {
        this.loading = false;
      }

    } catch (err) {
      console.error('Errore nel caricamento delle transazioni:', err);
      this.error = 'Impossibile caricare le transazioni. Riprova più tardi.';
      this.transactions = [];
      this.filteredTransactions = [];
    } finally {
      this.loading = false;
    }
  }

  public getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
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

  public paginatedTransaction() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredTransactions.slice(start, start + this.pageSize); // Usa filteredTransactions
}

  public applyFilters(): void {
    let filteredTransactions = [...this.transactions];

    if (this.filterStatus !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.status.toLowerCase() === this.filterStatus);
    }

    filteredTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    this.filteredTransactions = filteredTransactions;
  }
  public changeSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  public changeFilterStatus(status: 'all' | 'completato' | 'annullato') {
    this.filterStatus = status;
    this.applyFilters();
  }


}