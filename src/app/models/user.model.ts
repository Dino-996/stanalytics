export interface User {
  email: string;
  name: string;
  surname: string;
  fiscalCode: string;
  city: string;
  route: string;
  role: 'admin' | 'user';
  photoURL?: string;
}

export interface Transaction {
  date: string;
  amount: string;
  status: 'Completato' | 'Annullato';
}