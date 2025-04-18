import { Injectable } from '@angular/core';
import { addDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { firestore } from '../../environment/firebase';
import { Categoria, Stato, Transazione } from '../model/transazione';


@Injectable({
  providedIn: 'root'
})

export class TransazioneService {

  private transazioniCollections = collection(firestore, 'transazioni');

  constructor() { }

  // Crea una nuova transazione
  public async creaTransazione(transazione: Transazione): Promise<void> {
    await addDoc(this.transazioniCollections, { ...transazione });
  }

  // Ottieni tutte le transazioni
  public async getTransazioni(): Promise<Transazione[]> {
    try {
      const transazioniCollection = collection(firestore, 'transazioni');
      const snapshot = await getDocs(transazioniCollection);

      const transazioni: Transazione[] = snapshot.docs.map(doc => {
        const data = doc.data();

        if (!data || !data['nomeProdotto'] || !data['data'] || !data['prezzo'] || !data['categoria'] || !data['stato'] || !data['idUtente']) {
          console.error(`Documento non valido: ${doc.id}`);
          return {} as Transazione;
        }

        return new Transazione(
          data['nomeProdotto'],
          data['data'].toDate ? data['data'].toDate() : new Date(data['data']),
          data['prezzo'],
          data['categoria'] as Categoria,
          data['stato'] as Stato,
          data['idUtente']
        );
      });

      return transazioni;
    } catch (error) {
      console.error("Errore durante il recupero delle transazioni: ", error);
      throw error;
    }
  }

  // Ottieni una transazi per ID
  public async getTransazioniByUserId(userId: string): Promise<Transazione[]> {
    try {
      const transazioniCollection = collection(firestore, 'transazioni');
      const q = query(
        transazioniCollection,
        where('idUtente', '==', userId)
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(documento => {
        const data = documento.data();

        // Validazione campi obbligatori
        if (!data ||
          !data['nomeProdotto'] ||
          !data['data'] ||
          !data['prezzo'] ||
          !data['categoria'] ||
          !data['stato'] ||
          !data['idUtente']
        ) {
          console.error(`Transazione ${documento.id} non valida, dati mancanti`);
          return null;
        }

        // Conversione sicura della data
        const dataConvertita = data['data'].toDate instanceof Function
          ? data['data'].toDate()
          : new Date(data['data']);

        // Conversione del prezzo a stringa
        const prezzoStringa = typeof data['prezzo'] === 'number'
          ? data['prezzo'].toFixed(2)
          : String(data['prezzo']);

        return new Transazione(
          data['nomeProdotto'],
          dataConvertita,
          prezzoStringa,
          data['categoria'],
          data['stato'],
          data['idUtente']
        );
      }).filter(transazione => transazione !== null) as Transazione[];

    } catch (error) {
      console.error(`Errore nel recupero transazioni per userId ${userId}:`, error);
      throw new Error('Impossibile recuperare le transazioni');
    }
  }

  // Cancella tutte le transazioni collegate ad un account
  public async cancellaTransazioni(id: string): Promise<void> {
    const transazioniCollection = collection(firestore, 'transazioni');
    const q = query(transazioniCollection, where('idUtente', '==', id));

    try {
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => { batch.delete(doc.ref); });

      await batch.commit();

      console.log(`Eliminate ${querySnapshot.size} transazioni per l'utente ${id}`);
    } catch (error) {
      throw new Error('Impossibile eliminare le transazioni dell\'utente');
    }
  }
}
