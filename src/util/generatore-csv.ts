import { Transazione } from "../app/model/transazione";
import { Utente } from "../app/model/utente";

// Esempio di utilizzo
// const contenuto = this.generaFile(utente, transazioni);
// generaFile(contenuto, `dati_${cognome}_${nome}.csv`);

export class GeneratoreCSV {

    public static generaFile(utente: Utente, transazioni: Transazione[]) {
        let contenutoCSV = 'DATI UTENTE \n';
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
                const dataPulita = String(transazione.data).replace(/,/g, ' ');
                const categoriaPulita = String(transazione.categoria).replace(/,/g, ' ');
                const prezzoPulita = String(transazione.prezzo).replace(/,/g, ' ');
                const statoPulito = String(transazione.stato).replace(/,/g, ' ');
                contenutoCSV = `${nomeProdottoPulito},${dataPulita},${categoriaPulita},${statoPulito}\n`;
            });
        } else {
            contenutoCSV += 'Nessuna transazione disponibile\n';
        }
        return contenutoCSV;
    }

    public static scaricaCSV(contenuto: string, nomeFile: string) {
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