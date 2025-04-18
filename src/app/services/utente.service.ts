import { Injectable } from '@angular/core';
import { Utente } from '../model/utente';
import { auth, firestore } from '../../environment/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { PasswordGenerator } from '../util/password-generator';
import { Email } from '../util/email';

@Injectable({
  providedIn: 'root'
})

export class UtenteService {

  private utentiCollection = collection(firestore, 'utenti');
  private generaEmail = new Email();

  /** Restituisce tutti gli utenti del db */
  public async getUtenti(): Promise<Utente[]> {
    const snapshot = await getDocs(this.utentiCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Utente);
  }

  // Restituisce un utente del db in base all'id
  public async getUtenteById(id: string): Promise<Utente | null> {
    const docRef = doc(firestore, `utenti/${id}`);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return new Utente(
        data['email'],
        data['nome'],
        data['cognome'],
        data['codiceFiscale'],
        data['citta'],
        data['indirizzo'],
        data['ruolo'],
        snapshot.id,
        data['fotoURL']
      );
    }
    return null;
  }

  // Crea un nuovo utente nel db
  public async createUtente(utente: Utente): Promise<string> {

    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generateSecureRandomPassword(16);

    await this.generaEmail.inviaEmail('infostanalytics@gmail.com', password);

    const userAuth = await createUserWithEmailAndPassword(auth, utente.email, password);
    const uid = userAuth.user.uid;

    const utenteDoc = doc(firestore, `utenti/${uid}`);
    await setDoc(utenteDoc, {
      ...utente,
      id: uid
    });

    return uid;
  }

  // Aggiorna un utente esistente nel db
  public async updateUtente(id: string, utente: Partial<Utente>): Promise<void> {
    const utenteDoc = doc(firestore, `utenti/${id}`);

    try {
      await updateDoc(utenteDoc, utente);
      console.log("Utente aggiornato con successo!");
    } catch (error) {
      throw "Errore durante l'aggiornamento dell'utente: " + error;
    }
  }

  // Elimina un utente nel db in base all'id
  public async deleteUtente(id: string): Promise<void> {
    try {
      const utenteDoc = doc(firestore, `utenti/${id}`);
      await deleteDoc(utenteDoc);
    } catch (error) {
      throw "Errore durante l'eliminazione dell'utente: " + error;
    }
  }

}
