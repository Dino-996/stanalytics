import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapEyeSlash, bootstrapEye, bootstrapBoxArrowInLeft } from '@ng-icons/bootstrap-icons';
import { auth } from '../../../environment/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { UtenteService } from '../../services/utente.service';
import { Utente } from '../../model/utente';

@Component({
  selector: 'app-login',
  imports: [
    NgIcon,
    ReactiveFormsModule
  ],
  providers: [
    provideIcons({
      bootstrapEyeSlash,
      bootstrapEye,
      bootstrapBoxArrowInLeft
    })
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  info: string | null = null;
  isPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private utenteService: UtenteService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      isChecked: [false, [Validators.requiredTrue]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get isChecked() {
    return this.loginForm.get('isChecked');
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = null;

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.login(email, password);
    } catch (error) {
      this.erroriFirebase(error);
    } finally {
      this.loading = false;
    }
  }

  private erroriFirebase(error: unknown): void {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          this.error = 'Email o password non valida';
          break;
        case 'auth/too-many-request':
          this.error = "Troppe richieste. Riprova più tardi";
          break;
        default:
          this.error = 'Si e\' veerificato un errore. Riprova piu tradi'
      }
    }
  }

  public onPasswordVisible(show: boolean): void {
    this.isPassword = show;
  }

  public async onForgotPassword(event: Event): Promise<void> {
    event.preventDefault();
    const email = this.email?.value;

    if (!email) {
      this.error = 'Inserisci un email per reimpostare la password';
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      this.error = null;
      this.info = 'Email di reset inviata. Controlla la tua casella di posta';
    } catch (error) {
      this.erroriAuth(error);
    }
  }

  private erroriAuth(error: unknown): void {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
          this.error = 'Nessun account trovato per questa email';
          break;
        case 'auth/invalid-email':
          this.error = 'Email non trovata';
          break;
        case 'auth/too-many-request':
          this.error = 'Troppe richieste, riprova piu\' tardi';
          break;
        default:
          this.error = 'Si è verificato un errore. Riprova piu\' tardi';
      }
    } else {
      this.error = 'Si è verificato un errore. Riprova piu\' tardi';
    }
  }

}
