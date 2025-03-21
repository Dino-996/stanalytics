import { Component, inject, signal, TemplateRef, WritableSignal, OnInit, HostListener } from '@angular/core';
import { NgbAlert, NgbAlertConfig, NgbNavModule, ModalDismissReasons, NgbModal, NgbModalRef, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { db, auth } from '../../../environments/firebase';
import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapPeopleFill, bootstrapPersonFillAdd, bootstrapPersonFillDash, bootstrapPersonFillGear, bootstrapExclamationTriangleFill, bootstrapCaretRightFill, bootstrapArrowClockwise } from '@ng-icons/bootstrap-icons';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-account',
  standalone: true,
  imports: [
    CommonModule, NgbNavModule, NgbAlert, NgbPagination, ReactiveFormsModule, NgIcon,
  ],
  providers: [
    provideIcons({
      bootstrapPeopleFill, bootstrapPersonFillAdd, bootstrapPersonFillDash, bootstrapPersonFillGear, bootstrapExclamationTriangleFill, bootstrapCaretRightFill, bootstrapArrowClockwise
    }),
    NgbAlertConfig
  ],
  templateUrl: './admin-account.component.html',
  styleUrl: './admin-account.component.scss'
})

export class AdminAccountComponent implements OnInit {
  // Form groups
  public addAccountForm: FormGroup;
  public editAccountForm: FormGroup;

  // Stato UI
  public active = 1;
  public loading = false;
  public error = '';
  public close = false;
  public editError = '';
  public editClose = false;

  // Data
  public users: User[] = [];
  public selectedUser: User | null = null;
  public userToDelete: User | null = null;

  // Modal
  private modalService = inject(NgbModal);
  private modalRef!: NgbModalRef;
  public closeResult: WritableSignal<string> = signal('');

  // Pagination
  public page:number = 1;
  public pageSize:number = 3;
  public maxSize:number = 5;

  // Configuarzione campi form
  readonly formFields = {
    addAccount: {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      fiscalCode: ['', Validators.required],
      city: ['', Validators.required],
      route: ['', Validators.required],
      role: ['user', Validators.required],
      photoURL: ['']
    },
    editAccount: {
      userSelect: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      fiscalCode: ['', Validators.required],
      city: ['', Validators.required],
      route: ['', Validators.required],
      role: ['user', Validators.required],
      photoURL: ['']
    }
  };

  public constructor(
    private fb: FormBuilder,
    private alertConfig: NgbAlertConfig
  ) {
    this.addAccountForm = this.fb.group(this.formFields.addAccount);
    this.editAccountForm = this.fb.group(this.formFields.editAccount);
    this.alertConfig.dismissible = false;
  }

  public async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  // Getters per form controls - separati per tipo di form
  public get email() { return this.addAccountForm.get('email'); }
  public get password() { return this.addAccountForm.get('password'); }
  public get name() { return this.addAccountForm.get('name'); }
  public get surname() { return this.addAccountForm.get('surname'); }
  public get fiscalCode() { return this.addAccountForm.get('fiscalCode'); }
  public get city() { return this.addAccountForm.get('city'); }
  public get route() { return this.addAccountForm.get('route'); }
  public get role() { return this.addAccountForm.get('role'); }
  public get photoURL() { return this.addAccountForm.get('photoURL'); }

  // Edit account form getters
  public get editEmail() { return this.editAccountForm.get('email'); }
  public get editName() { return this.editAccountForm.get('name'); }
  public get editSurname() { return this.editAccountForm.get('surname'); }
  public get editFiscalCode() { return this.editAccountForm.get('fiscalCode'); }
  public get editCity() { return this.editAccountForm.get('city'); }
  public get editRoute() { return this.editAccountForm.get('route'); }
  public get editRole() { return this.editAccountForm.get('role'); }
  public get editPhotoURL() { return this.editAccountForm.get('photoURL'); }

  // Azioni utente
  public async onSubmit(): Promise<void> {
    if (!this.addAccountForm.valid) {
      return;
    }

    this.setLoading(true);
    this.error = '';

    try {
      await this.createUser(this.addAccountForm.value);
      this.resetAddForm();
      await this.loadUsers();
      this.showSuccessMessage('add');
    } catch (error) {
      this.handleError(error, 'add');
    } finally {
      this.setLoading(false);
    }
  }

  public async onEditSubmit(): Promise<void> {
    if (!this.editAccountForm.valid || !this.selectedUser) {
      return;
    }

    this.setLoading(true);
    this.editError = '';

    try {
      await this.updateUser(this.selectedUser, this.editAccountForm.value);
      this.resetEditForm();
      await this.loadUsers();
      this.showSuccessMessage('edit');
    } catch (error) {
      this.handleError(error, 'edit');
    } finally {
      this.setLoading(false);
    }
  }

  public async deleteUser(uid: string): Promise<void> {
    this.setLoading(true);
    this.modalRef.close();
    try {
      await this.removeUser(uid);
      this.users = this.users.filter(user => this.getUserId(user) !== uid);
    } catch (error) {
      this.handleError(error, 'delete');
    } finally {
      this.setLoading(false);
    }
  }

  public onUserSelectChange(event: any): void {
    const selectedUserId = event.target.value;
    this.selectedUser = this.users.find(user => this.getUserId(user) === selectedUserId) || null;

    if (this.selectedUser) {
      this.populateEditForm(this.selectedUser);
    }
  }

  public getUserId(user: User): string {
    return (user as any).id || '';
  }

  // Apre il modal
  public open(content: TemplateRef<any>) {
    this.modalRef = this.modalService.open(content);
  }

  // Metodi di paginazione
  public paginatedUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  };

  @HostListener('keydown.enter', ['$event'])
  public handleEnter(event: KeyboardEvent) {
    
    event.preventDefault();

    if (this.active === 1 && this.addAccountForm.valid) {
      this.onSubmit();
    } else if (this.active === 2 && this.editAccountForm.valid) {
      this.onEditSubmit();
    } else if (this.active === 3 && this.userToDelete) {
      const deleteButton = document.querySelector(`button[data-user-id="${this.getUserId(this.userToDelete)}"]`);
    if (deleteButton) {
      (deleteButton as HTMLButtonElement).click();
    }
    }
  }

  // Metodi privati - separati per responsabilità
  private async loadUsers(): Promise<void> {
    try {
      this.users = await this.getAllUsers();
    } catch (error) {
      console.error('Errore nel caricamento degli utenti:', error);
      this.users = [];
    }
  }

  private async getAllUsers(): Promise<User[]> {
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('role', '==', 'user'));
      const usersSnapshot = await getDocs(q);

      return usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as unknown as User));
    } catch (error) {
      console.error('Errore nel recupero degli utenti:', error);
      return [];
    }
  }

  private async createUser(userData: any): Promise<void> {
    const { email, password, ...otherData } = userData;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDataForFirestore = {
      ...otherData,
      email,
      transactions: []
    };

    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, userDataForFirestore);
  }

  private async updateUser(user: User, userData: any): Promise<void> {
    const { email, userSelect, ...otherData } = userData;
    const userRef = doc(db, 'users', this.getUserId(user));
    await updateDoc(userRef, { ...otherData, email });
  }

  private async removeUser(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  }

  private resetAddForm(): void {
    this.addAccountForm.reset();
    this.addAccountForm.patchValue({ role: 'user' });
  }

  private resetEditForm(): void {
    this.editAccountForm.reset();
    this.selectedUser = null;
  }

  private populateEditForm(user: User): void {
    this.editAccountForm.patchValue({
      email: user.email,
      name: user.name,
      surname: user.surname,
      fiscalCode: user.fiscalCode,
      city: user.city,
      route: user.route,
      role: user.role,
      photoURL: user.photoURL
    });
  }

  private setLoading(isLoading: boolean): void {
    this.loading = isLoading;
  }

  private showSuccessMessage(formType: 'add' | 'edit'): void {
    if (formType === 'add') {
      this.close = true;
      setTimeout(() => { this.close = false; }, 5000);
    } else {
      this.editClose = true;
      setTimeout(() => { this.editClose = false; }, 5000);
    }
  }

  private handleError(error: unknown, formType: 'add' | 'edit' | 'delete'): void {
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';

    if (formType === 'add') {
      this.error = `Errore durante l'aggiunta dell'utente: ${errorMessage}`;
    } else if (formType === 'edit') {
      this.editError = `Errore durante la modifica dell'utente: ${errorMessage}`;
    } else {
      this.error = `Errore durante l'eliminazione: ${errorMessage}`;
    }

    console.error('Errore:', error);
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
}