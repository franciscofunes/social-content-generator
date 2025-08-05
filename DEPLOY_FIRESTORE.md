# 🔥 Firebase Deployment Instructions

## 1. Deploy Firestore Rules & Indexes

Run these commands in your terminal from the project root:

```bash
# Deploy only the Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Or deploy them separately if needed:
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## 2. Check if deployment was successful

```bash
# Check the current rules in your Firebase console
firebase firestore:rules:show

# List existing indexes
firebase firestore:indexes
```

## 3. If you get permission errors, make sure you're logged in:

```bash
firebase login
firebase use social-content-generator-3893b
```

## 4. Alternative: Manual deployment via Firebase Console

If the CLI doesn't work, you can deploy manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `social-content-generator-3893b`
3. Go to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` and paste it there
5. Click **Publish**

For indexes:
1. Go to **Firestore Database** → **Indexes** → **Composite**
2. Add this index manually:
   - Collection: `prompts`
   - Fields: `isActive` (Ascending), `createdAt` (Descending)
   - Click **Create Index**

## 5. Expected Rules Structure

The rules should include this section for prompts:

```javascript
// User's saved prompts
match /prompts/{promptId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null && 
               request.auth.uid == userId &&
               request.resource.data.userId == userId;
}
```

## 6. Test after deployment

After deployment, test the endpoints:
- POST `/api/prompts/save`
- GET `/api/prompts/load`
- DELETE `/api/prompts/delete`

The PERMISSION_DENIED error should be resolved once the rules are deployed.