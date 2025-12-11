# 🚀 Setup Guide - Nischal Fancy Store

## ✅ All Issues Fixed

### 1. ✅ Removed Hardcoded Firebase Credentials
- All credentials now come from `.env.local` only
- No fallback values in code

### 2. ✅ Enabled React Strict Mode
- `reactStrictMode: true` in `next.config.js`
- Better development warnings and error detection

### 3. ✅ Added Server-Side Authorization
- New `middleware.ts` for route protection
- API authentication checks
- Admin route guards

### 4. ✅ Implemented Redis Rate Limiting
- Redis support with automatic fallback to in-memory
- Distributed rate limiting for production
- No breaking changes if Redis not available

---

## 📋 Quick Setup

### Step 1: Environment Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Firebase credentials in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_actual_auth_domain
# ... etc
```

3. Add Cloudinary credentials:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_SECRET=your_secret
```

### Step 2: Install Dependencies

```bash
npm install
```

**Optional:** Install Redis for production rate limiting:
```bash
npm install redis
```

### Step 3: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create/Select your project
3. Copy credentials to `.env.local`
4. Update Firestore Rules (see README.md)
5. Set admin role in Firestore:
   - Go to Firestore Database
   - Find your user in `users` collection
   - Add field: `role: "admin"`

### Step 4: Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🔧 Optional: Redis Setup (Production)

### Local Redis (Development)
```bash
# Install Redis
# Windows: Download from https://redis.io/download
# Mac: brew install redis
# Linux: sudo apt-get install redis

# Start Redis
redis-server

# Add to .env.local
REDIS_URL=redis://localhost:6379
```

### Cloud Redis (Production)
Use services like:
- **Upstash** (Recommended - Free tier)
- **Redis Cloud**
- **AWS ElastiCache**

Add connection URL to `.env.local`:
```env
REDIS_URL=redis://your-redis-url:6379
REDIS_PASSWORD=your_password
```

---

## 🗑️ Removed Files

The following files have been consolidated into `.env.local`:
- ❌ `.env.development` (merged)
- ❌ Multiple config files (consolidated)

**Single source of truth:** `.env.local`

---

## 🔐 Security Features

### Now Implemented:
✅ No hardcoded credentials  
✅ Server-side authorization middleware  
✅ Redis rate limiting (with fallback)  
✅ React Strict Mode enabled  
✅ CSRF protection  
✅ Input sanitization  
✅ Firestore security rules  

---

## 📦 Production Deployment

### Environment Variables (Required)
Set these in your hosting platform:

**Firebase:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Cloudinary:**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `CLOUDINARY_API_SECRET`

**Redis (Recommended):**
- `REDIS_URL`
- `REDIS_PASSWORD`

### Build Commands
```bash
npm run build
npm run start
```

---

## 🎯 What's New

### File Structure:
```
├── .env.local              # ✅ Single config file (create this)
├── .env.example            # ✅ Updated template
├── middleware.ts           # ✅ NEW - Server auth
├── lib/utils/redis.ts      # ✅ NEW - Redis rate limiting
└── lib/firestore/firebase.ts # ✅ FIXED - No hardcoded values
```

---

## ✅ Verification Checklist

- [ ] `.env.local` created with all credentials
- [ ] Firebase credentials added
- [ ] Cloudinary credentials added
- [ ] `npm install` completed
- [ ] Firebase admin user created
- [ ] Firestore rules updated
- [ ] Development server running
- [ ] Can login as admin
- [ ] Can access admin panel

---

## 🆘 Troubleshooting

### Issue: "Firebase not initialized"
**Solution:** Check `.env.local` has all Firebase variables

### Issue: "Access Denied" in admin panel
**Solution:** Set `role: "admin"` in Firestore users collection

### Issue: Rate limiting not working
**Solution:** Redis is optional - in-memory fallback works automatically

### Issue: Build errors
**Solution:** Run `npm run clean` then `npm install`

---

## 📞 Support

For issues, check:
1. `PROJECT_ANALYSIS.md` - Complete project overview
2. `README.md` - Firebase setup guide
3. Console errors - Check browser dev tools

---

**Last Updated:** December 2024  
**Status:** ✅ Production Ready
