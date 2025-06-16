# E-Commerce Admin Panel

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Firebase Setup

### Environment Variables
Create a `.env.local` file in the root directory with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
```

### Firestore Security Rules

**CRITICAL**: You need to update your Firestore security rules in the Firebase Console to fix the "Access Denied" error in the admin panel.

1. Go to your Firebase project in the Firebase Console
2. Navigate to "Firestore Database"
3. Click on the "Rules" tab
4. Replace your current rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data, admins can read all
    match /users/{userId} {
      allow read, create, update: if request.auth != null && request.auth.uid == userId;
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Products collection - public read, admin write
    match /products/{productId} {
      allow read: if true; // Public read access for shop
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Categories collection - public read, admin write
    match /categories/{categoryId} {
      allow read: if true; // Public read access for shop
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Brands collection - public read, admin write
    match /brands/{brandId} {
      allow read: if true; // Public read access for shop
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Orders collection - users can read/write their own orders, admins can read/write all
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"));
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Reviews collection - users can write their own reviews, public read
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"));
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Collections - admin only
    match /collections/{collectionId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Cart items - users can only access their own cart
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Setting Up Admin User

After updating the security rules, you need to manually set a user as admin:

1. Create a user account through the app (sign up)
2. Go to Firebase Console > Firestore Database
3. Find the `users` collection
4. Locate your user document (by email or UID)
5. Edit the document and add a field:
   - Field: `role`
   - Type: `string`
   - Value: `admin`

### Troubleshooting

If you're still getting "Access Denied" errors:

1. **Check Firebase Console**: Ensure your security rules are saved and deployed
2. **Verify Admin Role**: Make sure your user document has `role: "admin"`
3. **Clear Browser Cache**: Sometimes cached authentication tokens cause issues
4. **Check Network Tab**: Look for 403 errors in browser dev tools
5. **Firebase Auth**: Ensure the user is properly authenticated

### Common Issues

1. **Missing Environment Variables**: Ensure all Firebase config variables are set
2. **Incorrect Security Rules**: The rules must exactly match the structure above
3. **User Role Not Set**: Admin users must have `role: "admin"` in their user document
4. **Authentication State**: User must be logged in and authenticated

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Firebase Documentation](https://firebase.google.com/docs) - learn about Firebase services.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.