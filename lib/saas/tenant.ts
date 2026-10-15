"use client";

import { db } from "@/lib/firestore/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";

export interface TenantUsage {
  products?: number;
  orders?: number;
  users?: number;
  storage?: number;
}

export interface TenantLimits {
  products?: number;
  orders?: number;
  users?: number;
  storage?: number;
}

export interface Tenant {
  id: string;
  name?: string;
  subdomain?: string;
  plan?: string;
  status?: string;
  usage?: TenantUsage;
  limits?: TenantLimits;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

export async function listTenants(): Promise<Tenant[]> {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, "tenants"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tenant));
}

export async function updateTenantPlan(tenantId: string, plan: string) {
  if (!db) throw new Error("Database unavailable");
  await updateDoc(doc(db, "tenants", tenantId), {
    plan,
    updatedAt: new Date().toISOString(),
  });
  return { success: true };
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  products: number; // -1 = unlimited
  orders: number; // -1 = unlimited
  users: number; // -1 = unlimited
  features: string[];
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    products: 20,
    orders: 100,
    users: 1,
    features: ["Up to 20 products", "Basic analytics", "Community support"],
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 9,
    products: 200,
    orders: 1000,
    users: 3,
    features: ["Up to 200 products", "Order management", "Email support"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 29,
    products: -1,
    orders: -1,
    users: 10,
    features: ["Unlimited products", "Advanced analytics", "Priority support", "Custom domain"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    products: -1,
    orders: -1,
    users: -1,
    features: ["Everything in Pro", "Dedicated manager", "SLA", "Custom integrations"],
  },
};

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  if (!db) return null;
  const { doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "tenants", tenantId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Tenant;
}

/** Check whether a tenant can perform an action within its plan limits. */
export function canPerformAction(
  tenant: Tenant,
  feature: "products" | "orders" | "users"
): boolean {
  const plan = PLANS[tenant.plan || "free"] || PLANS.free;
  const limit = plan[feature];
  if (limit === -1) return true;
  const used = tenant.usage?.[feature] ?? 0;
  return used < limit;
}
