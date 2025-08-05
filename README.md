# Social Content Generator for Workplace Safety

A Next.js 14 application that generates professional workplace safety content for Instagram and LinkedIn, specifically tailored for Argentine regulations (CABA and Buenos Aires province).

## 🚀 Features

- **AI-Powered Content Generation**: Uses Gemini API for intelligent Spanish content creation
- **Professional Image Generation**: BRIA AI Production API for high-quality workplace safety images
- **Mobile-First Design**: Optimized for mobile content creation workflow
- **Mobile-Optimized**: Perfect for on-the-go content creation
- **Firebase Integration**: Firestore for data persistence (no storage costs!)
- **Smart Topic Management**: Avoids duplicate topics within 30-day periods
- **Direct Downloads**: Download images directly to your mobile device

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Firebase Firestore (free tier friendly)
- **Images**: Direct BRIA AI URLs (no storage costs)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: SWR for data fetching
- **APIs**: Gemini AI + BRIA AI Production
- **Deployment**: Vercel

## 📋 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd social-content-generator
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your API keys:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_FIREBASE_*`: Firebase project configuration
- `GEMINI_API_KEY`: Google Gemini API key
- `BRIA_AI_API_KEY`: BRIA AI Production API key

### 3. Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Firebase Storage
4. Deploy Firestore rules and indexes:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only storage
```

### 4. Generate Initial Topics

Before using the app, generate the initial topic database:

```bash
# Start the development server
npm run dev

# In another terminal, trigger topic discovery
curl -X POST http://localhost:3000/api/topics/discover
```

### 5. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

The app is configured for Vercel's free tier with appropriate function timeouts.

## 📱 Usage

1. **Generate Content**: Click "Generate" to create 5 diverse workplace safety posts
2. **View Content**: Switch between Instagram and LinkedIn tabs
3. **Copy Text**: Tap the copy button to copy post text to clipboard
4. **Download Images**: Tap "Download Image" to save images locally
5. **Mark as Posted**: Track which posts have been published

## 🏗 Project Structure

```
app/
├── (dashboard)/           # Main dashboard page
├── api/                   # API routes
│   ├── topics/           # Topic management
│   └── content/          # Content generation
├── globals.css           # Global styles
└── layout.tsx            # Root layout

components/
├── ui/                   # shadcn/ui components
└── dashboard/           # Dashboard-specific components

lib/
├── apis/                # API wrappers (Gemini, BRIA)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── firebase.ts          # Firebase configuration
```

## 🔧 Configuration

### Content Categories

The system generates content across 10 workplace safety categories:
- Normativas (Regulations)
- EPP (Personal Protective Equipment)
- Prevención (Accident Prevention)
- Ergonomía (Ergonomics)
- Primeros Auxilios (First Aid)
- Construcción (Construction Safety)
- Químicos (Chemical Safety)
- Eléctrica (Electrical Safety)
- Maquinaria (Machinery Safety)
- Capacitación (Training)

### Image Specifications

- **Instagram**: 1080x1080px JPG
- **LinkedIn**: 1200x630px JPG

## 🔒 Security

- Firestore security rules restrict access appropriately
- API keys are server-side only
- Images are stored securely in Firebase Storage

## 📊 Features Roadmap

- [ ] Content calendar view
- [ ] Analytics dashboard
- [ ] Batch generation
- [ ] Content templates
- [ ] Multi-language support
- [ ] Posting scheduler integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for workplace safety content generation.

---

**Note**: Replace placeholder icon files in `/public/icons/` with actual PNG icons before deployment.