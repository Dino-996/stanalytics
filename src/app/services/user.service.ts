import { Injectable } from '@angular/core';
import { db, auth } from '../../environments/firebase';
import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor() { }

  public async createUser(email: string, password: string, userData: any): Promise<string> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDataForFirestore = {
      ...userData,
      email,
    };

    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, userDataForFirestore);
    
    return uid;
  }

  public async updateUser(uid: string, userData: any): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, userData);
  }

  public async deleteUser(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  }

  public async getAllUsers(): Promise<User[]> {
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
}