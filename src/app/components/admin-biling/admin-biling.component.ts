import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { bootstrapArrowClockwise, bootstrapDownload, bootstrapFileEarmarkFill, bootstrapPersonFill } from '@ng-icons/bootstrap-icons';
import { db } from '../../../environments/firebase';
import { Transaction, User } from '../../models/user.model';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

// Estensione dell'interfaccia User per includere uid
interface UserWithUid extends User {
  uid: string;
}

// Interfaccia che include anche le transazioni
interface UserWithTransactions extends UserWithUid {
  transactions: Transaction[];
}

@Component({
  selector: 'app-admin-biling',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    NgClass,
    CurrencyPipe,
    NgbPagination
  ],
  providers: [
    provideIcons({
      bootstrapArrowClockwise,
      bootstrapDownload,
      bootstrapPersonFill,
      bootstrapFileEarmarkFill
    })
  ],
  templateUrl: './admin-biling.component.html',
  styleUrl: './admin-biling.component.css'
})
export class AdminBilingComponent implements OnInit {

  // Pagination
  public page: number = 1;
  public pageSize: number = 8;
  public maxSize: number = 5;

  // Data
  users: UserWithUid[] = [];
  selectedUser: UserWithTransactions | null = null;
  isLoading = true;

  public constructor() { }

  public async ngOnInit(): Promise<void> {
    try {
      this.users = await this.getUsers();
    } catch (error) {
      console.error('Errore nel recupero dei dati:', error);
    } finally {
      this.isLoading = false;
    }
  }

  public async selectUser(user: UserWithUid): Promise<void> {
    this.isLoading = true;
    try {
      const transactions = await this.getUserTransactions(user.uid);
      this.selectedUser = {
        ...user,
        transactions
      };
    } catch (error) {
      console.error('Errore nel recupero delle transazioni:', error);
    } finally {
      this.isLoading = false;
    }
  }

  public exportUserDataToCSV(): void {
    if (!this.selectedUser) {
      console.warn('Nessun utente selezionato');
      return;
    }

    const csvContent = this.generateCSVContent(this.selectedUser);
    this.downloadCSV(csvContent, `dati_${this.selectedUser.surname}_${this.selectedUser.name}.csv`);
  }

  public getStatusClass(status: string): string {
    switch (status) {
      case 'Completato':
        return 'badge rounded-pill text-bg-success p-1';
      case 'Annullato':
        return 'badge rounded-pill text-bg-danger p-1';
      default:
        return 'badge rounded-pill text-bg-secondary p-1';
    }
  }

  public getUserDisplayName(user: UserWithUid): string {
    return `${user.name} ${user.surname}`;
  }

  public getProfileImage(user: UserWithUid): string {
    return user.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
  }

  public paginatedUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  };

  // private method
  private async getUsers(): Promise<UserWithUid[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('role', '==', 'user'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data() as User,
      uid: doc.id
    } as UserWithUid));
  }

  private async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactionsCol = collection(db, 'transactions');
      const q = query(transactionsCol, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: data['date'],
          amount: data['amount'],
          status: data['status']
        } as Transaction;
      });
    } catch (error) {
      console.error('Errore nel recupero delle transazioni:', error);
      return [];
    }
  }

  private generateCSVContent(user: UserWithTransactions): string {
    let csvContent = 'DATI UTENTE\n';
    csvContent += `ID,${user.uid}\n`;
    csvContent += `Nome,${user.name}\n`;
    csvContent += `Cognome,${user.surname}\n`;
    csvContent += `Email,${user.email}\n`;
    csvContent += `Codice Fiscale,${user.fiscalCode}\n`;
    csvContent += `Città,${user.city}\n`;
    csvContent += `Indirizzo,${user.route}\n`;
    csvContent += '\n'; // Riga vuota
    csvContent += 'TRANSAZIONI\n';
    csvContent += 'Data,Importo,Stato\n';

    if (user.transactions?.length) {
      user.transactions.forEach((t) => {
        const cleanDate = String(t.date).replace(/,/g, ' ');
        const cleanAmount = String(t.amount).replace(/,/g, ' ');
        const cleanStatus = String(t.status).replace(/,/g, ' ');
        csvContent += `${cleanDate},${cleanAmount},${cleanStatus}\n`;
      });
    } else {
      csvContent += 'Nessuna transazione disponibile\n';
    }

    return csvContent;
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

}