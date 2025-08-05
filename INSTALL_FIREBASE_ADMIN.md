# 🔥 Install Firebase Admin SDK

## 1. Install the Firebase Admin SDK

Run this command in your project root:

```bash
npm install firebase-admin
```

## 2. Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/social-content-generator-3893b/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file
4. Add these environment variables to your `.env.local`:

```
FIREBASE_CLIENT_EMAIL=your-service-account-email@social-content-generator-3893b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## 3. Alternative: Simpler Fix (Recommended for now)

Instead of setting up Admin SDK, let's use a different approach. The issue is that we're trying to write to Firestore from the server without proper authentication context.

**Option A: Use Firebase Admin SDK (above)**
**Option B: Move the Firestore operations to the client-side (simpler)**

For Option B, I'll modify the component to handle Firestore operations directly from the client where we have authentication.