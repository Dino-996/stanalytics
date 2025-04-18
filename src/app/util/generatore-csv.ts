import { Transazione } from "../model/transazione";
import { Utente } from '../model/utente';

export class GeneratoreCSV {
    /**
     * Genera il contenuto del file CSV a partire dai dati dell'utente e delle transazioni
     * @param utente Oggetto Utente con i dati personali
     * @param transazioni Array di oggetti Transazione
     * @returns Stringa contenente i dati in formato CSV
     */
    public static generaFile(utente: Utente, transazioni: Transazione[]): string {
        let contenutoCSV = 'DATI UTENTE\n';
        contenutoCSV += `ID,${utente.id}\n`;
        contenutoCSV += `Nome,${utente.nome}\n`;
        contenutoCSV += `Cognome,${utente.cognome}\n`;
        contenutoCSV += `Email,${utente.email}\n`;
        contenutoCSV += `Codice fiscale,${utente.codiceFiscale}\n`;
        contenutoCSV += `Citta,${utente.citta}\n`;
        contenutoCSV += `Indirizzo,${utente.indirizzo}\n`;
        contenutoCSV += `\n`;
        contenutoCSV += `TRANSAZIONI\n`;
        contenutoCSV += `Pacchetto,Data,Categoria,Prezzo,Stato\n`;

        if (transazioni?.length) {
            transazioni.forEach((transazione) => {
                const nomeProdottoPulito = String(transazione.nomeProdotto).replace(/,/g, ' ');
                const dataPulita = new Intl.DateTimeFormat('it-IT', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    hour12: false,
                    timeZone: 'Europe/Rome'
                }).format(new Date(transazione.data));
                const categoriaPulita = String(transazione.categoria).replace(/,/g, ' ');
                const prezzoPulito = String(transazione.prezzo).replace(/,/g, ' ');
                const statoPulito = String(transazione.stato).replace(/,/g, ' ');

                contenutoCSV += `${nomeProdottoPulito},${dataPulita},${categoriaPulita},${prezzoPulito},${statoPulito}\n`;
            });
        } else {
            contenutoCSV += 'Nessuna transazione disponibile\n';
        }

        return contenutoCSV;
    }

    /**
     * Scarica il file CSV nel browser
     * @param contenuto Stringa contenente i dati in formato CSV
     * @param nomeFile Nome del file da scaricare
     */
    public static scaricaCSV(contenuto: string, nomeFile: string): void {
        const blob = new Blob([contenuto], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', nomeFile);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}