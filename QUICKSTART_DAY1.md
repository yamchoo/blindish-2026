# QUICKSTART: Phase 1, Day 1
## For Claude Code - Start Here

**Goal:** Set up archive structure and begin simplification safely  
**Time:** 2-3 hours  
**Working Directory:** `/Users/amy/blindish-capacitor`

---

## ✅ Pre-flight Checklist

Before starting, verify:
- [ ] You have the SIMPLIFICATION_GUIDE.md open for reference
- [ ] You're in the project directory: `/Users/amy/blindish-capacitor`
- [ ] The app currently runs: `npm start` works
- [ ] You have uncommitted changes saved or committed

---

## 🎯 Phase 1, Day 1 Tasks

### Task 1: Create Safety Net (15 min)

**Why:** Never simplify without a backup!

**Commands:**
```bash
cd /Users/amy/blindish-capacitor

# Create archive branch
git checkout -b archive/pre-simplification-$(date +%Y%m%d)
git add .
git commit -m "Archive: Full codebase before MVP simplification"
git push origin archive/pre-simplification-$(date +%Y%m%d)

# Return to main and create working branch
git checkout main
git checkout -b mvp-simplify

# Verify you're on the right branch
git branch --show-current
# Should show: mvp-simplify
```

**Checkpoint:** ✅ Archive branch created, on mvp-simplify branch

---

### Task 2: Create Archive Directories (5 min)

**Why:** We're moving files, not deleting them.

**Commands:**
```bash
# Create archive structure
mkdir -p src/_archived/components/ui
mkdir -p src/_archived/features/matching
mkdir -p src/_archived/stores
mkdir -p app/_archived/onboarding
mkdir -p scripts/_archived

# Verify folders created
ls -la src/_archived
ls -la app/_archived
```

**Checkpoint:** ✅ Archive directories exist

---

### Task 3: Document Current State (10 min)

**Why:** Baseline metrics to measure progress.

**Commands:**
```bash
# Count current screens
echo "Current screens:" > METRICS.txt
find app -name "*.tsx" | wc -l >> METRICS.txt

# Count current components
echo "Current components:" >> METRICS.txt
find src/components -name "*.tsx" | wc -l >> METRICS.txt

# List onboarding screens
echo "Onboarding screens:" >> METRICS.txt
find app/\(onboarding\) -name "*.tsx" >> METRICS.txt

# Show metrics
cat METRICS.txt
```

**Expected output:**
```
Current screens: ~35
Current components: ~45
Onboarding screens: 30+
```

**Checkpoint:** ✅ Baseline metrics documented

---

### Task 4: Archive Fairytale UI (30 min)

**Why:** Remove decorative complexity first.

**Step 4.1: Move fairytale components**
```bash
# Archive entire fairytale folder
mv src/components/ui/fairytale src/_archived/components/ui/

# Verify move
ls src/components/ui/fairytale 2>/dev/null && echo "FAILED" || echo "SUCCESS"
ls src/_archived/components/ui/fairytale && echo "ARCHIVED" || echo "MISSING"
```

**Step 4.2: Update imports**

Find all files importing fairytale components:
```bash
grep -r "from.*fairytale" src/ app/
```

For each file found, update imports:
- Remove fairytale component imports
- Replace with simple alternatives

**Example replacements:**

Before:
```typescript
import { GoldenCircleFrame } from '@/components/ui/fairytale';

<GoldenCircleFrame size={190}>
  <Image source={photo} />
</GoldenCircleFrame>
```

After:
```typescript
<View style={{ borderRadius: 95, overflow: 'hidden', borderWidth: 2, borderColor: '#D4AF37' }}>
  <Image source={photo} style={{ width: 190, height: 190 }} />
</View>
```

**Step 4.3: Remove from index**

Edit `src/components/ui/index.ts`:
```typescript
// Remove these lines:
export * from './fairytale';
```

**Step 4.4: Test**
```bash
npm start
# Verify app compiles
# Check for any import errors
```

**Checkpoint:** ✅ Fairytale components archived, app still compiles

---

### Task 5: Archive Story Cards (45 min)

**Why:** Complex matching UI → simple stack.

**Step 5.1: Move story-cards folder**
```bash
# Archive entire story-cards system
mv src/features/matching/components/story-cards src/_archived/features/matching/

# Verify
ls src/_archived/features/matching/story-cards
```

**Step 5.2: Create SimpleProfileCard**

Create new file: `src/features/matching/components/SimpleProfileCard.tsx`

```typescript
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimpleProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    distance: number;
    primaryPhoto: { url: string };
    personalityInsights: string[];
    voiceIntroUrl?: string;
  };
  onConnect: () => void;
  onPass: () => void;
}

export function SimpleProfileCard({ profile, onConnect, onPass }: SimpleProfileCardProps) {
  return (
    <View style={styles.container}>
      {/* Blurred photo background */}
      <Image
        source={{ uri: profile.primaryPhoto.url }}
        style={styles.photo}
        blurRadius={20}
      />
      
      {/* Content overlay */}
      <View style={styles.content}>
        <Text style={styles.name}>{profile.name}, {profile.age}</Text>
        <Text style={styles.distance}>{profile.distance} miles away</Text>
        
        {/* Personality insights */}
        <View style={styles.insights}>
          {profile.personalityInsights.slice(0, 3).map((insight, i) => (
            <Text key={i} style={styles.insight}>• {insight}</Text>
          ))}
        </View>
        
        {/* Voice player placeholder */}
        {profile.voiceIntroUrl && (
          <TouchableOpacity style={styles.voiceButton}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.voiceText}>Hear voice intro</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.passButton} onPress={onPass}>
          <Ionicons name="close" size={32} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.connectButton} onPress={onConnect}>
          <Ionicons name="heart" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  photo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 100,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  distance: {
    fontSize: 18,
    color: '#fff',
    marginTop: 4,
  },
  insights: {
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    borderRadius: 12,
  },
  insight: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 24,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  voiceText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  actions: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  connectButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
```

**Step 5.3: Update discovery screen**

Edit `app/(tabs)/index.tsx` to use SimpleProfileCard instead of story system.

**Step 5.4: Test**
```bash
npm start
# Navigate to discovery
# Verify simple card appears
```

**Checkpoint:** ✅ Story cards archived, simple card works

---

### Task 6: Git Checkpoint (5 min)

**Why:** Save progress before continuing.

**Commands:**
```bash
git add .
git commit -m "Day 1: Archived fairytale UI and story cards, created SimpleProfileCard"
git push origin mvp-simplify
```

**Checkpoint:** ✅ Day 1 changes committed

---

## 📊 End of Day 1 Metrics

**Verify progress:**
```bash
# Count remaining components
find src/components -name "*.tsx" | wc -l
# Should be ~10-15 fewer than baseline

# Verify archives
ls src/_archived/components/ui/fairytale
ls src/_archived/features/matching/story-cards

# App still works
npm start
```

**Expected state:**
- ✅ Archive branch created (safety net)
- ✅ Fairytale components archived
- ✅ Story cards archived  
- ✅ SimpleProfileCard created
- ✅ App compiles and runs
- ✅ Changes committed to git

---

## 🚀 What's Next?

**Day 2 Preview:**
- Archive communication screens
- Archive lifestyle intro screens
- Consolidate basic-info screens
- Archive unnecessary scripts

**Tomorrow's time estimate:** 3-4 hours

---

## ❓ Troubleshooting

**"App won't compile after archiving fairytale"**
- Check for remaining imports: `grep -r "fairytale" src/ app/`
- Replace with simple View components
- Remove from index.ts exports

**"SimpleProfileCard not rendering"**
- Check props being passed match interface
- Verify profile data structure
- Check console for errors

**"Git push failed"**
- May need to set upstream: `git push -u origin mvp-simplify`
- Verify branch name: `git branch --show-current`

---

## 📞 When to Stop and Ask

Stop and ask Amy if:
- [ ] More than 2 files are breaking from archive
- [ ] Database schema needs changes
- [ ] API integrations stop working
- [ ] Unclear how to simplify a specific component

---

## ✅ Day 1 Success Criteria

You're ready for Day 2 if:
- [ ] Archive branch exists
- [ ] mvp-simplify branch is current
- [ ] Fairytale folder is in _archived/
- [ ] Story-cards folder is in _archived/
- [ ] SimpleProfileCard.tsx exists
- [ ] App runs with `npm start`
- [ ] Discovery screen shows simple cards
- [ ] All changes are committed

**If all checkboxes are ✅, you crushed Day 1! 🎉**

---

**Ready to continue? Move to Day 2 in SIMPLIFICATION_GUIDE.md**
