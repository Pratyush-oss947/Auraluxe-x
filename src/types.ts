/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number; // in seconds
  url: string; // audio resource or external highquality URL
  coverUrl: string; // visual artwork URL
  lyrics?: string; // synced lyrics format: "[00:12.30] Lyrics here" or raw text
  bpm?: number;
  year?: number;
  highRes?: boolean; // true for FLAC/WAV simulation indicators
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  icon?: string;
  tracks: string[]; // list of trackIds
  isSmart?: boolean;
  smartQuery?: string;
}

export type VisualizerMode = 'spectrum' | 'wave' | 'galaxy' | 'neon' | 'holographic' | 'circular';

export interface EqualizerPreset {
  name: string;
  gains: number[]; // 10 bands or 32 simulated bands representation (in dB, -12 to 12)
}

export interface AcousticSettings {
  enabled: boolean;
  bassBoost: number; // 0 to 100
  virtualizer: number; // 0 to 100 (surround widening)
  reverbPreset: string; // 'none' | 'hall' | 'cathedral' | 'ambient' | 'studio'
  vocalEnhance: boolean;
  spatialAudio: boolean;
  audioBalance: number; // -1 to 1 (left to right)
  noiseReduction: boolean;
  gains: number[]; // band gains
}

export type AppThemeMode = 'dark' | 'light' | 'glassmorphism' | 'neon-arcade' | 'metallic' | 'cyberpunk';

export interface WallpaperConfig {
  type: 'gradient' | 'live-particles' | 'galaxy-stars' | 'neon-grid';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  density?: number;
}

export type SmartPlaybackMode = 'default' | 'driving' | 'workout' | 'focus' | 'sleep' | 'meditation';

export interface UserStats {
  totalListeningTime: number; // in seconds
  streakDays: number;
  mostPlayedTrackId?: string;
  achievements: { id: string; title: string; desc: string; unlocked: boolean; icon: string }[];
}

export interface AiChatMessage {
  sender: 'user' | 'dj';
  text: string;
  timestamp: string;
}
