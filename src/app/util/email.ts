import emailjs from '@emailjs/browser';

export class Email {

    private serviceId = 'stanalytics';
    private templateId = 'template_stanalytics';
    private publicKey = 's582R50W4KplHYDns';

    public constructor() {
        emailjs.init(this.publicKey);
    }

    public async inviaEmail(email: string, password: string ): Promise<void> {
        const params = {
            email: email,
            password: password
        };
        return emailjs.send(this.serviceId, this.templateId, params)
            .then(() => { console.log(`Email inviata correttamente: ${{ params }}`) })
            .catch(error => console.error('Errore nell\'invio dell\'email'));
    }

}