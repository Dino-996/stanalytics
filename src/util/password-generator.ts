export class PasswordGenerator {

    private chars: string;
    
    public constructor() {
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    }

    public generateSecureRandomPassword(length: number = 12): string {
        let password = '';
        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            const randomIndex = randomValues[i] % this.chars.length;
            password += this.chars[randomIndex];
        }
        return password;
    }
}