# Blindish - AI-Powered Dating App

A mobile-first dating app that matches users based on AI-analyzed personality from digital footprints, with progressive photo unblurring through meaningful conversation.

## 🎯 Core Features

- **AI Personality Matching** - Analyze Spotify, YouTube, and social media to infer Big Five personality traits and relationship compatibility
- **Communication Style Matching** - Match users based on conflict resolution style, love languages, and communication preferences
- **Enhanced Story Cards** - Personalized match narratives with research-backed compatibility insights and conversation starters
- **Progressive Photo Unblurring** - Photos unblur as users exchange messages (text = 1 point, voice = 3 points)
- **Real-time Chat** - Text and voice messaging with typing indicators
- **Smart Onboarding** - Seamless OAuth integration for Spotify/YouTube data collection with minimal user friction

## 🛠 Tech Stack

- **Frontend**: React Native + Expo (SDK 54)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **State**: Zustand + React Query
- **AI**: OpenAI (GPT-4o, Whisper)
- **Animations**: React Native Reanimated 3

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🔧 Configuration

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Add OpenAI API key:
   - `OPENAI_API_KEY`

## 🧪 Testing & Development

### Reset User Data

**IMPORTANT**: Before testing the onboarding flow or any user-facing features, always reset your test user data first:

```bash
npm run reset-user
```

This script will:
- Clear all personality profiles
- Delete all photos from storage and database
- Reset the profile to initial onboarding state (step 0)
- Allow you to test the complete flow from scratch

**You should run this before every test session unless explicitly testing with existing data.**

## 📁 Project Structure

```
blindish-capacitor/
├── app/                      # Expo Router pages
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base components (Button, Input, etc.)
│   │   ├── chat/            # Chat-related components
│   │   ├── profile/         # Profile components
│   │   └── onboarding/      # Onboarding components
│   ├── features/            # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── chat/            # Messaging
│   │   ├── matching/        # Match discovery
│   │   ├── personality/     # AI analysis
│   │   ├── photos/          # Photo management
│   │   └── notifications/   # Push notifications
│   ├── lib/                 # Shared utilities
│   │   ├── constants/       # Design system (colors, typography)
│   │   ├── supabase.ts      # Supabase client
│   │   └── ai/              # AI provider abstraction
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript types
├── supabase/                # Database migrations & Edge Functions
│   ├── migrations/          # SQL migrations
│   └── functions/           # Serverless functions
└── assets/                  # Images, fonts, etc.
```

## 🚀 Development Phases

### ✅ Phase 1: Foundation (Complete)
- [x] Initialize Expo project with TypeScript
- [x] Install all dependencies
- [x] Create project structure
- [x] Configure Supabase client
- [x] Set up design system (colors, typography)
- [x] Create base UI components
- [x] Implement auth state management

### ✅ Phase 2: Onboarding (Complete)
- [x] Multi-step onboarding wizard
- [x] Photo upload with storage integration
- [x] OAuth for Spotify + YouTube
- [x] Consent & permissions flows
- [x] Communication style questions (conflict resolution, love languages)
- [x] Lifestyle preferences survey
- [x] Profile completion tracking

### ✅ Phase 3: AI Personality Analysis (Complete)
- [x] OpenAI GPT-4o integration
- [x] Spotify data analysis (top artists, tracks, genres)
- [x] YouTube data analysis (subscriptions, interests)
- [x] Big Five personality trait inference
- [x] Enhanced relationship insights with research-backed compatibility notes
- [x] Communication style inference with confidence scores
- [x] Conversation starters generation

### ✅ Phase 4: Matching System (Complete)
- [x] Personality-based compatibility scoring
- [x] Lifestyle compatibility filtering
- [x] Communication style matching
- [x] Story cards with progressive photo unblurring
- [x] Enhanced story cards with compatibility insights
- [x] Swipe-based discovery interface
- [x] Match creation and storage

### 🔄 Phase 5: Real-time Chat (Current)
- [x] Basic text messaging infrastructure
- [x] Real-time message sync with Supabase
- [x] Typing indicators
- [ ] Voice message recording and playback
- [ ] Message transcription with Whisper
- [ ] Point-based photo unblurring system
- [ ] Chat engagement tracking

### 📋 Remaining Phases
- Phase 6: Progressive Unblurring Enhancement
- Phase 7: Polish & Testing
- Phase 8: Beta Testing
- Phase 9: Launch Preparation
- Phase 10: Public Launch

## 📊 Cost Estimates

- **Infrastructure**: $25-150/mo (Supabase Pro)
- **AI**: $140-500/mo (OpenAI usage)
- **Dev Tools**: $500/year (Expo EAS, Apple Dev, Google Play)
- **First Year Total**: ~$10,000

## 🎨 Design System

- **Brand Colors**: Coral (#FF6B6B), Peach (#FFB4A2), Pink (#FF8BA7)
- **Typography**: Inter (body), Cormorant (headings)
- **Dark Mode**: Full support

## 📄 License

Proprietary - All rights reserved

## 🔗 Links

- [Implementation Plan](/Users/amy/.claude/plans/serene-scribbling-perlis.md)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Expo Documentation](https://docs.expo.dev)
