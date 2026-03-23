import { db } from '@/lib/firestore/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

export interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<string>;
  update(id: string, data: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
  findWhere(field: string, value: any): Promise<T[]>;
}

export class FirestoreRepository<T extends { id: string }> implements Repository<T> {
  constructor(private collectionName: string) {}

  async findAll(): Promise<T[]> {
    if (!db) throw new Error('Database not initialized');
    
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }

  async findById(id: string): Promise<T | null> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  async create(data: Omit<T, 'id'>): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = await addDoc(collection(db, this.collectionName), data);
    return docRef.id;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    await updateDoc(doc(db, this.collectionName, id), data as any);
  }

  async delete(id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async findWhere(field: string, value: any): Promise<T[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(collection(db, this.collectionName), where(field, '==', value));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }
}

export const createRepository = <T extends { id: string }>(collectionName: string) => 
  new FirestoreRepository<T>(collectionName);