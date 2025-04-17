import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { deleteUser, reauthenticateWithCredential, signInWithEmailAndPassword, signOut, updatePassword, User, verifyBeforeUpdateEmail } from 'firebase/auth';
import { auth, firestore } from '../../environment/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider } from 'firebase/auth/web-extension';
import { UtenteService } from './utente.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private utenteAutenticato = new BehaviorSubject<User | null>(null);
  public utente$ = this.utenteAutenticato.asObservable();

  public constructor(private router: Router, private utenteService: UtenteService) {

    auth.onAuthStateChanged(user => {
      this.utenteAutenticato.next(user);

      if (user) {
        // Salva l'ID utente in localStorage per il recupero alla ricarica
        localStorage.setItem('idUtente', user.uid);
      } else {
        localStorage.removeItem('idUtente');
      }
    });
    this.verificaInizializzazione();
  }

  // Effettua login
  public async login(email: string, password: string): Promise<void> {
    try {
      const credenzialiUtente = await signInWithEmailAndPassword(auth, email, password);
      const utente = await this.utenteService.getUtenteById(credenzialiUtente.user.uid);

      if (utente) {
        this.reindirizzaInBaseAlRuolo(utente.ruolo);
      }
    } catch (error) {
      throw error;
    }
  }

  // Effettua logout
  public async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem('idUtente');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }

  // Ottiene l'utente corrente
  public getUtenteCorrente(): User | null {
    return auth.currentUser;
  }

  // Restituisce l'id dell'utente loggato
  public async getIdUtente() {
    const utente = this.getUtenteCorrente();
    return utente ? utente.uid : 'null';
  }

  // Aggiorna l'Email dell'utente loggato
  public async updateEmail(nuovaEmail: string, password?: string): Promise<void> {
    const utenteCorrente = auth.currentUser;

    if (!utenteCorrente) {
      throw new Error('Nessun utente autenticato');
    }

    try {
      if (password) {
        const credential = EmailAuthProvider.credential(utenteCorrente.email!, password);
        await reauthenticateWithCredential(utenteCorrente, credential);
      }

      await verifyBeforeUpdateEmail(utenteCorrente, nuovaEmail);
      const utente = await this.utenteService.getUtenteById(utenteCorrente.uid);

      if (!utente) {
        throw new Error('Utente non trovato nel database');
      }

      utente.email = nuovaEmail;
      const utenteDocRef = doc(firestore, 'utenti', utenteCorrente.uid);
      await updateDoc(utenteDocRef, { email: nuovaEmail });
    } catch (error) {
      throw error;
    }
  }

  // Aggiorna la password dell'utente loggato
  public async updatePassword(passwordCorrente: string, nuovaPassword: string): Promise<void> {
    const utenteCorrente = auth.currentUser;

    if (utenteCorrente) {
      try {
        const credenziali = EmailAuthProvider.credential(utenteCorrente.email!, passwordCorrente);
        await reauthenticateWithCredential(utenteCorrente, credenziali);
        await updatePassword(utenteCorrente, nuovaPassword);
      } catch (error) { throw error; }

    } else {
      throw 'Nessun utente autenticato';
    }
  }

  // Elimina l'account dell'account loggato
  public async deleteAccount(): Promise<void> {
    const utenteCorrente = auth.currentUser;
    if (utenteCorrente) {
      try {
        await deleteUser(utenteCorrente);
        this.router.navigate(['/login']);
      } catch (error) { throw error; }
    } else {
      throw 'Nessun utente autenticato';
    }
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('idUtente');
  }

  private async verificaInizializzazione(): Promise<void> {
    const idUtente = localStorage.getItem('idUtente');
    if (idUtente) {
      try {
        const utente = await this.utenteService.getUtenteById(idUtente);
        if (utente) {
          this.reindirizzaInBaseAlRuolo(utente.ruolo);
        }
      } catch (error) {
        console.error('Errore durante il recupero dell\'utente:', error);
        this.logout();
      }
    }
  }

  private reindirizzaInBaseAlRuolo(ruolo: string): void {
    if (ruolo === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    }
    if(ruolo === 'user') {
      this.router.navigate(['/user-dashboard']);
    }
  }

}