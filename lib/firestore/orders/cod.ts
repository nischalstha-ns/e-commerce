import { db } from '@/lib/firestore/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

export async function markCODPaid({ id, paidAmount, collectedBy }: { id: string; paidAmount: number; collectedBy: string }) {
  if (!db) throw new Error('Firebase not initialized');
  await updateDoc(doc(db, 'orders', id), {
    paymentStatus: 'paid',
    status: 'delivered',
    codPaidAmount: paidAmount,
    codCollectedBy: collectedBy,
    codPaidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markCODFailed({ id, reason }: { id: string; reason: string }) {
  if (!db) throw new Error('Firebase not initialized');
  await updateDoc(doc(db, 'orders', id), {
    paymentStatus: 'failed',
    status: 'failed',
    codFailReason: reason,
    codFailedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
