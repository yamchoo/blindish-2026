/**
 * useStoryCards Hook
 *
 * Manages story card state, navigation, and dynamic card generation based on available data.
 * Tracks which cards the user has liked for granular conversation triggers.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSharedContent, type SharedContent } from '../services/sharedContentService';
import type { PotentialMatch } from '../types';

// ============================================================================
// Type Definitions
// ============================================================================

export type StoryCardType =
  | 'intro'
  | 'spotify'
  | 'youtube'
  | 'personality'
  | 'lifestyle'
  | 'photo'
  | 'decision'
  | 'life-with-bob'
  | 'musical-journey'
  | 'ai-photo'
  | 'interesting-differences';

export interface StoryCardData {
  /** Unique card type */
  type: StoryCardType;

  /** Blur amount for background photo (24 = heavy, 12 = 50%, 0 = clear) */
  blurAmount: number;

  /** Card-specific data payload */
  data: any;

  /** Order in the sequence */
  index: number;
}

export interface CardReaction {
  cardType: StoryCardType;
  content: any;
  timestamp: Date;
}

export interface UseStoryCardsReturn {
  /** Dynamically generated cards (4-7 cards based on data availability) */
  cards: StoryCardData[];

  /** Current card index (0-based) */
  currentIndex: number;

  /** Total number of cards */
  totalCards: number;

  /** Navigate to next card */
  goToNext: () => void;

  /** Navigate to previous card */
  goToPrevious: () => void;

  /** Jump to specific card index */
  goToCard: (index: number) => void;

  /** Like the current card */
  likeCurrentCard: (content?: any) => void;

  /** Unlike a previously liked card */
  unlikeCard: (index: number) => void;

  /** Set of card indices that have been liked */
  likedCardIndices: Set<number>;

  /** Array of card reactions with metadata */
  reactions: CardReaction[];

  /** Whether shared content is being fetched */
  isLoading: boolean;

  /** Error message if fetch failed */
  error: string | null;

  /** Shared content data */
  sharedContent: SharedContent | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useStoryCards(
  currentUserId: string,
  match: PotentialMatch
): UseStoryCardsReturn {
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCardIndices, setLikedCardIndices] = useState<Set<number>>(new Set());
  const [reactions, setReactions] = useState<CardReaction[]>([]);
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shared content on mount
  useEffect(() => {
    let isMounted = true;

    async function loadSharedContent() {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[useStoryCards] Fetching shared content...');
        const content = await fetchSharedContent(currentUserId, match.id);

        if (isMounted) {
          setSharedContent(content);
          console.log('[useStoryCards] Shared content loaded:', {
            sharedArtists: content.spotify.sharedArtists.length,
            sharedChannels: content.youtube.sharedChannels.length,
          });
        }
      } catch (err) {
        console.error('[useStoryCards] Failed to fetch shared content:', err);
        if (isMounted) {
          setError('Failed to load match insights');
          // Set empty content so UI can still render
          setSharedContent({
            spotify: { sharedArtists: [], sharedTracks: [], totalSharedArtists: 0 },
            youtube: { sharedChannels: [], totalSharedChannels: 0 },
            personality: { topSharedTraits: [], overallCompatibility: 0 },
            lifestyle: { compatibleValues: [], neutralValues: [] },
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSharedContent();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, match.id]);

  // Helper: Generate interesting differences from personality contrasts
  const generateInterestingDifferences = useCallback(() => {
    // Placeholder logic - in production, would analyze personality differences
    // For now, return sample differences if personality data exists
    if (!sharedContent?.personality || sharedContent.personality.topSharedTraits.length === 0) {
      return [];
    }

    return [
      {
        title: "Energy Balance",
        description: `${match.name}'s outgoing energy complements your thoughtful nature`,
        icon: "flash-outline" as const,
        color: "#FF6B6B",
      },
      {
        title: "Decision Styles",
        description: "Your planning mindset balances their spontaneity",
        icon: "git-branch-outline" as const,
        color: "#4ECDC4",
      },
      {
        title: "Communication",
        description: "Different perspectives that enrich conversations",
        icon: "chatbubbles-outline" as const,
        color: "#95E1D3",
      },
    ];
  }, [sharedContent, match.name]);

  // Fixed narrative card sequence (5-8 cards)
  const cards = useMemo<StoryCardData[]>(() => {
    if (!sharedContent) {
      return [];
    }

    const generatedCards: StoryCardData[] = [];
    let cardIndex = 0;

    // Card 1: Life with Bob intro (ALWAYS)
    generatedCards.push({
      type: 'life-with-bob',
      blurAmount: 24,
      data: {
        name: match.name,
        personality: match.personality,
      },
      index: cardIndex++,
    });

    // Card 2: Musical Journey (ALWAYS - includes fallback for no shared artists)
    generatedCards.push({
      type: 'musical-journey',
      blurAmount: 18,
      data: {
        sharedArtists: sharedContent.spotify.sharedArtists,
      },
      index: cardIndex++,
    });

    // Card 3: AI Photo Compatibility (conditional - if AI analysis exists)
    const aiAnalysis = (match.primaryPhoto as any)?.aiAnalysis;
    if (aiAnalysis) {
      generatedCards.push({
        type: 'ai-photo',
        blurAmount: 18,
        data: aiAnalysis,
        index: cardIndex++,
      });
    }

    // Card 4: YouTube (conditional - if shared channels exist)
    if (sharedContent.youtube.sharedChannels.length > 0) {
      generatedCards.push({
        type: 'youtube',
        blurAmount: 12,
        data: {
          sharedChannels: sharedContent.youtube.sharedChannels,
        },
        index: cardIndex++,
      });
    }

    // Card 5: Interesting Differences (conditional - if personality data exists)
    const differences = generateInterestingDifferences();
    if (differences.length > 0) {
      generatedCards.push({
        type: 'interesting-differences',
        blurAmount: 12,
        data: {
          differences,
        },
        index: cardIndex++,
      });
    }

    // Card 6: Lifestyle (conditional - if compatible values exist)
    if (sharedContent.lifestyle.compatibleValues.length > 0) {
      generatedCards.push({
        type: 'lifestyle',
        blurAmount: 12,
        data: {
          compatibleValues: sharedContent.lifestyle.compatibleValues,
        },
        index: cardIndex++,
      });
    }

    // Card 7: Photo Preview (ALWAYS)
    generatedCards.push({
      type: 'photo',
      blurAmount: 12,
      data: {
        photoUrl: match.primaryPhoto.url,
        name: match.name,
        age: match.age,
        topTraits: match.personality?.highlights?.slice(0, 3) || [],
      },
      index: cardIndex++,
    });

    // Card 8: Decision (ALWAYS)
    generatedCards.push({
      type: 'decision',
      blurAmount: 12,
      data: {
        name: match.name,
      },
      index: cardIndex++,
    });

    console.log('[useStoryCards] Generated', generatedCards.length, 'narrative cards');
    return generatedCards;
  }, [sharedContent, match, generateInterestingDifferences]);

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
  }, [cards.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToCard = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, cards.length - 1));
      setCurrentIndex(clampedIndex);
    },
    [cards.length]
  );

  // Like/unlike functions
  const likeCurrentCard = useCallback(
    (content?: any) => {
      if (currentIndex >= cards.length) return;

      const card = cards[currentIndex];
      const reactionContent = content || card.data;

      console.log('[useStoryCards] Liking card:', card.type, 'at index', currentIndex);

      // Add to liked indices
      setLikedCardIndices((prev) => new Set(prev).add(currentIndex));

      // Add to reactions array
      setReactions((prev) => [
        ...prev,
        {
          cardType: card.type,
          content: reactionContent,
          timestamp: new Date(),
        },
      ]);
    },
    [currentIndex, cards]
  );

  const unlikeCard = useCallback((index: number) => {
    console.log('[useStoryCards] Unliking card at index', index);

    setLikedCardIndices((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });

    setReactions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    cards,
    currentIndex,
    totalCards: cards.length,
    goToNext,
    goToPrevious,
    goToCard,
    likeCurrentCard,
    unlikeCard,
    likedCardIndices,
    reactions,
    isLoading,
    error,
    sharedContent,
  };
}

// ============================================================================
// Utility Hook: Auto-advance timer (optional)
// ============================================================================

/**
 * Optional hook to auto-advance cards after a delay (like Instagram Stories)
 * Can be used for Cards 1-2 that don't need user interaction
 */
export function useAutoAdvance(
  enabled: boolean,
  delayMs: number,
  onAdvance: () => void
) {
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      onAdvance();
    }, delayMs);

    return () => clearTimeout(timer);
  }, [enabled, delayMs, onAdvance]);
}
