import { db } from '@/lib/firestore/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function migrateToMultiTenant(adminUid: string) {
  if (!db) throw new Error('Firebase not initialized');
  
  console.log('Starting migration to multi-tenant...');
  
  const defaultTenantId = 'tenant_default';
  
  try {
    // Step 1: Create default tenant
    console.log('Creating default tenant...');
    await setDoc(doc(db, 'tenants', defaultTenantId), {
      id: defaultTenantId,
      businessName: 'Default Store',
      subdomain: 'default',
      plan: 'enterprise',
      status: 'active',
      ownerId: adminUid,
      limits: { products: -1, orders: -1, users: -1 },
      usage: { products: 0, orders: 0, users: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✓ Default tenant created');
    
    // Step 2: Update all products
    console.log('Migrating products...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    let productCount = 0;
    for (const productDoc of productsSnapshot.docs) {
      await updateDoc(productDoc.ref, { tenantId: defaultTenantId });
      productCount++;
    }
    console.log(`✓ Migrated ${productCount} products`);
    
    // Step 3: Update all orders
    console.log('Migrating orders...');
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    let orderCount = 0;
    for (const orderDoc of ordersSnapshot.docs) {
      await updateDoc(orderDoc.ref, { tenantId: defaultTenantId });
      orderCount++;
    }
    console.log(`✓ Migrated ${orderCount} orders`);
    
    // Step 4: Update all categories
    console.log('Migrating categories...');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    let categoryCount = 0;
    for (const categoryDoc of categoriesSnapshot.docs) {
      await updateDoc(categoryDoc.ref, { tenantId: defaultTenantId });
      categoryCount++;
    }
    console.log(`✓ Migrated ${categoryCount} categories`);
    
    // Step 5: Update all brands
    console.log('Migrating brands...');
    const brandsSnapshot = await getDocs(collection(db, 'brands'));
    let brandCount = 0;
    for (const brandDoc of brandsSnapshot.docs) {
      await updateDoc(brandDoc.ref, { tenantId: defaultTenantId });
      brandCount++;
    }
    console.log(`✓ Migrated ${brandCount} brands`);
    
    // Step 6: Update admin user with tenantId
    console.log('Updating admin user...');
    await updateDoc(doc(db, 'users', adminUid), {
      tenantId: defaultTenantId,
      role: 'admin'
    });
    console.log('✓ Admin user updated');
    
    // Step 7: Update usage counts
    console.log('Updating usage counts...');
    await updateDoc(doc(db, 'tenants', defaultTenantId), {
      'usage.products': productCount,
      'usage.orders': orderCount,
      'usage.users': 1
    });
    console.log('✓ Usage counts updated');
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`\nSummary:
    - Tenant ID: ${defaultTenantId}
    - Products: ${productCount}
    - Orders: ${orderCount}
    - Categories: ${categoryCount}
    - Brands: ${brandCount}
    `);
    
    return {
      success: true,
      tenantId: defaultTenantId,
      counts: { products: productCount, orders: orderCount, categories: categoryCount, brands: brandCount }
    };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function createMigrationScript() {
  return `
// Run this in your browser console or as a Node script
import { migrateToMultiTenant } from '@/lib/saas/migration';

// Replace with your admin user ID
const ADMIN_UID = 'your-admin-uid-here';

migrateToMultiTenant(ADMIN_UID)
  .then(result => console.log('Migration successful:', result))
  .catch(error => console.error('Migration failed:', error));
  `;
}
