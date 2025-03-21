export interface User {
  email: string;
  name: string;
  surname: string;
  fiscalCode: string;
  city: string;
  route: string;
  role: 'admin' | 'user';
  photoURL?: string;
  transactions?: Transaction[]
}

export interface Transaction {
  date: string;
  amount: string;
  status: 'Completato' | 'In elaborazione' | 'Annullato';
}