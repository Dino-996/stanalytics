import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { signInWithEmailAndPassword, signOut, User as firebaseUser, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { User } from '../models/user.model';
import { auth, db } from '../../environments/firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();
  private currentFirebaseUser: firebaseUser | null = null;

  private isLoadingSubject = new BehaviorSubject<boolean>(true); // Inizializzato a true
  readonly isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private router: Router) {
    onAuthStateChanged(auth, async (firebaseUser) => {
      this.isLoadingSubject.next(true);
      this.currentFirebaseUser = firebaseUser;

      try {
        if (firebaseUser) {
          const user = await this.loadUserData(firebaseUser);
          this.userSubject.next(user);
        } else {
          this.userSubject.next(null);
        }
      } catch (error) {
        console.error('Errore in onAuthStateChanged:', error);
        this.userSubject.next(null); // Imposta a null in caso di errore
      } finally {
        this.isLoadingSubject.next(false); // Sempre impostato a false
      }
    });
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return await this.loadUserData(userCredential.user);

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  }

  getUserId(): string | null {
    return this.currentFirebaseUser?.uid || auth.currentUser?.uid || null;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  isAdmin(): boolean {
    const user = this.userSubject.value;
    return !!user && user.role === 'admin';
  }

  checkAdminRole(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user && user.role === 'admin')
    );
  }

  private async loadUserData(firebaseUser: firebaseUser): Promise<User> {
    try {
      const userRef = doc(db, `users/${firebaseUser.uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return {
          email: firebaseUser.email || '',
          name: '',
          surname: '',
          fiscalCode: '',
          city: '',
          route: '',
          role: 'user',
          photoURL: firebaseUser.photoURL || '',
        };
      }

      const userData = userSnap.data() as DocumentData;
      return {
        email: firebaseUser.email || '',
        name: userData['name'],
        surname: userData['surname'],
        fiscalCode: userData['fiscalCode'],
        city: userData['city'],
        route: userData['route'],
        role: userData['role'] || 'user',
        photoURL: firebaseUser.photoURL || userData['photoURL'],
      };
    } catch (error) {
      console.error("Errore durante il caricamento dei dati utente", error);
      throw error; // Rilancia l'errore
    }
  }
}