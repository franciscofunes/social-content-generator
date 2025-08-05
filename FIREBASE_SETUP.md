# 🔥 Firebase Setup Commands (Firestore Only - No Storage)

## Complete Firebase Setup for Social Content Generator

### **1. Install Firebase CLI (if not already installed)**
```bash
npm install -g firebase-tools
```

### **2. Login to Firebase**
```bash
firebase login
```

### **3. Initialize Firebase in your project directory**
```bash
cd /mnt/c/Users/francisco.funes/Desktop/projects/social-content-generator
firebase init
```

**During initialization, select:**
- ✅ **Firestore**: Configure security rules and indexes files
- ❌ **Storage**: NOT NEEDED (we use direct BRIA AI image URLs)
- **Project**: Choose your existing project `social-content-generator-3893b`
- **Firestore rules file**: Use existing file `firestore.rules` (press Enter)
- **Firestore indexes file**: Use existing file `firestore.indexes.json` (press Enter)

### **4. Deploy Firestore Rules and Indexes**
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### **5. Verify Firestore Collections Structure**
The app expects these collections to exist (they'll be created automatically when used):
- `topics` - Workplace safety topics
- `daily_content` - Generated daily content
- `content_history` - Analytics and history
- `chat_sessions` - Chat conversation sessions with metadata
- `chat_messages` - Individual messages within conversations
- `user_preferences` - User settings and preferences
- `session_analytics` - Analytics data for reporting

### **6. Generate Initial Topics (after app is running)**
```bash
# Start your Next.js app first
npm run dev

# In another terminal, generate the initial topic database
curl -X POST http://localhost:3000/api/topics/discover
```

## 📋 Configuration Files (Already Created)

### **firebase.json** ✅
```json
{
  "firestore": {
    "database": "(default)",
    "location": "nam5",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### **firestore.rules** ✅
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /topics/{document} {
      allow read, write: if true;
    }
    match /daily_content/{document} {
      allow read, write: if true;
      match /posts/{postId} {
        allow read, write: if true;
      }
    }
    match /content_history/{document} {
      allow read, write: if true;
    }
  }
}
```

### **firestore.indexes.json** ✅
```json
{
  "indexes": [],
  "fieldOverrides": []
}
```

## 🔍 Verification Commands

### **Check Firestore Rules**
```bash
firebase firestore:rules:get
```

### **List Firebase Projects**
```bash
firebase projects:list
```

### **Check Current Project**
```bash
firebase use
```

## 🚀 Complete Setup Sequence

Run these commands in order:

```bash
# 1. Navigate to project directory
cd /mnt/c/Users/francisco.funes/Desktop/projects/social-content-generator

# 2. Install Firebase CLI (if needed)
npm install -g firebase-tools

# 3. Login to Firebase
firebase login

# 4. Initialize Firebase (select ONLY Firestore, use existing files)
firebase init

# 5. Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# 6. Start your app
npm run dev

# 7. Generate initial topics (in another terminal)
curl -X POST http://localhost:3000/api/topics/discover
```

## 📱 How Images Work (No Storage Needed)

- ✅ **BRIA AI** generates images and provides direct URLs
- ✅ **Mobile Users** can download images directly to their devices
- ✅ **No Firebase Storage** costs or limits
- ✅ **Free Tier Friendly** - only uses Firestore for data

## 🎯 What's Different from Standard Setup

- **NO Firebase Storage** - saves money and complexity
- **NO Storage Rules** - not needed
- **Direct Image URLs** - from BRIA AI API
- **Mobile Download** - users save images to their phones
- **Firestore Only** - just for topics and content data

After running these commands, your Firebase project will be configured with:
- ✅ Firestore database with proper security rules
- ✅ Ready to store topics and daily content
- ✅ No storage costs or limits
- ✅ Perfect for mobile content creation workflow!