import { Component, OnInit } from '@angular/core';
import { db } from '../../../environments/firebase';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { bootstrapArrowClockwise, bootstrapDownload, bootstrapPersonFill } from '@ng-icons/bootstrap-icons';
import { NgClass } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { Transaction } from '../../models/user.model';

@Component({
  selector: 'app-admin-biling',
  imports: [NgIcon, NgClass, CurrencyPipe],
  providers: [provideIcons({ bootstrapArrowClockwise, bootstrapDownload, bootstrapPersonFill })],
  templateUrl: './admin-biling.component.html',
  styleUrl: './admin-biling.component.css'
})

export class AdminBilingComponent implements OnInit {

  public users: any[] = [];
  public selectedUser: any | null = null;
  public isLoading: boolean = true;

  public constructor() { }

  public async ngOnInit() {
    try {
      this.users = await this.getUsers();
    } catch (error) {
      console.log('Errore nel recupero dei dati:', error);
    } finally {
      this.isLoading = false;
    }
  }

  public async getUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('role', '==', 'user'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  }

  public async selectUser(user: User): Promise<void> {
    this.isLoading = true;
    try {
      const transactions = await this.getUserTransactions(user.uid);

      this.selectedUser = {
        ...user,
        transactions: transactions
      };
      
      console.log(this.selectedUser);
    } catch (error) {
      console.log('Errore nel recupero delle transazioni:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      // Ottieni le transazioni dal database
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

  public exportUserDataToCSV(): void {
    if (!this.selectedUser) {
      console.warn('Nessun utente selezionato');
      return;
    }
    let csvContent = 'DATI UTENTE\n';
    csvContent += `ID,${this.selectedUser.uid}\n`;
    csvContent += `Nome,${this.selectedUser.name}\n`;
    csvContent += `Cognome,${this.selectedUser.surname}\n`;
    csvContent += `Email,${this.selectedUser.email}\n`;
    csvContent += `Codice Fiscale,${this.selectedUser.fiscalCode}\n`;
    csvContent += `Città,${this.selectedUser.city}\n`;
    csvContent += `Indirizzo,${this.selectedUser.route}\n`;
    csvContent += '\n'; // Riga vuota
    csvContent += 'TRANSAZIONI\n';
    csvContent += 'Data,Importo,Stato\n';
    if (this.selectedUser.transactions?.length) {
      this.selectedUser.transactions.forEach((t: { date: any; amount: any; status: any; }) => {
        const cleanDate = String(t.date).replace(/,/g, ' ');
        const cleanAmount = String(t.amount).replace(/,/g, ' ');
        const cleanStatus = String(t.status).replace(/,/g, ' ');
        csvContent += `${cleanDate},${cleanAmount},${cleanStatus}\n`;
      });
    } else {
      csvContent += 'Nessuna transazione disponibile\n';
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dati_${this.selectedUser.surname}_${this.selectedUser.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

}