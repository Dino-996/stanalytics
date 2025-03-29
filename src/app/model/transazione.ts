export type Categoria = 'bronze' | 'silver' | 'gold';
export type Stato = 'completato' | 'annullato';
export class Transazione {

    public constructor(
        public nomeProdotto: string,
        public data: Date,
        public prezzo: string,
        public categoria: Categoria,
        public stato: Stato,
        public idUtente: string
    ) 
    { }
    
}