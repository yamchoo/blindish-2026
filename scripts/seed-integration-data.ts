/**
 * Seed Integration Data Script
 * Populates Spotify and YouTube data for test users to enable story cards
 *
 * Usage: npm run seed-integrations
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Realistic Spotify artist data with genres and followers
const spotifyArtists = {
  taylorSwift: { id: '06HL4z0CvFAxyc27GXpf02', name: 'Taylor Swift', genres: ['pop', 'singer-songwriter'], followers: 120000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb12a2ef08d00dd7451a6fbe99' },
  theWeeknd: { id: '1Xyo4u8uXC1ZmMpatF05PJ', name: 'The Weeknd', genres: ['r&b', 'pop'], followers: 95000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb' },
  billiEilish: { id: '6qqNVTkY8uBg9cP3Jd7DAH', name: 'Billie Eilish', genres: ['alt-pop', 'indie'], followers: 110000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb7fe225b5d90a0b02ea4a40d7' },
  drake: { id: '3TVXtAsR1Inumwj472S9r4', name: 'Drake', genres: ['hip-hop', 'r&b'], followers: 85000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9' },
  arianaGrande: { id: '66CXWjxzNUsdJxJ2JdwvnR', name: 'Ariana Grande', genres: ['pop', 'r&b'], followers: 90000000, image_url: 'https://i.scdn.co/image/ab6761610000e5ebb5b5f5b5b5b5b5b5b5b5b5b5' },
  edSheeran: { id: '6eUKZXaKkcviH0Ku9w2n3V', name: 'Ed Sheeran', genres: ['pop', 'singer-songwriter'], followers: 105000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb4f63b15f5a2e6e6e5b5b5b5b' },
  postMalone: { id: '246dkjvS1zLTtiykXe5h60', name: 'Post Malone', genres: ['hip-hop', 'pop'], followers: 78000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb1f1f1f1f1f1f1f1f1f1f1f1f' },
  dojaCat: { id: '5cj0lLjcoR7YOSnhnX0Po5', name: 'Doja Cat', genres: ['pop', 'r&b'], followers: 70000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb2e2e2e2e2e2e2e2e2e2e2e2e' },
  oliviaRodrigo: { id: '1McMsnEElThX1knmY4oliG', name: 'Olivia Rodrigo', genres: ['pop', 'alt-pop'], followers: 45000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb3e3e3e3e3e3e3e3e3e3e3e3e' },
  harryStyles: { id: '6KImCVD70vtIoJWnq6nGn3', name: 'Harry Styles', genres: ['pop', 'rock'], followers: 68000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb4e4e4e4e4e4e4e4e4e4e4e4e' },
  sza: { id: '7tYKF4w9nC0nq9CsPZTHyP', name: 'SZA', genres: ['r&b', 'neo-soul'], followers: 35000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb5e5e5e5e5e5e5e5e5e5e5e5e' },
  theChainSmokers: { id: '69GGBxA162lTqCwzJG5jLp', name: 'The Chainsmokers', genres: ['edm', 'pop'], followers: 42000000, image_url: 'https://i.scdn.co/image/ab6761610000e5eb6e6e6e6e6e6e6e6e6e6e6e6e' },
};

// YouTube channel data
const youtubeChannels = {
  mkbhd: { channel_id: 'UCBJycsmduvYEL83R_U4JriQ', channel_title: 'Marques Brownlee', description: 'Tech reviews and unboxing videos', thumbnail: 'https://yt3.ggpht.com/ytc/AGIKgqMp' },
  veritasium: { channel_id: 'UCHnyfMqiRRG1u-2MsSQLbXA', channel_title: 'Veritasium', description: 'Science and engineering videos', thumbnail: 'https://yt3.ggpht.com/ytc/Veritasium' },
  vsauce: { channel_id: 'UC6nSFpj9HTCZ5t-N3Rm3-HA', channel_title: 'Vsauce', description: 'Interesting questions and answers', thumbnail: 'https://yt3.ggpht.com/ytc/Vsauce' },
  bonAppetit: { channel_id: 'UCbpMy0Fg74eXXkvxJrtEn3w', channel_title: 'Bon Appétit', description: 'Cooking and food videos', thumbnail: 'https://yt3.ggpht.com/ytc/BonAppetit' },
  tedEd: { channel_id: 'UCsooa4yRKGN_zEE8iknghZA', channel_title: 'TED-Ed', description: 'Educational animated videos', thumbnail: 'https://yt3.ggpht.com/ytc/TEDEd' },
  kurzGesagt: { channel_id: 'UCsXVk37bltHxD1rDPwtNM8Q', channel_title: 'Kurzgesagt – In a Nutshell', description: 'Animated science videos', thumbnail: 'https://yt3.ggpht.com/ytc/Kurzgesagt' },
  caseyNeistat: { channel_id: 'UCtinbF-Q-fVthA0qrFQTgXQ', channel_title: 'Casey Neistat', description: 'Vlogs and filmmaking', thumbnail: 'https://yt3.ggpht.com/ytc/CaseyNeistat' },
  emmaChamberlain: { channel_id: 'UC78cxCAcp7JfQPgKxYdyGrg', channel_title: 'Emma Chamberlain', description: 'Lifestyle and comedy vlogs', thumbnail: 'https://yt3.ggpht.com/ytc/EmmaChamberlain' },
  primitiveTechnology: { channel_id: 'UCAL3JXZSzSm8AlZyD3nQdBA', channel_title: 'Primitive Technology', description: 'Building from scratch in the wild', thumbnail: 'https://yt3.ggpht.com/ytc/Primitive' },
  bingingWithBabish: { channel_id: 'UCJHA_jMfCvEnv-3kRjTCQXw', channel_title: 'Binging with Babish', description: 'Recreating food from movies/TV', thumbnail: 'https://yt3.ggpht.com/ytc/Babish' },
};

// User integration profiles with strategic overlaps
const userIntegrations = {
  'alice.test@blindish.app': {
    spotify: [
      spotifyArtists.taylorSwift,
      spotifyArtists.billiEilish,
      spotifyArtists.arianaGrande,
      spotifyArtists.oliviaRodrigo,
      spotifyArtists.harryStyles,
      spotifyArtists.sza,
    ],
    youtube: [
      youtubeChannels.mkbhd,
      youtubeChannels.tedEd,
      youtubeChannels.kurzGesagt,
      youtubeChannels.veritasium,
      youtubeChannels.emmaChamberlain,
    ],
  },
  'bob.test@blindish.app': {
    spotify: [
      spotifyArtists.billiEilish, // Shared with Alice
      spotifyArtists.harryStyles, // Shared with Alice
      spotifyArtists.theWeeknd,
      spotifyArtists.postMalone,
      spotifyArtists.theChainSmokers,
      spotifyArtists.drake,
    ],
    youtube: [
      youtubeChannels.mkbhd, // Shared with Alice
      youtubeChannels.kurzGesagt, // Shared with Alice
      youtubeChannels.bonAppetit,
      youtubeChannels.bingingWithBabish,
      youtubeChannels.caseyNeistat,
    ],
  },
  'charlie.test@blindish.app': {
    spotify: [
      spotifyArtists.taylorSwift, // Shared with Alice
      spotifyArtists.oliviaRodrigo, // Shared with Alice
      spotifyArtists.sza, // Shared with Alice
      spotifyArtists.billiEilish,
      spotifyArtists.edSheeran,
      spotifyArtists.dojaCat,
    ],
    youtube: [
      youtubeChannels.tedEd, // Shared with Alice
      youtubeChannels.veritasium, // Shared with Alice
      youtubeChannels.vsauce,
      youtubeChannels.primitiveTechnology,
      youtubeChannels.emmaChamberlain, // Shared with Alice
    ],
  },
};

async function seedIntegrationData() {
  console.log('\n🌱 Starting integration data seeding...\n');

  try {
    // Get all test users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .in('email', Object.keys(userIntegrations));

    if (profileError) {
      throw new Error(`Failed to fetch profiles: ${profileError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️  No test profiles found. Please run seed-test-profiles.ts first.');
      return;
    }

    console.log(`✅ Found ${profiles.length} test profiles\n`);

    // Seed data for each user
    for (const profile of profiles) {
      const integration = userIntegrations[profile.email as keyof typeof userIntegrations];
      if (!integration) continue;

      console.log(`📝 Seeding integration data for ${profile.name} (${profile.email})...`);

      // Upsert Spotify data
      const { error: spotifyError } = await supabase
        .from('spotify_user_data')
        .upsert({
          user_id: profile.id,
          top_artists: integration.spotify,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (spotifyError) {
        console.error(`   ❌ Spotify error for ${profile.name}:`, spotifyError.message);
      } else {
        console.log(`   ✅ Spotify: ${integration.spotify.length} artists`);
      }

      // Upsert YouTube data
      const { error: youtubeError } = await supabase
        .from('youtube_user_data')
        .upsert({
          user_id: profile.id,
          subscriptions: integration.youtube,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (youtubeError) {
        console.error(`   ❌ YouTube error for ${profile.name}:`, youtubeError.message);
      } else {
        console.log(`   ✅ YouTube: ${integration.youtube.length} channels`);
      }

      console.log();
    }

    console.log('✨ Integration data seeding complete!\n');
    console.log('📊 Shared content summary:');
    console.log('   • Alice ↔ Bob: 2 artists, 2 channels');
    console.log('   • Alice ↔ Charlie: 3 artists, 3 channels');
    console.log('   • Bob ↔ Charlie: 1 artist, 0 channels');

  } catch (error) {
    console.error('\n❌ Error seeding integration data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedIntegrationData();
