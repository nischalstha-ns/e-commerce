# Supabase Storage Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login (free account)
3. Click "New Project"
4. Fill in:
   - Project Name: `nischal-fancy-store`
   - Database Password: (generate strong password)
   - Region: Choose closest to you
5. Click "Create new project"

## Step 2: Get API Keys

1. Go to Project Settings (gear icon)
2. Click "API" in sidebar
3. Copy these values to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Create Storage Bucket

1. Go to "Storage" in left sidebar
2. Click "New bucket"
3. Bucket name: `images`
4. Make it **Public** (toggle on)
5. Click "Create bucket"

## Step 4: Set Storage Policies

1. Click on `images` bucket
2. Go to "Policies" tab
3. Click "New Policy"
4. Add these policies:

### Policy 1: Public Read
```sql
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
```

### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
```

### Policy 3: Authenticated Delete
```sql
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

## Step 5: Update .env.local

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
NEXT_PUBLIC_IMAGE_PROVIDER="supabase"
```

## Step 6: Restart Dev Server

```bash
npm run dev
```

## Free Tier Limits

- ✅ 1GB Storage
- ✅ 2GB Bandwidth/month
- ✅ Unlimited API requests
- ✅ No credit card required

## Folder Structure

Images will be organized as:
- `users/{userId}/` - Profile photos
- `products/{productId}/` - Product images
- `categories/{categoryId}/` - Category images

## Done! 🎉

Your app now uses Supabase Storage instead of Cloudinary.
