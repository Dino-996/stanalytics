import { Component, HostListener, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseError } from 'firebase/app';
import { bootstrapEye, bootstrapEyeSlash, bootstrapBoxArrowInLeft } from '@ng-icons/bootstrap-icons';

interface LoginFormModel {
  email: string;
  password: string;
  isChecked: boolean;
}

enum ErrorCodes {
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  INVALID_CREDENTIAL = 'auth/invalid-credential',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',
  INVALID_EMAIL = 'auth/invalid-email'
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [NgIcon, FormsModule, ReactiveFormsModule],
  providers: [provideIcons({ bootstrapEye, bootstrapEyeSlash, bootstrapBoxArrowInLeft })],
  styleUrls: ['./login.component.css'],
  standalone: true
})

export class LoginComponent implements OnInit {

  // Costanti
  private readonly CHECKBOX_STORAGE_KEY = 'checkboxState';
  private readonly EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Form e stato
  public loginForm: FormGroup;
  public loading = false;
  public error = '';
  public isPassword = false;

  public constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.initializeForm();
  }

  public ngOnInit(): void {
    this.restoreCheckboxState();
    this.setupCheckboxPersistence();
  }

  // Getters for form controls
  public get email() { return this.loginForm.get('email'); }
  public get password() { return this.loginForm.get('password'); }
  public get isChecked() { return this.loginForm.get('isChecked'); }

  public onPasswordVisible(visible: boolean): void {
    this.isPassword = visible;
  }

  public async onSubmit(): Promise<void> {
    // Verifica se il form è valido
    if (this.loginForm.invalid) {
      return;
    }

    // Verifica se l'utente ha accettato i termini e condizioni
    const formValues = this.loginForm.value as LoginFormModel;
    if (!formValues.isChecked) {
      this.error = 'Devi accettare termini&condizioni per continuare';
      return;
    }

    this.startLoading();

    try {
      const { email, password } = formValues;
      const user = await this.authService.login(email, password);
      this.navigateBasedOnRole(user.role);
    } catch (err) {
      this.handleError(err);
    } finally {
      this.stopLoading();
    }
  }

  public async onForgotPassword(event: Event): Promise<void> {
    event.preventDefault();

    const email = this.email?.value;
    if (!email) {
      this.error = 'Inserisci l\'email per ripristinare la password';
      return;
    }

    this.startLoading();

    try {
      await this.authService.resetPassword(email);
      this.error = '';
      alert('Ti è stata inviata un\'email di ripristino! Controlla la tua casella di posta');
    } catch (err) {
      this.handlePasswordResetError(err);
    } finally {
      this.stopLoading();
    }
  }

  //Azioni da tastiera
  @HostListener('keydown.enter', ['$event'])
  public handleEnter(event: KeyboardEvent) { 
    this.onSubmit();
  }

  // Metodi privati
  private initializeForm(): FormGroup {
    return this.formBuilder.group({
      email: ['carletto1997@hotmail.com', [Validators.required, Validators.pattern(this.EMAIL_PATTERN)]],
      password: ['Xilofono.900', Validators.required],
      isChecked: [false, [Validators.requiredTrue]]
    });
  }

  private restoreCheckboxState(): void {
    const savedValue = sessionStorage.getItem(this.CHECKBOX_STORAGE_KEY);
    if (savedValue !== null) {
      this.loginForm.get('isChecked')?.setValue(savedValue === 'true');
    }
  }

  private setupCheckboxPersistence(): void {
    this.loginForm.get('isChecked')?.valueChanges.subscribe(value => {
      sessionStorage.setItem(this.CHECKBOX_STORAGE_KEY, value.toString());
    });
  }

  private startLoading(): void {
    this.loading = true;
    this.error = '';
  }

  private stopLoading(): void {
    this.loading = false;
  }

  private navigateBasedOnRole(role: string): void {
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private handleError(err: unknown): void {
    if (err instanceof FirebaseError) {
      this.handleFirebaseError(err);
    } else {
      this.handleGenericError(err);
    }
  }

  private handleFirebaseError(err: FirebaseError): void {
    switch (err.code) {
      case ErrorCodes.USER_NOT_FOUND:
      case ErrorCodes.WRONG_PASSWORD:
      case ErrorCodes.INVALID_CREDENTIAL:
        this.error = 'Email o password non valida';
        break;
      case ErrorCodes.TOO_MANY_REQUESTS:
        this.error = 'Troppi tentativi falliti. Riprova più tardi';
        break;
      default:
        this.error = 'Si è verificato un errore. Riprova';
        console.error(err);
    }
  }

  private handlePasswordResetError(err: unknown): void {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case ErrorCodes.USER_NOT_FOUND:
          this.error = 'Nessun account trovato con questa email';
          break;
        case ErrorCodes.INVALID_EMAIL:
          this.error = 'Email non valida';
          break;
        case ErrorCodes.TOO_MANY_REQUESTS:
          this.error = 'Troppe richieste. Riprova più tardi';
          break;
        default:
          this.error = 'Si è verificato un errore. Riprova';
          console.error(err);
      }
    } else {
      this.handleGenericError(err);
    }
  }

  private handleGenericError(err: unknown): void {
    this.error = 'Si è verificato un errore. Riprova';
    console.error(err);
  }
}