import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firestore/firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { PLANS, PlanName } from '@/lib/saas/tenant';

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { businessName, subdomain, ownerId, plan } = await request.json();

    if (!businessName || !subdomain || !ownerId || !plan || !(plan in PLANS)) {
      return NextResponse.json({ error: 'Invalid tenant payload' }, { status: 400 });
    }

    const existingOwner = await getDoc(doc(db, 'users', ownerId));
    if (!existingOwner.exists()) {
      await setDoc(doc(db, 'users', ownerId), {
        role: 'admin',
        createdAt: serverTimestamp(),
      }, { merge: true });
    }

    const selectedPlan = PLANS[plan as PlanName];
    const created = await addDoc(collection(db, 'tenants'), {
      businessName,
      subdomain,
      ownerId,
      plan,
      status: 'active',
      limits: {
        products: selectedPlan.products,
        orders: selectedPlan.orders,
        users: selectedPlan.users,
      },
      usage: { products: 0, orders: 0, users: 1 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'users', ownerId), {
      role: 'admin',
      tenantId: created.id,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ tenant: { id: created.id } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
