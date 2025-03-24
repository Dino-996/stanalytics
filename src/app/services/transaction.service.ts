import { Injectable } from '@angular/core';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../environments/firebase';
import { AuthService } from './auth.service';
import { Transaction } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class TransactionService {

  public constructor(private authService: AuthService) { }

  public async getUserTransactions(): Promise<Transaction[]> {
    try {
      const userId = this.authService.getUserId();

      if (!userId) {
        throw new Error('Utente non autenticato');
      }

      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, where('userId', '==', userId));

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Gestione della data (potrebbe essere un Timestamp di Firestore)
        let formattedDate = data['date'];
        if (data['date'] instanceof Timestamp) {
          formattedDate = data['date'].toDate().toISOString();
        }

        return {
          id: doc.id,
          userId: data['userId'],
          productName: data['productName'],
          level: data['level'],
          date: formattedDate,
          amount: data['amount'],
          package: data['package'],
          status: data['status']
        } as Transaction;
      });

    } catch (err) {

      console.error('Errore nel caricamento delle transazioni:', err);
      throw err;
    }
  }

  public async loadTransactionsByUserId(userId: string): Promise<Transaction[]> {
    if (!this.authService.isAdmin()) {
      throw new Error('Operazione non autorizzata');
    }

    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'],
          productName: data['productName'],
          level: data['level'],
          date: data['date'] instanceof Timestamp ? data['date'].toDate().toISOString() : data['date'],
          amount: data['amount'],
          package: data['package'],
          status: data['status']
        } as Transaction;
      });
    } catch (err) {
      console.error('Errore nel caricamento delle transazioni per ID utente:', err);
      throw err;
    }
  }

  public async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const transactionRef = doc(db, `transactions/${transactionId}`);
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) {
        return null;
      }

      const data = transactionSnap.data();
      const userId = this.authService.getUserId();

      // Verifica che l'utente possa accedere a questa transazione
      if (data['userId'] !== userId && !this.authService.isAdmin()) {
        throw new Error('Accesso non autorizzato alla transazione');
      }

      return {
        id: transactionSnap.id,
        userId: data['userId'],
        productName: data['productName'],
        level: data['level'],
        date: data['date'] instanceof Timestamp ? data['date'].toDate().toISOString() : data['date'],
        amount: data['amount'],
        package: data['package'],
        status: data['status']
      } as Transaction;
    } catch (err) {
      console.error('Errore nel recupero della transazione:', err);
      throw err;
    }
  }

  public async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const userId = this.authService.getUserId();
      if (!userId) {
        throw new Error('Utente non autenticato');
      }

      transaction.userId = userId;

      if (!transaction.date) {
        transaction.date = new Date();
      }

      const transactionsRef = collection(db, 'transactions');
      const docRef = await addDoc(transactionsRef, transaction);

      return docRef.id;
    } catch (err) {
      console.error('Errore nella creazione della transazione:', err);
      throw err;
    }
  }

  public async updateTransactionStatus(transactionId: string, status: 'Completato' | 'Annullato'): Promise<void> {
    if (!this.authService.isAdmin()) {
      throw new Error('Operazione non autorizzata');
    }

    try {
      const transactionRef = doc(db, `transactions/${transactionId}`);
      await updateDoc(transactionRef, { status });
    } catch (err) {
      console.error('Errore nell\'aggiornamento dello stato della transazione:', err);
      throw err;
    }
  }


  public async deleteTransaction(transactionId: string): Promise<void> {
    if (!this.authService.isAdmin()) {
      throw new Error('Operazione non autorizzata');
    }

    try {
      const transactionRef = doc(db, `transactions/${transactionId}`);
      await deleteDoc(transactionRef);
    } catch (err) {
      console.error('Errore nell\'eliminazione della transazione:', err);
      throw err;
    }
  }
}