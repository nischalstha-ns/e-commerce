import { db } from '@/lib/firestore/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function completeDataIsolation(tenantId: string) {
  if (!db) throw new Error('Firebase not initialized');
  
  const collections = ['orders', 'categories', 'brands', 'reviews', 'collections', 'carts'];
  
  for (const collectionName of collections) {
    const snapshot = await getDocs(collection(db, collectionName));
    
    for (const document of snapshot.docs) {
      if (!document.data().tenantId) {
        await updateDoc(doc(db, collectionName, document.id), { tenantId });
      }
    }
  }
}
