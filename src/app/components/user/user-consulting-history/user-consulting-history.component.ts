import { Component } from '@angular/core';
import { Transazione, Stato } from '../../../model/transazione';
import { TransazioneService } from '../../../services/transazione.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { bootstrapClockHistory, bootstrapArrowClockwise } from '@ng-icons/bootstrap-icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-consulting-history',
  imports: [
    NgIcon,
    NgbPagination,
    NgClass,
    CurrencyPipe,
    DatePipe
  ],
  providers: [provideIcons({
    bootstrapClockHistory,
    bootstrapArrowClockwise,
  })],
  templateUrl: './user-consulting-history.component.html',
  styleUrl: './user-consulting-history.component.css'
})
export class UserConsultingHistoryComponent {
  transactions: Transazione[] = [];
  filteredTransactions: Transazione[] = [];

  loading = true;
  error: string | null = null;

  sortDirection: 'asc' | 'desc' = 'desc';
  filterStatus: Stato | 'all' = 'all';

  page = 1;
  pageSize = 10;
  maxSize = 5;

  constructor(private transazioneService: TransazioneService, private authService: AuthService) { }

  ngOnInit(): void {
    this.fetchTransactions();
  }

  async fetchTransactions() {
    try {
      const userId = await this.authService.getIdUtente();
        this.transactions = await this.transazioneService.getTransazioniByUserId(userId);
      this.applyFilters();
    } catch (err) {
      this.error = 'Errore nel recupero delle transazioni';
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    let trans = [...this.transactions];

    if (this.filterStatus !== 'all') {
      trans = trans.filter(t => t.stato === this.filterStatus);
    }

    trans.sort((a, b) => this.sortDirection === 'asc' ? a.data.getTime() - b.data.getTime() : b.data.getTime() - a.data.getTime());
    this.filteredTransactions = trans;
  }

  changeFilterStatus(status: Stato | 'all') {
    this.filterStatus = status;
    this.applyFilters();
  }

  changeSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  getProductNameColor(categoria: string): string {
    switch (categoria) {
      case 'bronze':
        return 'bronze';
      case 'silver':
        return 'silver';
      case 'gold':
        return 'gold';
      default:
        return 'default-color';
    }
  }

  getStatusClass(status: Stato): string {
    return status === 'completato' ? 'badge bg-success' : 'badge bg-danger';
  }

  paginatedTransaction(): Transazione[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredTransactions.slice(start, start + this.pageSize);
  }
}


