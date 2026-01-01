# Blindish Code Review: Keep or Restart?

**Date:** January 1, 2026  
**Reviewer:** Claude  
**Codebase:** blindish-2026-main

---

## Executive Summary

**RECOMMENDATION: 🟡 HYBRID APPROACH - Salvage Foundation, Simplify Everything Else**

Your codebase has a **solid technical foundation** (Expo, Supabase, proper architecture) but has grown **far beyond MVP scope**. You've built features that belong in Phase 3-4 when you should still be in Phase 1.

**The Good News:** The infrastructure is sound. The database schema is well-designed. The core tech stack is exactly right.

**The Reality Check:** You've built 30+ onboarding screens when the PRD calls for 10 max. You have a complex story-card matching system when you need a simple swipe interface. You have elaborate UI flourishes (mesh gradients, golden frames, fairytale themes) when you need functional MVP screens.

**Time to Market Impact:**
- Current trajectory: 4-6 more months to finish what you've started
- Simplified approach: 6-8 weeks to MVP
- **Savings: 3-4 months by cutting scope NOW**

---

## Detailed Analysis

### ✅ What's Working (Keep These)

#### 1. **Technical Foundation - EXCELLENT**
```
✅ Expo + React Native (cross-platform ready)
✅ Supabase (auth, database, storage, realtime)
✅ TypeScript throughout
✅ Proper folder structure (features/, lib/, components/)
✅ Edge functions for AI processing
```

**Why it's good:** This is production-grade architecture. You don't need to change any of this.

#### 2. **Database Schema - SOLID**
```
✅ profiles table (complete with all needed fields)
✅ photos table (with blurhash support)
✅ matches table (with compatibility scores and blur tracking)
✅ messages table (with points system for unblur)
✅ likes/blocks/reports (safety features)
✅ personality_profiles (AI analysis)
✅ typing_indicators (realtime features)
```

**Why it's good:** Your database design actually matches the PRD perfectly. It supports progressive unblur, personality matching, and safety features. This is keeper material.

#### 3. **Auth & Integration Setup - WORKING**
```
✅ Spotify OAuth implemented
✅ YouTube OAuth implemented  
✅ Supabase auth working
✅ Token storage and refresh logic
```

**Why it's good:** The hard integration work is done. These are fiddly to get right and you have them working.

#### 4. **Core Services - REUSABLE**
```
✅ photoService.ts - upload and storage logic
✅ voiceRecordingService.ts - audio recording
✅ personalityService.ts - AI analysis integration
✅ matchingService.ts - compatibility calculation
```

**Why it's good:** These services are modular and can be reused even if you simplify the UI.

---

### 🔴 What's Bloated (Cut or Simplify)

#### 1. **Onboarding Flow - MASSIVELY OVERCOMPLICATED**

**Current State:**
```
30+ screens split across:
- Basic info (8 screens: name, birthday, gender, height, occupation, looking-for, voice)
- Lifestyle (7 screens: kids, drinking, smoking, cannabis, religion, politics)
- Communication (4 screens: preference, affection, conflict-resolution)
- Integrations (2 screens: Spotify, YouTube)
- Results/Analysis (3 screens)
- Photos (1 screen)
```

**PRD Requirement:**
```
10 screens MAX:
1. Consent
2. Name + DOB + Gender (combined)
3. Looking for
4. Photos (3-6)
5. Voice intro (60-90s)
6. Spotify connect
7. Dealbreakers (5-10 questions on ONE screen)
8. AI analysis (loading screen)
9. Review profile
10. Complete
```

**Problem:** You're asking users to answer 30+ questions before they can even see the app. Research shows 60%+ drop-off for every extra onboarding screen. You're probably at <20% completion rate with this flow.

**Fix:** Consolidate to 10 screens. Move "nice to have" questions (height, occupation, communication style) to post-onboarding profile editing.

---

#### 2. **Matching Interface - OVER-ENGINEERED**

**Current State:**
```
Story-based card stack with 10+ card types:
- IntroCard
- PhotoCard  
- SpotifyCard
- YouTubeCard
- MusicalJourney
- LifestyleCard
- InterestingDifferences
- AIPhotoCompatibility
- LifeWithBobIntro
- Plus: golden frames, mesh gradients, animated particles
```

**PRD Requirement:**
```
Simple stack interface with:
- Blurred primary photo
- Name, age, distance
- Personality insights (3-4 bullets)
- Voice player
- Connect/Pass buttons
```

**Problem:** You're building Instagram Stories for dating. This is creative but WAY beyond MVP. Each card type needs design, logic, data fetching, animations. This is a 2-month project by itself.

**Fix:** One card component. Show blurred photo + personality + voice + buttons. Ship it. Add story cards in Phase 3 if users love the core experience.

---

#### 3. **Design System - TOO ELABORATE**

**Current State:**
```
Fairytale theme with:
- Custom fonts (Cormorant serif)
- Golden color palette
- Mesh gradient overlays
- Animated particles
- Decorative borders (OrnateGoldenBorder, FloatingIvy, CompassStar)
- Pulsing elements
- Complex shadows and blurs
```

**PRD Requirement:**
```
Clean, modern UI:
- Sans-serif system font (Inter is fine)
- Simple color palette (black/white/accent)
- Standard React Native components
- Minimal custom styling
```

**Problem:** Beautiful, but this is luxury design work when you need functional MVP. Every custom UI component adds debugging time, performance overhead, and maintenance burden.

**Fix:** Strip to basics. Use default fonts. Remove decorative animations. Make it look clean and professional with minimal effort.

---

#### 4. **Multiple Zustand Stores - OVER-ARCHITECTED**

**Current State:**
```
5 separate stores:
- authStore
- basicInfoStore  
- communicationStyleStore
- lifestyleStore
- onboardingProgressStore
```

**Problem:** For MVP, you don't need this much state management. Most of this data should just live in Supabase and be fetched when needed.

**Fix:** One store for auth, one for temporary onboarding state. Everything else stays server-side.

---

#### 5. **Too Many Utility Scripts - TECHNICAL DEBT**

**Current State:**
```
98KB of scripts/:
- reset-user-data.ts
- force-reset-amy.ts  
- force-reset.ts
- full-reset.ts
- seed-test-profiles.ts
- seed-more-profiles.ts
- seed-enhanced-insights.ts
- fix-lifestyle-values.ts
- fix-bob-dealbreakers.ts
- apply-height-migration.ts
- test-discover-query.ts
- etc...
```

**Problem:** You have more scripts for fixing bugs and resetting data than you have core features. This is a sign the codebase has gotten away from you.

**Fix:** For MVP, you need ONE script: seed-test-data.ts. Everything else is premature.

---

## Comparison to PRD

| Feature | PRD Phase | Current Status | Verdict |
|---------|-----------|----------------|---------|
| **Auth & Login** | Phase 1 | ✅ Implemented | KEEP |
| **Simple Onboarding** | Phase 1 | 🔴 30+ screens | SIMPLIFY |
| **Photo Upload** | Phase 1 | ✅ Working | KEEP |
| **Voice Recording** | Phase 1 | ✅ Working | KEEP |
| **Spotify Integration** | Phase 1 | ✅ Working | KEEP |
| **YouTube Integration** | Phase 1 | ⚠️ Optional, working | KEEP (make optional) |
| **AI Personality Analysis** | Phase 1 | ✅ Working | KEEP |
| **Basic Dealbreakers** | Phase 1 | 🔴 20+ questions | SIMPLIFY to 5-10 |
| **Simple Match Discovery** | Phase 1 | 🔴 Story cards | SIMPLIFY to stack |
| **Chat + Progressive Unblur** | Phase 1 | ❌ Not built yet | BUILD THIS |
| **Safety (Report/Block)** | Phase 1 | ✅ Database ready | BUILD UI |
| **Voice Messaging** | Phase 2 | ❌ Not built | DEFER |
| **Story-based Matching** | Phase 4 | 🔴 Already built | DEFER |
| **Communication Style Questions** | Phase 2-3 | 🔴 Already built | DEFER |
| **Elaborate UI Theme** | Phase 3-4 | 🔴 Already built | SIMPLIFY |

**Summary:** You've built 40% of Phase 1, skipped critical features (chat!), and jumped ahead to build 60% of Phase 3-4.

---

## The Missing Critical Features

You haven't built the CORE DIFFERENTIATOR yet:

### ❌ Chat with Progressive Unblur
**This is what makes Blindish different.** Without this, you just have another dating app with a long onboarding.

**What you need:**
- Real-time messaging (Supabase Realtime)
- Message counter per match
- Blur calculation based on message count
- Visual unblur at milestones (10, 25, 50, 100 messages)
- Conversation starters

**Why it's missing:** You got distracted by elaborate onboarding and story cards.

---

## Recommended Path Forward

### 🎯 Option A: Ruthless Simplification (RECOMMENDED)

**Keep:**
- Database schema (as-is)
- Auth system
- Photo upload
- Voice recording  
- Spotify/YouTube OAuth
- AI personality analysis
- Core service files

**Simplify:**
- Onboarding: 30 screens → 10 screens
- Matching: Story cards → Simple stack
- Design: Fairytale theme → Clean minimal
- Dealbreakers: 20+ questions → 5-10
- State management: 5 stores → 2 stores

**Build New:**
- Chat interface
- Progressive unblur logic
- Report/block UI
- Settings screen

**Timeline:** 6-8 weeks to MVP

**Pros:** 
- Fastest path to testing with real users
- Preserves all backend work
- Forces focus on core value prop
- Lower maintenance burden

**Cons:**
- Abandons some creative work (story cards, fairytale theme)
- Feels like "starting over" on UI

---

### 🎯 Option B: Complete Restart with PRD

**Throw away everything except:**
- Database migrations
- Supabase config
- API keys and secrets

**Build from scratch:**
- Simple 10-screen onboarding
- Basic stack matching
- Chat with unblur
- Minimal UI

**Timeline:** 8-10 weeks to MVP

**Pros:**
- Clean slate, no baggage
- Forces MVP discipline
- Easier to reason about
- No legacy code to maintain

**Cons:**
- Discards working OAuth integrations
- Lose momentum psychologically
- Re-implement auth from scratch
- Waste of photo/voice service work

---

### 🎯 Option C: Finish Current Direction (NOT RECOMMENDED)

**Continue building:**
- Complete all 30 onboarding screens
- Finish story card system
- Polish fairytale theme
- Add chat last

**Timeline:** 4-6 months to MVP

**Pros:**
- Fulfills creative vision
- No "wasted work"

**Cons:**
- Never ships
- Feature creep continues
- No user feedback for 6 months
- High risk of burnout

---

## Concrete Next Steps (Option A - Recommended)

### Week 1-2: Surgical Simplification

**Day 1-3: Onboarding Consolidation**
```
1. Create new streamlined flow:
   app/(onboarding)/
     welcome.tsx
     consent.tsx
     basic-info.tsx (name, dob, gender combined)
     looking-for.tsx
     photos.tsx
     voice-intro.tsx
     spotify.tsx
     dealbreakers.tsx (one screen, 10 questions max)
     analysis.tsx (loading)
     complete.tsx

2. Archive old screens:
   mv app/(onboarding)/basic-info/ app/_archived/
   mv app/(onboarding)/communication/ app/_archived/
   mv app/(onboarding)/lifestyle/ app/_archived/
   (Keep as reference, restore later if needed)

3. Update stores:
   - Keep authStore
   - Merge all other stores into onboardingStore
```

**Day 4-7: Matching Simplification**
```
1. Create single ProfileCard component
   - Blurred photo background
   - Name, age, distance
   - 3-4 personality bullets
   - Voice player
   - Connect/Pass buttons

2. Archive story cards:
   mv src/features/matching/components/story-cards/ src/_archived/

3. Keep core services:
   - discoveryService.ts
   - matchingService.ts
   - Just simplify the UI layer
```

**Day 8-14: Build Chat**
```
1. Create chat screens:
   app/(tabs)/matches.tsx (list of matches)
   app/(tabs)/chat/[matchId].tsx (chat interface)

2. Implement:
   - Supabase Realtime subscription
   - Message input/send
   - Message list with timestamps
   - Blur calculation logic
   - Visual unblur indicators

3. Test progressive unblur:
   - 0 messages: 90% blur
   - 10 messages: 60% blur  
   - 25 messages: 40% blur
   - 50 messages: 20% blur
   - 100 messages: 0% blur
```

### Week 3-4: Core Features

**Safety Features**
```
- Report modal (from profile/chat)
- Block action
- Safety tips screen
```

**Settings**
```
- Edit profile
- Preferences
- Logout
```

**Testing**
```
- Full user flow walkthrough
- Test with 5-10 beta users
- Fix critical bugs
```

### Week 5-6: Polish & Beta

**Polish**
```
- Fix UX issues from testing
- Add loading states
- Error handling
- Push notifications
```

**Beta Launch**
```
- TestFlight setup
- Recruit 50 beta users
- Collect feedback
- Iterate
```

---

## Code Preservation Strategy

If you go with Option A, here's how to preserve your work:

```bash
# Create archive branch
git checkout -b archive/feature-complete-version
git add .
git commit -m "Archive: Full feature set before MVP simplification"
git push origin archive/feature-complete-version

# Return to main
git checkout main

# Create new branch for simplified MVP
git checkout -b mvp-simplified

# Now start removing/simplifying
mkdir src/_archived
mv src/components/ui/fairytale/ src/_archived/
# ... etc
```

This way:
- Nothing is lost
- You can restore features later
- You have clean history
- You can cherry-pick good components back if needed

---

## Budget Reality Check

### Current Codebase Costs (Monthly)
```
Supabase (starter): $25/month
Anthropic API (Claude): ~$50/month (personality analysis)
Spotify API: Free
YouTube API: Free
Expo EAS: $0 (free tier for now)
TOTAL: ~$75/month
```

**With current features, you'd need Pro tier:**
```
Supabase Pro: $25/month
Anthropic API: ~$200/month (story cards + enhanced insights)
TOTAL: ~$225/month
```

**Simplified MVP:**
```
Supabase Free tier: $0
Anthropic API: ~$20/month (basic personality only)
TOTAL: ~$20/month
```

**Savings in beta phase: $200/month = $1,200 over 6 months**

---

## Risk Assessment

### Option A (Simplify) Risks
- **Low:** Technical foundation is solid
- **Medium:** Psychological adjustment ("abandoning" creative work)
- **Low:** Timeline risk (8 weeks is achievable)

### Option B (Restart) Risks  
- **Medium:** Re-implementing OAuth/auth
- **High:** Psychological risk (feels like failure)
- **Medium:** Timeline risk (10 weeks is aggressive)

### Option C (Continue) Risks
- **CRITICAL:** Never shipping
- **HIGH:** Feature creep continues
- **HIGH:** Burnout risk
- **CRITICAL:** 6 months with no user feedback

---

## Final Recommendation

**Go with Option A: Ruthless Simplification**

**Why:**
1. Your backend is SOLID - keep it
2. Your services work - keep them
3. Your UI is BLOATED - simplify it
4. Your missing features are CRITICAL - build them

**The 80/20 Rule:**
- 20% of your current code delivers 80% of the value
- That 20%: Database, auth, services, integrations
- The other 80%: Elaborate UI, 30 onboarding screens, story cards

**Preserve the 20%. Simplify or defer the 80%.**

**Your Core Competency:**
You're great at building production systems quickly (you proved this with Claude Code and the product matrix). Play to that strength. Ship a functional MVP in 6 weeks, get users, iterate based on feedback.

**The Fairytale Theme Can Come Back:**
Once you have product-market fit and paying users, THEN bring back the story cards, the golden frames, the elaborate onboarding. But first: prove people want this at all.

---

## Questions to Ask Yourself

Before you decide, honestly answer:

1. **If you had to show this app to 50 beta users in 2 weeks, could you?**
   - Current answer: No (chat isn't built, onboarding is too long)
   - After simplification: Yes

2. **What's the ONE feature that makes Blindish different?**
   - Answer: Progressive photo unblur through conversation
   - Current status: Not built yet

3. **If you could only ship 3 features, what would they be?**
   - Personality matching via Spotify
   - Voice intros
   - Progressive unblur chat
   - Current status: 1/3 built (personality), 2/3 missing

4. **Would you rather:**
   - A) Ship in 6 weeks with 70% fewer features
   - B) Ship in 6 months with 100% of features
   - Honest answer for solo developer: A

5. **What would a user miss more:**
   - Story cards and fairytale theme?
   - Or the ability to actually chat and see photos unblur?
   - Answer: The chat

---

## Conclusion

You have a **great technical foundation** and **clear design taste**, but you've been building the **wrong things in the wrong order**.

The path forward isn't throwing everything away - it's **surgical simplification**:

✂️ Cut the elaborate onboarding  
✂️ Cut the story cards (for now)  
✂️ Cut the fairytale flourishes (for now)  
✅ Keep the database  
✅ Keep the integrations  
✅ Keep the services  
🏗️ Build the chat (finally!)

**Ship in 6-8 weeks. Get users. Iterate.**

Everything you "cut" can come back in Phase 2-3 once you've proven the concept works.

---

**Want me to create a step-by-step guide for the simplification process? Or would you like to discuss which specific components to keep vs. archive?**
