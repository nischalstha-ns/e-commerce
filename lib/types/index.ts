/**
 * User interface representing authenticated users
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'customer';
  timestampCreate?: FirebaseTimestamp;
  timestampUpdate?: FirebaseTimestamp;
}

/**
 * Firebase Timestamp type
 */
export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

/**
 * Product interface for e-commerce items
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  categoryId: string;
  brandId?: string;
  imageURLs: string[];
  status: ProductStatus;
  timestampCreate: FirebaseTimestamp;
  timestampUpdate: FirebaseTimestamp;
}

export type ProductStatus = 'active' | 'inactive' | 'draft';

/**
 * Category interface for product organization
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageURL: string;
  timestampCreate: FirebaseTimestamp;
}

/**
 * Order interface for customer purchases
 */
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  timestampCreate: FirebaseTimestamp;
  timestampUpdate: FirebaseTimestamp;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}