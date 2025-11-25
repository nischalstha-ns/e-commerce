# 🚀 Quick Start: SaaS Implementation

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Update Environment Variables
Copy `.env.example` to `.env.local` and add:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Step 3: Run Migration (One-Time)
Create a migration page at `app/migrate/page.tsx`:

```typescript
'use client';
import { migrateToMultiTenant } from '@/lib/saas/migration';
import { useAuth } from '@/contexts/AuthContext';

export default function MigratePage() {
  const { user } = useAuth();
  
  const runMigration = async () => {
    if (!user) return alert('Please login first');
    await migrateToMultiTenant(user.uid);
    alert('Migration complete!');
  };
  
  return (
    <div className="p-8">
      <button onClick={runMigration} className="bg-blue-600 text-white px-6 py-3 rounded">
        Run Migration
      </button>
    </div>
  );
}
```

Visit `/migrate` and click the button.

### Step 4: Update Firestore Rules
Copy rules from `SAAS_IMPLEMENTATION.md` to Firebase Console.

### Step 5: Test
```bash
npm run dev
```

Visit:
- `/onboarding` - Create new tenant
- `/billing` - Manage subscription
- `/super-admin` - View all tenants

---

## 🎯 Key Files Created

### Core SaaS Logic
- `lib/saas/tenant.ts` - Tenant management
- `lib/saas/billing.ts` - Stripe integration
- `lib/saas/hooks.ts` - React hooks
- `lib/saas/migration.ts` - Data migration
- `lib/saas/api-wrapper.ts` - Tenant-isolated API

### API Routes
- `app/api/tenants/create/route.ts`
- `app/api/billing/checkout/route.ts`
- `app/api/billing/webhook/route.ts`
- `app/api/billing/portal/route.ts`
- `app/api/billing/cancel/route.ts`

### UI Pages
- `app/onboarding/page.tsx` - Tenant signup
- `app/billing/page.tsx` - Billing dashboard
- `app/super-admin/page.tsx` - Admin panel

### Context & Middleware
- `contexts/TenantContext.tsx` - Tenant state
- `middleware.ts` - Subdomain routing

---

## 📝 Usage Examples

### Check Plan Limits Before Creating Product
```typescript
import { useFeatureAccess } from '@/lib/saas/hooks';
import { useAuth } from '@/contexts/AuthContext';

function CreateProduct() {
  const { tenantId } = useAuth();
  const { canAccess, limitReached } = useFeatureAccess('products');
  
  const handleCreate = async () => {
    if (!canAccess) {
      alert('Product limit reached! Upgrade your plan.');
      return;
    }
    
    await createNewProduct({ 
      data: productData, 
      images, 
      tenantId 
    });
  };
  
  return <button onClick={handleCreate}>Create Product</button>;
}
```

### Show Upgrade Prompt
```typescript
import UpgradePrompt from '@/app/components/UpgradePrompt';

function ProductsPage() {
  return (
    <UpgradePrompt feature="products">
      <ProductList />
    </UpgradePrompt>
  );
}
```

### Load Tenant-Specific Data
```typescript
import { useProducts } from '@/lib/firestore/products/read';
import { useAuth } from '@/contexts/AuthContext';

function ProductList() {
  const { tenantId } = useAuth();
  const { data: products } = useProducts({ tenantId });
  
  return <div>{products.map(p => <ProductCard key={p.id} {...p} />)}</div>;
}
```

---

## 🔧 Modified Files

### Updated for Multi-Tenancy
1. `lib/firestore/products/write.js` - Added `tenantId` parameter
2. `lib/firestore/products/read.js` - Added tenant filtering
3. `contexts/AuthContext.jsx` - Added `tenantId` to context

### New Files
- All files in `lib/saas/`
- All files in `app/api/tenants/`
- All files in `app/api/billing/`
- `app/onboarding/page.tsx`
- `app/billing/page.tsx`
- `app/super-admin/page.tsx`
- `middleware.ts`
- `contexts/TenantContext.tsx`

---

## ✅ Testing Checklist

- [ ] Run migration script
- [ ] Create test tenant via `/onboarding`
- [ ] Create product with `tenantId`
- [ ] Verify tenant isolation (create 2nd tenant)
- [ ] Test plan limits (create 101 products on Basic)
- [ ] Test billing page
- [ ] Test super-admin dashboard
- [ ] Test subdomain routing (requires DNS)

---

## 🚨 Important Notes

1. **Backward Compatibility**: Old code without `tenantId` will fail. Run migration first.

2. **All Create Operations**: Must pass `tenantId`:
```typescript
createNewProduct({ data, images, tenantId })
createNewOrder({ data, tenantId })
createNewCategory({ data, tenantId })
```

3. **All Read Operations**: Must filter by `tenantId`:
```typescript
useProducts({ tenantId })
useOrders({ tenantId })
useCategories({ tenantId })
```

4. **Plan Limits**: Check before creating:
```typescript
if (!canPerformAction(tenant, 'products')) {
  // Show upgrade prompt
}
```

---

## 💰 Revenue Calculator

```
10 tenants × $29 (Basic) = $290/mo
20 tenants × $99 (Pro) = $1,980/mo
5 tenants × $299 (Enterprise) = $1,495/mo
─────────────────────────────────────
Total MRR: $3,765/mo
Annual: $45,180/year
```

---

## 🎉 You're Done!

Your platform is now a full SaaS product with:
✅ Multi-tenancy
✅ Subscription billing
✅ Plan limits
✅ Tenant isolation
✅ Self-service onboarding
✅ Recurring revenue

**Next**: Deploy to Vercel with wildcard domain support.
