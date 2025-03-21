import { Component, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseError } from 'firebase/app';
import { bootstrapEye, bootstrapEyeSlash, bootstrapKey } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [NgIcon, FormsModule, ReactiveFormsModule],
  providers: [provideIcons({ bootstrapEye, bootstrapEyeSlash, bootstrapKey })],
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  readonly loginForm: FormGroup;
  public loading: boolean = false;
  public error: string = '';
  public isPassword: boolean = false;

  public constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.formBuilder.group({
      email: ['davide9610@hotmail.com', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['Xilofono.900', [Validators.required, Validators.minLength(6)]],
      isChecked: [false]
    });
  }

  public ngOnInit(): void {
    const savedValue = sessionStorage.getItem('checkboxState');

    if (savedValue !== null) {
      this.loginForm.get('isChecked')?.setValue(savedValue === 'true');
    }

    this.loginForm.get('isChecked')?.valueChanges.subscribe(value => {
      sessionStorage.setItem('checkboxState', value.toString());
    });
  }

  public get email() { return this.loginForm.get('email'); }
  public get password() { return this.loginForm.get('password'); }

  public onPasswordVisible(visible: boolean): void {
    this.isPassword = visible;
  }

  public async onSubmit(): Promise<void> {

    console.log(this.loginForm.value);

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {

      const { email, password } = this.loginForm.value;
      const user = await this.authService.login(email, password);

      if (user.role === 'admin') {
        console.log('Redirezione alla dashboard per amministratori');
        this.router.navigate(['/admin/dashboard']);

      } else {
        console.log('Redirezione alla dashboard per utenti');
        this.router.navigate(['/user/dashboard']);
      }

    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            this.error = 'Email o password non valida';
            break;
          case 'auth/too-many-requests':
            this.error = 'Troppi tentativi falliti. Riprova più tardi';
            break;
          default:
            this.error = 'Si è verificato un errore. Riprova';
            console.error(err);
        }

      } else {
        this.error = 'Si è verificato un errore. Riprova';
        console.error(err);
      }

    } finally {
      this.loading = false;
    }
  }

  public async onForgotPassword(event: Event): Promise<void> {
    event.preventDefault();

    const email = this.email?.value;

    if (!email) {
      this.error = 'Inserisci l\'email per ripristinare la password';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.authService.resetPassword(email);
      this.error = '';
      alert('Email di ripristino inviata con successo! Controlla la tua casella di posta.');
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/user-not-found':
            this.error = 'Nessun account trovato con questa email';
            break;
          case 'auth/invalid-email':
            this.error = 'Email non valida';
            break;
          case 'auth/too-many-requests':
            this.error = 'Troppe richieste. Riprova più tardi';
            break;
          default:
            this.error = 'Si è verificato un errore. Riprova';
            console.error(err);
        }
      } else {
        this.error = 'Si è verificato un errore. Riprova';
        console.error(err);
      }
    } finally {
      this.loading = false;
    }

  }
}
