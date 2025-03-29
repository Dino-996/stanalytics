import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { signInWithEmailAndPassword, signOut, User, UserCredential } from 'firebase/auth';
import { auth, firestore } from '../../environment/firebase';
import { doc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  public constructor(private router: Router) { }

  // Effettua login
  public async login(email: string, password: string): Promise<void> {
    try {
      const credenzialiUtente: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const idUtente = credenzialiUtente.user?.uid;
      if (idUtente) {
        const ruolo = await this.getUserRole(idUtente);
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

  // Restituisce il ruolo dell'utente che sta effettuando login
  private async getUserRole(idUtente: string): Promise<string> {
    const documentoUtente = doc(firestore, `utenti/${idUtente}`);
    const snapShot = await getDoc(documentoUtente);
    return snapShot.exists() ? (snapShot.data()?.['ruolo'] || 'Utente') : 'Utente';
  }

}