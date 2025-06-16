# How to Create an Admin User

## Step 1: Update Firestore Security Rules

First, you need to update your Firestore security rules to allow admin access. Go to your Firebase Console:

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Click on the **Rules** tab
5. Replace your current rules with these:

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

6. Click **Publish** to save the rules

## Step 2: Create a User Account

1. Go to your app at `http://localhost:3000`
2. Click **Sign Up** to create a new account
3. Fill in your details and create the account
4. **Remember the email address** you used - this will be your admin account

## Step 3: Make the User an Admin

Now you need to manually set this user as an admin in Firestore:

1. Go back to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Click on **Data** tab
5. Look for the `users` collection
6. Find your user document (it will be listed by the user ID)
7. Click on your user document to open it
8. Click **Add field** (the + button)
9. Set the field details:
   - **Field**: `role`
   - **Type**: `string`
   - **Value**: `admin`
10. Click **Update**

## Step 4: Verify Admin Access

1. Go back to your app
2. Log out if you're logged in
3. Log back in with the account you just made admin
4. You should now see an "Admin" link in the header
5. Click on "Admin" to access the admin panel

## Alternative Method: Using Firebase Console Authentication

If you prefer to see users by email:

1. Go to Firebase Console → **Authentication** → **Users** tab
2. Find your user by email address
3. Copy the **User UID**
4. Go to **Firestore Database** → **Data**
5. Navigate to `users` collection
6. Find the document with the ID matching your User UID
7. Add the `role: "admin"` field as described above

## Troubleshooting

If you still get "Access Denied":

1. **Check the rules are published**: Make sure you clicked "Publish" in the Rules tab
2. **Verify the role field**: Make sure the field is exactly `role` with value `admin`
3. **Clear browser cache**: Sometimes cached tokens cause issues
4. **Check browser console**: Look for any error messages
5. **Try logging out and back in**: This refreshes the authentication token

## Security Note

Only give admin access to trusted users. Admin users have full read/write access to all data in your Firestore database.