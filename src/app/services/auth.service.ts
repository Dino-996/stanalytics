import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { signInWithEmailAndPassword, signOut, User as firebaseUser, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, DocumentData } from 'firebase/firestore';
import { User } from '../models/user.model';
import { auth, db } from '../../environments/firebase';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  readonly user$: Observable<User | null> = this.userSubject.asObservable();
  private currentFirebaseUser: firebaseUser | null = null;

  public constructor(private router: Router) {
    // Monitora lo stato dell'autenticazione Firebase
    auth.onAuthStateChanged(async (firebaseUser) => {
      this.currentFirebaseUser = firebaseUser;
      if (firebaseUser) {
        // Ottieni i dati estesi dell'utente da Firestore
        const userRef = doc(db, `users/${firebaseUser.uid}`);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as DocumentData;
          const user: User = {
            email: firebaseUser.email || '',
            name: userData['name'],
            surname: userData['surname'],
            fiscalCode: userData['fiscalCode'],
            city: userData['city'],
            route: userData['route'],
            role: userData['role'] || 'user',
            photoURL: firebaseUser.photoURL || userData['photoURL'],
          };
          this.userSubject.next(user);
        } else {
          // Utente esiste in Auth ma non in Firestore
          const newUser: User = {
            email: firebaseUser.email || '',
            name: '',
            surname: '',
            fiscalCode: '',
            city: '',
            route: '',
            role: 'user',
            photoURL: firebaseUser.photoURL || '',
          };
          // Crea documento utente in Firestore
          await setDoc(userRef, newUser);
          this.userSubject.next(newUser);
        }
      } else {
        // Utente non autenticato
        this.userSubject.next(null);
      }
    });
  }

  public async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Ottenere i dati dell'utente completi da Firestore
      const userRef = doc(db, `users/${firebaseUser.uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('User data not found in Firestore');
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
      console.error('Login error:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    await signOut(auth);
    this.router.navigate(['/login']);
  }

  public async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  }

  public getUserId(): string | null {
    if (this.currentFirebaseUser) {
      return this.currentFirebaseUser.uid;
    }
    return auth.currentUser?.uid || null;
  }

  public getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  public isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  public isAdmin(): boolean {
    const user = this.userSubject.value;
    return !!user && user.role === 'admin';
  }

  // Per verificare se un utente è admin in una guard di accesso
  public checkAdminRole(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user && user.role === 'admin')
    );
  }

}