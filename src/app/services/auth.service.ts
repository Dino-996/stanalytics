import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { deleteUser, reauthenticateWithCredential, sendEmailVerification, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, User, UserCredential, verifyBeforeUpdateEmail } from 'firebase/auth';
import { auth, firestore } from '../../environment/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider } from 'firebase/auth/web-extension';
import { UtenteService } from './utente.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  public constructor(private router: Router, private utenteService: UtenteService) { }

  // Effettua login
  public async login(email: string, password: string): Promise<void> {
    try {
      const credenzialiUtente: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const idUtente = credenzialiUtente.user?.uid;
      if (idUtente) {
        const ruolo = await this.getRuoloUtente(idUtente);
        if (ruolo === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // Effettua logout
  public async logout(): Promise<void> {
    await signOut(auth);
    this.router.navigate(['/login']);
  }

  // Ottiene l'utente corrente
  public getUtenteCorrente() {
    return auth.currentUser;
  }

  // Restituisce l'id dell'utente loggato
  public async getIdUtente() {
    const utente = this.getUtenteCorrente();
    return utente ? utente.uid : 'null';
  }

  // Restituisce il ruolo dell'utente che ha effettuato il login
  private async getRuoloUtente(idUtente: string): Promise<string> {
    const documentoUtente = doc(firestore, `utenti/${idUtente}`);
    const snapShot = await getDoc(documentoUtente);
    return snapShot.exists() ? (snapShot.data()?.['ruolo'] || 'Utente') : 'Utente';
  }

  // Aggiorna l'Email dell'utente loggato
  public async updateEmail(nuovaEmail: string): Promise<void> {
    const utenteCorrente = auth.currentUser;

    if (!utenteCorrente) {
      throw new Error('Nessun utente autenticato');
    }

    try {

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

}