export type Ruolo = 'user' | 'admin';

export class Utente {

    public constructor(
        public email: string,
        public nome: string,
        public cognome: string,
        public codiceFiscale: string,
        public citta: string,
        public indirizzo: string,
        public ruolo: Ruolo,
        public id?: string,
        public fotoURL?: string
    ) { }

}