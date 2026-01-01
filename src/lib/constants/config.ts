/**
 * Blindish App Configuration
 */

export const Config = {
  app: {
    name: 'Blindish',
    scheme: 'blindish',
    version: '1.0.0',
  },

  features: {
    // Progressive photo unblurring
    blur: {
      maxPoints: 20,
      pointsPerTextMessage: 1,
      pointsPerVoiceMessage: 3,
      maxBlurPixels: 24,
      minBlurPixels: 0,
    },

    // Matching
    matching: {
      maxDailyMatches: 20,
      minCompatibilityScore: 60,
      maxDistance: 50, // kilometers
    },

    // Photos
    photos: {
      maxCount: 6,
      maxSizeMB: 10,
      maxDimension: 1080,
      compressionQuality: 0.8,
    },

    // Voice messages
    voice: {
      maxDurationSeconds: 120,
      format: 'm4a',
    },

    // Personality analysis
    personality: {
      requiredDataSources: 1, // At least 1 of Spotify, YouTube, or Survey
    },
  },

  api: {
    openai: {
      model: 'gpt-4o',
      whisperModel: 'whisper-1',
      maxTokens: 2000,
    },
  },

  storage: {
    buckets: {
      photos: 'photos',
      voiceMessages: 'voice-messages',
    },
  },
} as const;
