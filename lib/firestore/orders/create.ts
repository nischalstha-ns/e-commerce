import { db } from '@/lib/firestore/firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL?: string;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  total: number;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  paymentMethod?: string;
  tenantId?: string;
  shippingAddress?: ShippingAddress;
}

interface CreateOrderFromCartInput {
  userId: string;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  tenantId: string;
}

function buildPaymentFields(paymentMethod: string, total: number) {
  if (paymentMethod === 'cod') {
    return {
      status: 'processing',
      paymentStatus: 'cod',
      codAmount: total,
    };
  }

  return {
    status: 'pending',
    paymentStatus: 'pending',
  };
}

function calcTax(state?: string, subtotal = 0) {
  const rates: Record<string, number> = {
    CA: 0.0725,
    NY: 0.08,
    TX: 0.0625,
    FL: 0.06,
    WA: 0.065,
  };

  return Number((subtotal * (rates[state || ''] || 0)).toFixed(2));
}

export async function createOrder(input: CreateOrderInput) {
  if (!db) throw new Error('Firebase not initialized');

  const subtotal = Number(input.total || 0);
  const shipping = 0;
  const tax = calcTax();
  const total = Number((subtotal + shipping + tax).toFixed(2));
  const paymentMethod = input.paymentMethod || 'cash';

  const orderDoc = {
    userId: input.userId,
    tenantId: input.tenantId || 'tenant_default',
    items: input.items,
    customerInfo: input.customerInfo || {},
    shippingAddress: input.shippingAddress || {},
    subtotal,
    shipping,
    tax,
    total,
    paymentMethod,
    shippingStatus: 'not_shipped',
    orderNumber: `ORD-${Date.now()}`,
    timestampCreate: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...buildPaymentFields(paymentMethod, total),
  };

  const created = await addDoc(collection(db, 'orders'), orderDoc);
  return { success: true, id: created.id };
}

export async function createOrderFromCart(input: CreateOrderFromCartInput) {
  if (!db) throw new Error('Firebase not initialized');

  const cartRef = doc(db, 'carts', input.userId);
  const cartSnap = await getDoc(cartRef);

  const cartItems = (cartSnap.exists() ? (cartSnap.data().items || []) : []) as Array<any>;

  if (!cartItems.length) {
    throw new Error('Cart is empty');
  }

  const items: OrderItem[] = cartItems.map((item) => ({
    productId: item.productId || item.id,
    name: item.name,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    imageURL: item.imageURL || item.image,
  }));

  const subtotal = Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  const shipping = subtotal >= 100 ? 0 : 6.99;
  const tax = calcTax(input.shippingAddress.state, subtotal);
  const total = Number((subtotal + shipping + tax).toFixed(2));
  const paymentMethod = input.paymentMethod || 'card';

  const payload = {
    userId: input.userId,
    tenantId: input.tenantId,
    orderNumber: `ORD-${Date.now()}`,
    items,
    shippingAddress: input.shippingAddress,
    subtotal,
    shipping,
    tax,
    total,
    paymentMethod,
    shippingStatus: 'not_shipped',
    timestampCreate: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...buildPaymentFields(paymentMethod, total),
  };

  const orderRef = await addDoc(collection(db, 'orders'), payload);
  await setDoc(cartRef, { items: [], updatedAt: serverTimestamp() }, { merge: true });

  return { id: orderRef.id, ...payload };
}
