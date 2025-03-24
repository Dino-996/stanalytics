export interface User {
  id?: string,
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
  productName: string;
  date: Date;
  amount: string;
  level: 'bronze' | 'silver' | 'gold';
  status: 'Completato' | 'Annullato';
  userId: string;
}