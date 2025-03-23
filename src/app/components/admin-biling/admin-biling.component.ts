import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowClockwise, bootstrapDownload, bootstrapFileEarmarkFill, bootstrapPersonFill, bootstrapClockHistory } from '@ng-icons/bootstrap-icons';
import { Transaction, User } from '../../models/user.model';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';

// Interfaccia che include anche le transazioni
interface UserWithTransactions extends User {
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
      bootstrapFileEarmarkFill,
      bootstrapClockHistory
    })
  ],
  templateUrl: './admin-biling.component.html',
  styleUrl: './admin-biling.component.css'
})

export class AdminBilingComponent implements OnInit {

  // Paginazione utenti
  public page: number = 1;
  public pageSize: number = 14;
  public maxSize: number = 3;

  // Paginazione transazioni
  public transactionPage: number = 1;
  public transactionPageSize: number = 4;
  public transactionMaxSize: number = 3;

  // Data
  public users: User[] = [];
  public selectedUser: UserWithTransactions | null = null;
  public isLoading = true;

  public constructor(private userService: UserService, private transactionService: TransactionService) { }

  public ngOnInit(): void {
    this.loadUsers();
  }

  public async selectUser(user: User): Promise<void> {
    this.isLoading = true;
    try {
      // Assicurati che user.id esista prima di usarlo
      if (!user.id) {
        console.error('ID utente mancante');
        return;
      }

      const transactions = await this.transactionService.loadTransactionsByUserId(user.id);
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

  public getUserDisplayName(user: User): string {
    return `${user.name} ${user.surname}`;
  }

  public getProfileImage(user: User): string {
    return user.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
  }

  public paginatedUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  public paginatedTransaction() {
    const start = (this.transactionPage - 1) * this.transactionPageSize;
    return this.selectedUser?.transactions.slice(start, start + this.transactionPageSize);
  }

  public getProductLevelColor(level: string): string {
    switch (level) {
      case 'bronze':
        return 'bg-bronze';
      case 'silver':
        return 'bg-silver';
      case 'gold':
        return 'bg-gold';
      default:
        return 'bg-bronze';
    }
  }

  // Metodi privati
  private async loadUsers(): Promise<void> {
    this.isLoading = true;
    try {
      this.users = await this.userService.getAllUsers();
      this.users.push({ id: 'abcfdsds', name: 'Dino', surname: 'Levrieri', email: 'dino@gmail.com', fiscalCode: 'SSSAJKSJAK12DSKL', route: 'Via della Droga 18', city: 'Potenza', role: 'user' },
        { id: 'nssxcndw', name: 'Amerigo', surname: 'Vespucci', email: 'amerigo2000@outlook.com', fiscalCode: 'ADDS32DSD56HHG', route: 'Piazza Grande 24', city: 'Verona', role: 'user' },
        { id: 'abcfdsds', name: 'Dino', surname: 'Levrieri', email: 'dino@gmail.com', fiscalCode: 'SSSAJKSJAK12DSKL', route: 'Via della Droga 18', city: 'Potenza', role: 'user' },
        { id: 'nssxcndw', name: 'Amerigo', surname: 'Vespucci', email: 'amerigo2000@outlook.com', fiscalCode: 'ADDS32DSD56HHG', route: 'Piazza Grande 24', city: 'Verona', role: 'user' },
        { id: 'abcfdsds', name: 'Dino', surname: 'Levrieri', email: 'dino@gmail.com', fiscalCode: 'SSSAJKSJAK12DSKL', route: 'Via della Droga 18', city: 'Potenza', role: 'user' },
        { id: 'nssxcndw', name: 'Amerigo', surname: 'Vespucci', email: 'amerigo2000@outlook.com', fiscalCode: 'ADDS32DSD56HHG', route: 'Piazza Grande 24', city: 'Verona', role: 'user' },
        { id: 'abcfdsds', name: 'Dino', surname: 'Levrieri', email: 'dino@gmail.com', fiscalCode: 'SSSAJKSJAK12DSKL', route: 'Via della Droga 18', city: 'Potenza', role: 'user' },
        { id: 'nssxcndw', name: 'Amerigo', surname: 'Vespucci', email: 'amerigo2000@outlook.com', fiscalCode: 'ADDS32DSD56HHG', route: 'Piazza Grande 24', city: 'Verona', role: 'user' },
        { id: 'abcfdsds', name: 'Dino', surname: 'Levrieri', email: 'dino@gmail.com', fiscalCode: 'SSSAJKSJAK12DSKL', route: 'Via della Droga 18', city: 'Potenza', role: 'user' },
        { id: 'nssxcndw', name: 'Amerigo', surname: 'Vespucci', email: 'amerigo2000@outlook.com', fiscalCode: 'ADDS32DSD56HHG', route: 'Piazza Grande 24', city: 'Verona', role: 'user' },
        { id: 'abcfdsds', name: 'Dino', surname: 'Levrieri', email: 'dino@gmail.com', fiscalCode: 'SSSAJKSJAK12DSKL', route: 'Via della Droga 18', city: 'Potenza', role: 'user' },
        { id: 'nssxcndw', name: 'Amerigo', surname: 'Vespucci', email: 'amerigo2000@outlook.com', fiscalCode: 'ADDS32DSD56HHG', route: 'Piazza Grande 24', city: 'Verona', role: 'user' },
        { id: 'abcfdsds', name: 'Dino', surname: 'Levrieri', email: 'dino@gmail.com', fiscalCode: 'SSSAJKSJAK12DSKL', route: 'Via della Droga 18', city: 'Potenza', role: 'user' },
        { id: 'nssxcndw', name: 'Amerigo', surname: 'Vespucci', email: 'amerigo2000@outlook.com', fiscalCode: 'ADDS32DSD56HHG', route: 'Piazza Grande 24', city: 'Verona', role: 'user' },
        { id: 'abcfdsds', name: 'Dino', surname: 'Levrieri', email: 'dino@gmail.com', fiscalCode: 'SSSAJKSJAK12DSKL', route: 'Via della Droga 18', city: 'Potenza', role: 'user' },
        { id: 'nssxcndw', name: 'Amerigo', surname: 'Vespucci', email: 'amerigo2000@outlook.com', fiscalCode: 'ADDS32DSD56HHG', route: 'Piazza Grande 24', city: 'Verona', role: 'user' },
        { id: 'abcfdsds', name: 'Dino', surname: 'Levrieri', email: 'dino@gmail.com', fiscalCode: 'SSSAJKSJAK12DSKL', route: 'Via della Droga 18', city: 'Potenza', role: 'user' },
        { id: 'nssxcndw', name: 'Amerigo', surname: 'Vespucci', email: 'amerigo2000@outlook.com', fiscalCode: 'ADDS32DSD56HHG', route: 'Piazza Grande 24', city: 'Verona', role: 'user' },)
    } catch (error) {
      console.error('Errore nel recupero degli utenti:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private generateCSVContent(user: UserWithTransactions): string {
    let csvContent = 'DATI UTENTE\n';
    csvContent += `ID,${user.id}\n`;  // Modificato da user.uid a user.id
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