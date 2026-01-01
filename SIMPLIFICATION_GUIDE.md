# Blindish MVP Simplification Guide
## For Claude Code - Execute in Phases

**Date:** January 1, 2026  
**Goal:** Simplify current codebase to MVP scope in 3 phases  
**Timeline:** 2-3 weeks  
**Working Directory:** `/Users/amy/blindish-capacitor`

---

## 📋 Overview for Claude Code

You are helping simplify an over-featured React Native dating app down to MVP scope. The codebase has solid technical foundations but too many features. Your job is to:

1. **Preserve** all backend work (database, services, integrations)
2. **Simplify** the UI layer (fewer screens, simpler components)
3. **Build** the missing core feature (chat with progressive unblur)

**Critical Context:**
- This is a solo developer project with production deployment plans
- The database schema is GOOD - don't touch it
- The auth and integrations WORK - keep them
- The UI is BLOATED - simplify it
- The chat is MISSING - build it

**Success Criteria:**
- Onboarding: 30+ screens → 10 screens
- Time to complete onboarding: 20+ min → 5 min
- Matching: Complex story cards → Simple stack
- Chat: Doesn't exist → Working with progressive unblur
- Can ship to TestFlight in 2-3 weeks

---

## 🎯 Three-Phase Approach

### Phase 1: Archive & Simplify (Week 1)
**Goal:** Reduce complexity without breaking anything  
**Duration:** 3-4 days  
**Can stop here:** Yes, app will still work

### Phase 2: Consolidate & Polish (Week 1-2)  
**Goal:** Streamline onboarding and matching to MVP specs  
**Duration:** 4-5 days  
**Can stop here:** Yes, functional MVP without chat

### Phase 3: Build Chat (Week 2-3)
**Goal:** Implement the core differentiator  
**Duration:** 5-7 days  
**Can stop here:** This is the shipping version

---

## 📦 PHASE 1: Archive & Simplify

**Duration:** 3-4 days  
**Status Checkpoints:** End of each day

### Day 1: Setup & Archive Strategy

#### 1.1 Create Archive Structure
```bash
# Create archive branch first (safety!)
git checkout -b archive/pre-simplification-$(date +%Y%m%d)
git add .
git commit -m "Archive: Full codebase before MVP simplification"
git push origin archive/pre-simplification-$(date +%Y%m%d)

# Return to main and create working branch
git checkout main
git checkout -b mvp-simplify

# Create archive directories
mkdir -p src/_archived/components
mkdir -p src/_archived/screens
mkdir -p src/_archived/features
mkdir -p app/_archived
```

#### 1.2 Document Current State
```bash
# Generate file tree for reference
tree -I 'node_modules|.expo' -L 3 > CURRENT_STRUCTURE.txt

# Count current screens
find app -name "*.tsx" | wc -l > CURRENT_METRICS.txt
```

**Checkpoint:** Verify git branch created and archive folders exist.

---

### Day 2: Archive Complex UI Components

#### 2.1 Archive Fairytale Theme Components
**What to archive:**
```
src/components/ui/fairytale/
  - CompassStar.tsx
  - CustomStar.tsx
  - DecorativeBorder.tsx
  - FloatingIvy.tsx
  - MagicalParticles.tsx
  - OrnateGoldenBorder.tsx
```

**Commands:**
```bash
# Move fairytale components to archive
mv src/components/ui/fairytale src/_archived/components/

# Update index.ts to remove fairytale exports
# (Claude Code: edit src/components/ui/index.ts to remove fairytale imports)
```

**What to keep:**
```
src/components/ui/
  - Button.tsx (simplify later)
  - Card.tsx (simplify later)
  - Input.tsx (keep as-is)
  - AnimatedBackground.tsx (remove or simplify)
  - GoldenCircleFrame.tsx (replace with simple View)
  - MeshGradientOverlay.tsx (remove)
  - PulsingBorderCircle.tsx (remove)
```

**Claude Code Instructions:**
1. Move complex animation components to `src/_archived/components/ui/`
2. Create simple replacements:
   - `GoldenCircleFrame` → simple `View` with border
   - `MeshGradientOverlay` → simple opacity overlay
   - `AnimatedBackground` → solid background
3. Update all imports across the codebase
4. Verify app still compiles with `npm start`

**Checkpoint:** App compiles and runs without fairytale components.

---

#### 2.2 Archive Story Card System
**What to archive:**
```
src/features/matching/components/story-cards/
  - AIPhotoCompatibility.tsx
  - InterestingDifferences.tsx
  - LifeWithBobIntro.tsx
  - LifestyleCard.tsx
  - MusicalJourney.tsx
  - PhotoCard.tsx (keep simplified version)
  - SpotifyCard.tsx
  - YouTubeCard.tsx
  - All decorative card types
```

**Commands:**
```bash
mv src/features/matching/components/story-cards src/_archived/features/matching/
```

**What to create instead:**
```
src/features/matching/components/
  - SimpleProfileCard.tsx (NEW - single card for discovery)
  - ProfileCardContent.tsx (NEW - personality + voice player)
  - SwipeActions.tsx (NEW - connect/pass buttons)
```

**Claude Code Instructions:**
1. Archive the entire story-cards directory
2. Create `SimpleProfileCard.tsx` with:
   - Blurred photo background (use existing blur from database)
   - Name, age, distance overlay
   - 3-4 personality bullets (from AI analysis)
   - Voice player
   - Connect/Pass buttons at bottom
3. Keep it under 200 lines of code
4. Use standard RN components (View, Text, Image, TouchableOpacity)
5. No animations, gradients, or decorative elements

**Checkpoint:** Simple profile card renders in discovery feed.

---

### Day 3: Archive Onboarding Screens

#### 3.1 Identify Screens to Archive
**Archive these (move to app/_archived/):**
```
app/(onboarding)/basic-info/
  - height.tsx (defer to profile editing)
  - occupation.tsx (defer to profile editing)

app/(onboarding)/communication/
  - ALL FILES (defer to Phase 2+)
  - affection-expression.tsx
  - communication-preference.tsx
  - conflict-resolution.tsx

app/(onboarding)/lifestyle/
  - Keep: kids.tsx, drinking.tsx, smoking.tsx, cannabis.tsx
  - Archive: religion.tsx, politics.tsx (optional, add to dealbreakers instead)

app/(onboarding)/
  - lifestyle-intro.tsx (remove intro screens)
  - communication-intro.tsx (remove intro screens)
  - lifestyle-preferences.tsx (consolidate into dealbreakers)
```

**Commands:**
```bash
# Archive communication flow entirely
mv app/\(onboarding\)/communication app/_archived/

# Archive intro screens
mv app/\(onboarding\)/communication-intro.tsx app/_archived/
mv app/\(onboarding\)/lifestyle-intro.tsx app/_archived/

# Archive optional basic-info
mv app/\(onboarding\)/basic-info/height.tsx app/_archived/
mv app/\(onboarding\)/basic-info/occupation.tsx app/_archived/
```

**Claude Code Instructions:**
1. Move archived screens as specified
2. Update `app/(onboarding)/_layout.tsx` to remove archived routes
3. Update navigation flow to skip removed screens
4. Test that onboarding still completes without errors
5. Verify profile is created successfully

**Checkpoint:** Onboarding works with fewer screens, profile creation successful.

---

#### 3.2 Consolidate Basic Info Screens
**Current:**
```
basic-info/name.tsx
basic-info/birthday.tsx
basic-info/gender.tsx
basic-info/looking-for.tsx
```

**Target:**
```
basic-info.tsx (combined into ONE screen with scrollable form)
```

**Claude Code Instructions:**
1. Create new `app/(onboarding)/basic-info.tsx`
2. Combine into single scrollable form:
   - Name (text input)
   - Date of birth (date picker)
   - Gender (select)
   - Looking for (multi-select)
3. Use form validation (react-hook-form or simple state)
4. Save all fields at once when "Next" pressed
5. Delete individual screen files after migration
6. Update navigation to route to new combined screen

**Example structure:**
```typescript
// app/(onboarding)/basic-info.tsx
export default function BasicInfoScreen() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  const handleNext = async () => {
    // Validate all fields
    // Save to Supabase
    // Navigate to next screen
  };

  return (
    <ScrollView>
      <Input label="Name" value={name} onChangeText={setName} />
      <DatePicker value={dob} onChange={setDob} />
      <Select label="Gender" value={gender} onChange={setGender} />
      <MultiSelect label="Looking for" values={lookingFor} onChange={setLookingFor} />
      <Button onPress={handleNext}>Next</Button>
    </ScrollView>
  );
}
```

**Checkpoint:** Basic info collected in one screen, saves successfully.

---

### Day 4: Archive Utility Scripts & Clean Up

#### 4.1 Archive Unnecessary Scripts
**Keep only:**
```
scripts/
  - seed-test-data.ts (consolidate all seed scripts into this)
```

**Archive:**
```
scripts/
  - All other scripts (reset-user-data, force-reset*, fix-*, test-*, etc.)
```

**Commands:**
```bash
mkdir -p scripts/_archived
mv scripts/force-reset*.ts scripts/_archived/
mv scripts/fix-*.ts scripts/_archived/
mv scripts/test-*.ts scripts/_archived/
mv scripts/clear-*.ts scripts/_archived/
mv scripts/delete-*.ts scripts/_archived/
mv scripts/update-*.ts scripts/_archived/
mv scripts/find-*.ts scripts/_archived/
mv scripts/apply-*.ts scripts/_archived/
mv scripts/seed-enhanced-insights.ts scripts/_archived/
mv scripts/seed-integration-data.ts scripts/_archived/
mv scripts/seed-more-profiles.ts scripts/_archived/
mv scripts/reset-user-data.ts scripts/_archived/
mv scripts/full-reset.ts scripts/_archived/

# Keep only
# scripts/seed-test-data.ts (create if doesn't exist)
```

**Claude Code Instructions:**
1. Archive all scripts except one master seed script
2. Create `scripts/seed-test-data.ts` that:
   - Creates 5-10 test profiles
   - Adds realistic photos, voice, Spotify data
   - Runs personality analysis
   - Creates a few matches
3. This should be runnable with: `npm run seed`
4. Update package.json scripts to have only: `seed: "tsx scripts/seed-test-data.ts"`

**Checkpoint:** Only one seed script exists, works correctly.

---

#### 4.2 Simplify Zustand Stores
**Current:**
```
src/stores/
  - authStore.ts (KEEP)
  - basicInfoStore.ts (SIMPLIFY)
  - communicationStyleStore.ts (REMOVE)
  - lifestyleStore.ts (MERGE into basicInfoStore)
  - onboardingProgressStore.ts (SIMPLIFY)
```

**Target:**
```
src/stores/
  - authStore.ts (keep as-is)
  - onboardingStore.ts (merge all onboarding state)
```

**Claude Code Instructions:**
1. Merge `basicInfoStore`, `lifestyleStore`, and `onboardingProgressStore` into one `onboardingStore.ts`
2. Remove `communicationStyleStore.ts` entirely
3. Update all imports across the app
4. Simplify state structure:
```typescript
// src/stores/onboardingStore.ts
interface OnboardingState {
  // Basic info
  name: string;
  dateOfBirth: string;
  gender: string;
  lookingFor: string[];
  
  // Lifestyle (dealbreakers)
  wantsKids: string | null;
  drinking: string | null;
  smoking: string | null;
  cannabisUse: string | null;
  
  // Progress
  currentStep: number;
  photosUploaded: string[];
  voiceRecorded: boolean;
  spotifyConnected: boolean;
  youtubeConnected: boolean;
  
  // Actions
  setBasicInfo: (info: Partial<OnboardingState>) => void;
  setLifestyle: (lifestyle: Partial<OnboardingState>) => void;
  nextStep: () => void;
  reset: () => void;
}
```

**Checkpoint:** State management simplified, app still works.

---

### 🎯 Phase 1 Completion Checklist

Before moving to Phase 2, verify:

- [ ] Git archive branch created
- [ ] Fairytale UI components archived
- [ ] Story cards archived
- [ ] Complex onboarding screens archived
- [ ] Unnecessary scripts archived
- [ ] Zustand stores simplified
- [ ] App compiles without errors
- [ ] Can complete onboarding end-to-end
- [ ] Profile creation still works
- [ ] Spotify/YouTube integration still works

**Test Command:**
```bash
npm start
# Then manually test onboarding flow
```

**Metrics Check:**
```bash
# Count remaining screens
find app -name "*.tsx" | wc -l
# Target: ~15-20 (down from 30+)

# Count remaining components
find src/components -name "*.tsx" | wc -l
# Target: ~20-25 (down from 40+)
```

**Git Checkpoint:**
```bash
git add .
git commit -m "Phase 1 complete: Archived complex UI, simplified stores"
git push origin mvp-simplify
```

---

## 📦 PHASE 2: Consolidate & Polish

**Duration:** 4-5 days  
**Status Checkpoints:** End of each day

### Day 5: Consolidate Onboarding Flow

#### 5.1 Create Streamlined Flow
**Target flow (10 screens max):**
1. Welcome
2. Consent
3. Basic Info (combined: name, dob, gender, looking-for)
4. Photos (3-6 upload)
5. Voice Intro (60-90 seconds)
6. Spotify Connect
7. YouTube Connect (optional, skippable)
8. Dealbreakers (5-10 questions on ONE screen)
9. Analysis (loading/processing)
10. Complete (review + submit)

**Current screens to keep/modify:**
```
✅ app/(onboarding)/welcome.tsx (keep)
✅ app/(onboarding)/consent.tsx (keep)
🔄 app/(onboarding)/basic-info.tsx (NEW - created in Phase 1)
✅ app/(onboarding)/photos.tsx (keep, maybe simplify)
🔄 app/(onboarding)/basic-info/voice-greeting.tsx → voice-intro.tsx (rename/move)
✅ app/(onboarding)/integrations/spotify.tsx (keep)
✅ app/(onboarding)/integrations/youtube.tsx (keep, make skippable)
🆕 app/(onboarding)/dealbreakers.tsx (NEW - consolidate lifestyle)
✅ app/(onboarding)/analysis.tsx (keep)
✅ app/(onboarding)/complete.tsx (keep)
```

**Claude Code Instructions:**

**Step 1: Reorganize files**
```bash
# Move voice-greeting up one level and rename
mv app/\(onboarding\)/basic-info/voice-greeting.tsx app/\(onboarding\)/voice-intro.tsx

# Remove now-empty basic-info directory if it exists
rm -rf app/\(onboarding\)/basic-info
```

**Step 2: Create dealbreakers.tsx**
Create `app/(onboarding)/dealbreakers.tsx`:
```typescript
// Consolidate all dealbreaker questions into one screen
// Use MultipleChoice component from existing codebase
export default function DealbreakersScreen() {
  const questions = [
    {
      id: 'kids',
      question: 'Do you want kids?',
      options: ['Want kids', "Don't want kids", 'Open to kids', 'Have kids'],
    },
    {
      id: 'drinking',
      question: 'How often do you drink?',
      options: ['Never', 'Socially', 'Regularly', 'Frequently'],
    },
    {
      id: 'smoking',
      question: 'Do you smoke?',
      options: ['Never', 'Socially', 'Regularly'],
    },
    {
      id: 'cannabis',
      question: 'Do you use cannabis?',
      options: ['Never', 'Socially', 'Regularly'],
    },
    {
      id: 'politics',
      question: 'Political leaning?',
      options: ['Liberal', 'Moderate', 'Conservative', 'Prefer not to say'],
    },
    {
      id: 'religion',
      question: 'Religion important to you?',
      options: ['Very important', 'Somewhat important', 'Not important', 'Spiritual not religious'],
    },
  ];

  return (
    <ScrollView>
      {questions.map(q => (
        <QuestionCard key={q.id} {...q} />
      ))}
      <Button onPress={handleNext}>Continue</Button>
    </ScrollView>
  );
}
```

**Step 3: Update navigation**
Edit `app/(onboarding)/_layout.tsx`:
- Remove all archived routes
- Set correct order for 10 screens
- Ensure navigation flows correctly

**Step 4: Update stores**
- Save dealbreaker answers to `onboardingStore`
- On completion, save to Supabase `profiles` table

**Checkpoint:** Onboarding is now 10 screens, flows correctly end-to-end.

---

#### 5.2 Simplify Photo Upload Screen
**Current:** `app/(onboarding)/photos.tsx`

**Claude Code Instructions:**
1. Keep the core upload functionality
2. Remove elaborate animations or transitions
3. Simplify to:
   - Grid showing 6 empty slots
   - Tap to upload photo
   - Show preview after upload
   - Allow reordering (simple drag/drop or up/down buttons)
   - Mark one as primary photo
   - Require minimum 3 photos
4. No blur demo, no elaborate transitions

**Checkpoint:** Photo upload works, minimum friction.

---

#### 5.3 Simplify Voice Intro Screen
**Current:** `app/(onboarding)/voice-intro.tsx`

**Claude Code Instructions:**
1. Keep the recording functionality from `src/features/voice/components/VoiceRecorder.tsx`
2. Simplify UI:
   - Show prompt: "Record a 60-90 second intro"
   - Big record button
   - Waveform (if easy) or simple timer
   - Play back recording
   - Re-record option
3. No elaborate animations
4. Save to Supabase storage when done

**Checkpoint:** Voice recording works, simple UI.

---

### Day 6: Simplify Matching Interface

#### 6.1 Remove Match Modal / Story System
**Current:**
```
src/features/matching/components/
  - MatchModal.tsx (archive)
  - MatchStoryModal.tsx (archive)
```

**Claude Code Instructions:**
1. Archive `MatchModal.tsx` and `MatchStoryModal.tsx`
2. Matching should be instant:
   - Tap "Connect" → If mutual, create match immediately
   - Show simple success animation
   - Navigate to matches list or chat
3. No elaborate story/modal flow

---

#### 6.2 Simplify Discovery Feed
**Current:** `app/(tabs)/index.tsx`

**Target:** Simple stack of profile cards

**Claude Code Instructions:**
1. Use the `SimpleProfileCard.tsx` created in Phase 1
2. Stack interface (not swipe yet - just buttons):
   - Show one card at a time
   - "Pass" button on left
   - "Connect" button on right
   - Voice player in card
   - Personality insights (3-4 bullets)
   - Blurred photo background
3. Fetch profiles from `discoveryService.ts`
4. Handle connect/pass actions via `matchingService.ts`
5. If connect is mutual → create match → show success → move to next profile

**Example structure:**
```typescript
export default function DiscoveryScreen() {
  const { data: profiles, isLoading } = useDiscoverFeed();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProfile = profiles?.[currentIndex];

  const handleConnect = async () => {
    const didMatch = await createLike(currentProfile.id);
    if (didMatch) {
      showMatchNotification();
    }
    setCurrentIndex(i => i + 1);
  };

  const handlePass = () => {
    setCurrentIndex(i => i + 1);
  };

  return (
    <View>
      {currentProfile && (
        <SimpleProfileCard 
          profile={currentProfile}
          onConnect={handleConnect}
          onPass={handlePass}
        />
      )}
    </View>
  );
}
```

**Checkpoint:** Discovery feed shows simple cards, connect/pass works.

---

### Day 7-8: Polish Existing Screens

#### 7.1 Simplify Design System
**Update these files:**

`src/lib/constants/colors.ts`:
```typescript
// Remove elaborate fairytale palette
// Keep simple light/dark theme
export const Colors = {
  light: {
    background: '#FFFFFF',
    card: '#F9F9F9',
    text: {
      primary: '#000000',
      secondary: '#666666',
      tertiary: '#999999',
    },
    accent: '#007AFF', // iOS blue
    danger: '#FF3B30',
  },
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: {
      primary: '#FFFFFF',
      secondary: '#AEAEB2',
      tertiary: '#636366',
    },
    accent: '#0A84FF',
    danger: '#FF453A',
  },
};
```

`src/lib/constants/typography.ts`:
```typescript
// Use system fonts
export const Typography = {
  fonts: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
};
```

**Claude Code Instructions:**
1. Simplify color palette
2. Use system fonts (remove custom font loading)
3. Update all components to use simplified constants
4. Remove any gradient/overlay components

**Checkpoint:** App uses simple, clean design system.

---

#### 7.2 Update UI Components
**Simplify these:**

`src/components/ui/Button.tsx`:
- Remove elaborate styling
- Simple TouchableOpacity with text
- Support primary/secondary/danger variants
- Max 50 lines of code

`src/components/ui/Card.tsx`:
- Remove decorative elements
- Simple View with shadow
- Max 30 lines of code

`src/components/ui/Input.tsx`:
- Keep as-is (probably already simple)

**Archive these:**
- `AnimatedBackground.tsx`
- `GoldenCircleFrame.tsx`
- `MeshGradientOverlay.tsx`
- `PulsingBorderCircle.tsx`

**Checkpoint:** All UI components are simple and functional.

---

### Day 9: Test & Fix

#### 9.1 End-to-End Testing
**Test these flows:**

1. **Onboarding:**
   - [ ] Complete all 10 screens
   - [ ] Upload photos
   - [ ] Record voice
   - [ ] Connect Spotify
   - [ ] Answer dealbreakers
   - [ ] Profile created in database
   - [ ] Total time: <10 minutes

2. **Discovery:**
   - [ ] See profiles
   - [ ] Hear voice intros
   - [ ] Tap Connect/Pass
   - [ ] Mutual match creates match record

3. **Profile:**
   - [ ] View own profile
   - [ ] Edit basic info (post-onboarding)

**Claude Code Instructions:**
1. Run full onboarding flow
2. Log any errors
3. Fix blocking bugs
4. Verify database records created correctly

---

#### 9.2 Performance Check
```bash
# Check bundle size
npx expo export --platform ios

# Should be under 50MB for iOS
# Should be under 30MB for Android (excluding native modules)
```

**Claude Code Instructions:**
1. Remove unused dependencies from package.json
2. Check for any large imports
3. Optimize images if needed

**Checkpoint:** App loads quickly, no performance issues.

---

### 🎯 Phase 2 Completion Checklist

Before moving to Phase 3, verify:

- [ ] Onboarding is exactly 10 screens
- [ ] Each screen is simple and functional
- [ ] Onboarding takes <10 minutes
- [ ] Photos upload successfully
- [ ] Voice recording works
- [ ] Spotify/YouTube connect works
- [ ] Dealbreakers save to database
- [ ] Discovery feed shows simple cards
- [ ] Connect/Pass actions work
- [ ] Mutual matches create match records
- [ ] UI uses simplified design system
- [ ] No fairytale/decorative elements remain
- [ ] App performs well (no lag)

**Metrics Check:**
```bash
# Total screens should be ~15
find app -name "*.tsx" | wc -l

# Total components should be ~25
find src/components -name "*.tsx" | wc -l
```

**Git Checkpoint:**
```bash
git add .
git commit -m "Phase 2 complete: Consolidated onboarding, simplified matching"
git push origin mvp-simplify
```

---

## 📦 PHASE 3: Build Chat System

**Duration:** 5-7 days  
**Status Checkpoints:** End of each day

### Day 10: Chat Infrastructure

#### 10.1 Create Chat Screens
**New files to create:**
```
app/(tabs)/matches.tsx
app/(tabs)/chat/[matchId].tsx
app/(tabs)/chat/_layout.tsx
```

**Folder structure:**
```
app/
  (tabs)/
    index.tsx (Discovery - already exists)
    matches.tsx (NEW - list of matches)
    chat/
      _layout.tsx (NEW)
      [matchId].tsx (NEW - chat interface)
```

**Claude Code Instructions:**

**Step 1: Create matches list screen**
`app/(tabs)/matches.tsx`:
```typescript
export default function MatchesScreen() {
  const { data: matches } = useMatches();

  return (
    <FlatList
      data={matches}
      renderItem={({ item }) => (
        <MatchRow 
          match={item}
          onPress={() => router.push(`/chat/${item.id}`)}
        />
      )}
    />
  );
}

function MatchRow({ match, onPress }) {
  const blurAmount = calculateBlurFromMessages(match.total_messages);
  
  return (
    <TouchableOpacity onPress={onPress}>
      <Image 
        source={{ uri: match.other_user.primary_photo }}
        blurRadius={blurAmount}
      />
      <Text>{match.other_user.name}</Text>
      <Text>{match.total_messages} messages</Text>
      <Text>Blur: {Math.round((1 - blurAmount/20) * 100)}% clear</Text>
    </TouchableOpacity>
  );
}
```

**Step 2: Create chat interface**
`app/(tabs)/chat/[matchId].tsx`:
```typescript
export default function ChatScreen() {
  const { matchId } = useLocalSearchParams();
  const { data: match } = useMatch(matchId);
  const { data: messages } = useMessages(matchId);
  const [newMessage, setNewMessage] = useState('');

  // Subscribe to real-time messages
  useEffect(() => {
    const subscription = supabase
      .channel(`match:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        // Add new message to list
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [matchId]);

  const handleSend = async () => {
    await sendMessage(matchId, newMessage);
    setNewMessage('');
  };

  return (
    <View>
      {/* Header with blurred photo */}
      <ChatHeader match={match} />
      
      {/* Messages list */}
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
      />
      
      {/* Input */}
      <MessageInput
        value={newMessage}
        onChangeText={setNewMessage}
        onSend={handleSend}
      />
      
      {/* Blur progress indicator */}
      <BlurProgressBar match={match} />
    </View>
  );
}
```

**Checkpoint:** Chat screens created, can navigate between them.

---

### Day 11: Message Functionality

#### 11.1 Implement Send Message
**Update/create:** `src/features/chat/services/chatService.ts`

```typescript
export async function sendMessage(
  matchId: string,
  content: string,
  senderId: string
) {
  // 1. Insert message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content,
      type: 'text',
      points_awarded: 1, // Each message = 1 point
    })
    .select()
    .single();

  if (error) throw error;

  // 2. Update match message count
  const { error: updateError } = await supabase.rpc(
    'increment_match_messages',
    { match_id: matchId }
  );

  // 3. Calculate if blur should update
  await updateMatchBlur(matchId);

  return message;
}
```

**Create database function:**
```sql
-- Add to Supabase SQL editor
CREATE OR REPLACE FUNCTION increment_match_messages(match_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE matches
  SET 
    total_messages = total_messages + 1,
    last_message_at = now()
  WHERE id = match_id;
END;
$$ LANGUAGE plpgsql;
```

**Checkpoint:** Can send messages, message count increments.

---

#### 11.2 Implement Real-time Subscriptions
**Update:** Chat screen to listen for new messages

**Claude Code Instructions:**
1. Set up Supabase Realtime subscription in chat screen
2. Listen for new messages in current match
3. Update message list when new message arrives
4. Show typing indicators (optional for MVP)

**Checkpoint:** Messages appear in real-time for both users.

---

### Day 12: Progressive Unblur Logic

#### 12.1 Define Unblur Milestones
**Create:** `src/features/chat/utils/blurCalculator.ts`

```typescript
export const BLUR_MILESTONES = [
  { messages: 0, blur: 20, percentage: 0 },    // Fully blurred
  { messages: 10, blur: 15, percentage: 25 },
  { messages: 25, blur: 10, percentage: 50 },
  { messages: 50, blur: 5, percentage: 75 },
  { messages: 100, blur: 0, percentage: 100 }, // Fully clear
];

export function calculateBlurFromMessages(messageCount: number): number {
  // Find current milestone
  for (let i = BLUR_MILESTONES.length - 1; i >= 0; i--) {
    if (messageCount >= BLUR_MILESTONES[i].messages) {
      return BLUR_MILESTONES[i].blur;
    }
  }
  return 20; // Default fully blurred
}

export function getNextMilestone(messageCount: number) {
  for (const milestone of BLUR_MILESTONES) {
    if (messageCount < milestone.messages) {
      return {
        ...milestone,
        remaining: milestone.messages - messageCount,
      };
    }
  }
  return null; // Fully unlocked
}
```

**Checkpoint:** Blur calculation works correctly.

---

#### 12.2 Update Match Blur State
**Create:** Database trigger or function to update blur status

```sql
-- Create function to check and update blur state
CREATE OR REPLACE FUNCTION update_match_blur()
RETURNS trigger AS $$
BEGIN
  -- Check if we hit a milestone
  IF NEW.total_messages >= 100 THEN
    UPDATE matches
    SET 
      is_unblurred = true,
      blur_points = 100
    WHERE id = NEW.id;
  ELSIF NEW.total_messages >= 50 THEN
    UPDATE matches SET blur_points = 75 WHERE id = NEW.id;
  ELSIF NEW.total_messages >= 25 THEN
    UPDATE matches SET blur_points = 50 WHERE id = NEW.id;
  ELSIF NEW.total_messages >= 10 THEN
    UPDATE matches SET blur_points = 25 WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_match_messages_change
  AFTER UPDATE OF total_messages ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_match_blur();
```

**Checkpoint:** Blur state updates in database when milestones hit.

---

### Day 13: Blur UI Implementation

#### 13.1 Create Blur Progress Component
**Create:** `src/features/chat/components/BlurProgressBar.tsx`

```typescript
export function BlurProgressBar({ match }: { match: Match }) {
  const messageCount = match.total_messages;
  const nextMilestone = getNextMilestone(messageCount);
  
  if (!nextMilestone) {
    return (
      <View style={styles.unlocked}>
        <Text>🎉 Photos fully unlocked!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {nextMilestone.remaining} messages until {nextMilestone.percentage}% clear
      </Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progress, 
            { width: `${match.blur_points}%` }
          ]} 
        />
      </View>
    </View>
  );
}
```

**Checkpoint:** Progress bar shows correctly in chat.

---

#### 13.2 Apply Blur to Photos
**Update:** All photo displays to use blur calculation

**Claude Code Instructions:**
1. In chat header, show blurred photo of match
2. In matches list, show blurred photo
3. Apply `blurRadius={calculateBlurFromMessages(messageCount)}` to Image
4. Show percentage unlocked text
5. Celebrate milestones with simple animation (optional)

**Example:**
```typescript
<Image
  source={{ uri: match.other_user.primary_photo }}
  blurRadius={calculateBlurFromMessages(match.total_messages)}
  style={styles.photo}
/>
<Text>Photos {match.blur_points}% clear</Text>
```

**Checkpoint:** Photos blur/unblur based on message count.

---

### Day 14: Chat Polish & Features

#### 14.1 Add Conversation Starters
**Create:** `src/features/chat/utils/conversationStarters.ts`

```typescript
export function generateConversationStarters(match: Match): string[] {
  const starters = [];
  
  // Based on personality insights
  if (match.ai_analysis?.interests) {
    starters.push(`What got you into ${match.ai_analysis.interests[0]}?`);
  }
  
  // Based on Spotify
  if (match.spotify_top_artist) {
    starters.push(`I see you like ${match.spotify_top_artist}! Favorite album?`);
  }
  
  // Generic but personalized
  starters.push(
    "What's something you're excited about lately?",
    "If you could travel anywhere right now, where?",
    "What's your go-to comfort food?"
  );
  
  return starters.slice(0, 3);
}
```

**Update chat screen:**
- If no messages yet, show 3 conversation starters
- Tap to use as first message
- Remove after first message sent

**Checkpoint:** Conversation starters help initiate chats.

---

#### 14.2 Add Message Timestamps
**Update:** `MessageBubble` component

```typescript
function MessageBubble({ message }: { message: Message }) {
  const isOwnMessage = message.sender_id === currentUserId;
  const timestamp = formatTimestamp(message.created_at);
  
  return (
    <View style={[
      styles.bubble,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={styles.content}>{message.content}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}
```

**Checkpoint:** Messages show appropriate timestamps.

---

### Day 15-16: Safety Features & Testing

#### 15.1 Add Report/Block Functionality
**Create:** `src/features/safety/components/ReportModal.tsx`

```typescript
export function ReportModal({ userId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  
  const reasons = [
    'Inappropriate messages',
    'Fake profile',
    'Spam',
    'Harassment',
    'Other',
  ];
  
  const handleReport = async () => {
    await supabase.from('reports').insert({
      reporter_id: currentUserId,
      reported_id: userId,
      reason,
      details,
      status: 'pending',
    });
    
    // Show confirmation
    Alert.alert('Report submitted', 'We'll review this within 24 hours.');
    onClose();
  };
  
  return (
    <Modal>
      <Text>Report User</Text>
      <Select options={reasons} value={reason} onChange={setReason} />
      <TextInput 
        placeholder="Additional details (optional)"
        value={details}
        onChangeText={setDetails}
      />
      <Button onPress={handleReport}>Submit Report</Button>
      <Button onPress={onClose}>Cancel</Button>
    </Modal>
  );
}
```

**Update chat screen:**
- Add "..." menu in header
- Options: Report, Block, Unmatch
- Show safety resources link

**Checkpoint:** Can report/block users from chat.

---

#### 15.2 Add Safety Resources Screen
**Create:** `app/(tabs)/settings/safety.tsx`

```typescript
export default function SafetyScreen() {
  return (
    <ScrollView>
      <Text style={styles.title}>Dating Safety Tips</Text>
      
      <Section title="Before Meeting">
        <Tip>Video chat first to verify identity</Tip>
        <Tip>Meet in public places</Tip>
        <Tip>Tell a friend where you're going</Tip>
      </Section>
      
      <Section title="During Dates">
        <Tip>Watch your drink at all times</Tip>
        <Tip>Have your own transportation</Tip>
        <Tip>Trust your instincts</Tip>
      </Section>
      
      <Button onPress={() => Linking.openURL('https://rainn.org')}>
        National Resources
      </Button>
    </ScrollView>
  );
}
```

**Checkpoint:** Safety resources accessible from settings.

---

#### 15.3 End-to-End Testing

**Test complete user flows:**

1. **New User Journey:**
   - [ ] Sign up
   - [ ] Complete onboarding (10 screens)
   - [ ] Upload photos
   - [ ] Record voice
   - [ ] Connect Spotify
   - [ ] Answer dealbreakers
   - [ ] See personality analysis
   - [ ] Profile created successfully

2. **Discovery & Matching:**
   - [ ] See profiles in discovery
   - [ ] Play voice intros
   - [ ] Read personality insights
   - [ ] Tap Connect/Pass
   - [ ] Mutual like creates match
   - [ ] Match appears in matches list

3. **Chat & Unblur:**
   - [ ] Open match from list
   - [ ] See blurred photo in header
   - [ ] Send message
   - [ ] Receive real-time response
   - [ ] Message count increments
   - [ ] Send 10 messages → blur reduces to 15
   - [ ] Progress bar shows next milestone
   - [ ] Send 25 messages → blur reduces to 10
   - [ ] Send 50 messages → blur reduces to 5
   - [ ] Send 100 messages → fully unblurred
   - [ ] Celebration shown

4. **Safety:**
   - [ ] Report user from chat
   - [ ] Block user
   - [ ] Blocked user disappears
   - [ ] Access safety resources

**Bug Fixes:**
- [ ] Fix any crashes
- [ ] Fix data not saving
- [ ] Fix navigation issues
- [ ] Fix UI glitches

**Checkpoint:** App works end-to-end with no critical bugs.

---

### 🎯 Phase 3 Completion Checklist

Before shipping to TestFlight, verify:

- [ ] Matches list shows all matches with blur status
- [ ] Can navigate to chat from matches
- [ ] Chat interface works (send/receive messages)
- [ ] Messages appear in real-time
- [ ] Message count increments correctly
- [ ] Blur reduces at milestones (10, 25, 50, 100)
- [ ] Progress bar shows next milestone
- [ ] Fully unblurred at 100 messages
- [ ] Conversation starters help first message
- [ ] Timestamps show correctly
- [ ] Report/block functionality works
- [ ] Safety resources accessible
- [ ] No critical bugs in end-to-end flow

**Final Metrics:**
```bash
# Count final screens
find app -name "*.tsx" | wc -l
# Target: ~20 total

# Count final components  
find src/components -name "*.tsx" | wc -l
# Target: ~30 total
```

**Git Checkpoint:**
```bash
git add .
git commit -m "Phase 3 complete: Chat with progressive unblur implemented"
git push origin mvp-simplify
```

---

## 📱 TestFlight Preparation

### Build & Deploy
```bash
# Install EAS CLI if needed
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile preview

# Build for Android
eas build --platform android --profile preview

# Submit to TestFlight (iOS)
eas submit --platform ios

# Submit to internal testing (Android)
eas submit --platform android
```

### Create Test Plan
**Share with testers:**
```markdown
# Blindish Beta Test Plan

## What to Test:
1. Complete onboarding (should take <10 min)
2. Explore discovery feed
3. Connect with test profiles
4. Send messages and watch blur reduce
5. Report any bugs or confusion

## What We're Looking For:
- Is onboarding too long/short?
- Is the blur effect compelling?
- Do you understand how it works?
- Would you use this to actually date?

## How to Report Issues:
- Screenshot + description
- Send to [your email]
```

---

## 🎯 Success Criteria

After Phase 3, you should have:

✅ **Functional MVP:**
- Onboarding: 10 screens, <10 minutes
- Discovery: Simple stack interface
- Matching: Instant mutual likes
- Chat: Real-time messaging
- Unblur: Works at milestones
- Safety: Report/block features

✅ **Clean Codebase:**
- ~20 total screens (down from 30+)
- ~30 total components (down from 50+)
- Simple design system
- No elaborate animations
- No technical debt

✅ **Ready to Ship:**
- Compiles without errors
- No critical bugs
- Works on iOS and Android
- Can deploy to TestFlight/Play Store
- Can onboard 50 beta testers

---

## 📊 Metrics to Track in Beta

After shipping, track these:

**Acquisition:**
- TestFlight installs
- Completed downloads

**Activation:**
- % who start onboarding
- % who complete onboarding
- Average time to complete
- Drop-off at each screen

**Engagement:**
- Daily active users
- % who create a match
- % who send first message
- Average messages per match
- % who reach each blur milestone

**Quality:**
- Average conversation length
- % reaching 100 messages (fully unblurred)
- Reports filed
- User feedback (NPS score)

**Retention:**
- Day 1 retention
- Day 7 retention
- Day 30 retention

---

## 🚀 Post-MVP Roadmap

After successful beta with 50+ users:

**Phase 4: Polish (2-3 weeks)**
- Add swipe gestures to discovery
- Improve loading states
- Add animations (subtle, not fairytale)
- Profile editing
- Settings customization

**Phase 5: Growth Features (1 month)**
- Push notifications
- Daily match suggestions
- Icebreaker prompts
- Voice messages in chat
- Photo verification

**Phase 6: Story Cards (1 month)** ← Bring back your creative work!
- Restore story-based match exploration
- Add back Spotify/YouTube cards
- Musical journey visualization
- Interesting differences highlights
- Photo compatibility insights

**Phase 7: Monetization (1 month)**
- Premium tier ($9.99/mo)
- See who connected with you
- Rewind on passes
- Advanced filters
- Read receipts

---

## 💡 Tips for Working with Claude Code

**Best Practices:**

1. **Work in phases** - Don't try to do everything at once
2. **Test after each day** - Verify changes work before moving on
3. **Commit frequently** - Git checkpoint at end of each day
4. **Ask for clarification** - If instructions unclear, ask before executing
5. **Show progress** - Report what's been completed at each checkpoint

**When to stop and ask:**
- If something breaks unexpectedly
- If a file/function doesn't exist where expected
- If unclear what "simplify" means for a specific component
- If encountering merge conflicts

**Communication format:**
```
✅ Completed: [task]
🚧 In progress: [task]
❌ Blocked: [issue]
❓ Question: [clarification needed]
```

---

## 📝 Daily Progress Template

Use this to track progress:

```markdown
## Day X Progress Report

**Date:** [date]
**Phase:** [1/2/3]
**Focus:** [what you worked on]

### Completed:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### In Progress:
- [ ] Task 4

### Blocked:
- [any issues]

### Notes:
[observations, decisions, questions]

### Tomorrow:
[what's next]
```

---

## ⚠️ Common Pitfalls to Avoid

1. **Don't skip checkpoints** - Test after each major change
2. **Don't delete files permanently** - Always archive first
3. **Don't optimize prematurely** - Focus on functionality first
4. **Don't add new features** - Stick to the plan
5. **Don't perfect the UI** - Good enough is good enough for MVP

---

## 🎉 You're Ready!

This guide gives you:
- Clear 3-phase roadmap
- Day-by-day breakdown
- Specific files to change
- Code examples
- Testing criteria
- Rollback strategy

**Estimated Timeline:**
- Phase 1: 3-4 days
- Phase 2: 4-5 days  
- Phase 3: 5-7 days
- **Total: 2-3 weeks to MVP**

**Next step:** Start Phase 1, Day 1 - Create archive branch and folders.

Good luck! 🚀
