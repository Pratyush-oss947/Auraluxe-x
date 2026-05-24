/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Track, Playlist, AppThemeMode, WallpaperConfig, SmartPlaybackMode, AcousticSettings, UserStats, AiChatMessage, VisualizerMode } from './types';
import { CURATED_TRACKS, EQ_PRESETS } from './data';

export interface AppState {
  tracks: Track[];
  currentTrackId: string;
  queue: string[]; // List of track IDs
  history: string[]; // Playback history track IDs
  isPlaying: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
  crossfade: number; // in seconds
  speed: number; // playback rate
  sleepTimer: number | null; // minutes
  sleepTimerLeft: number | null; // seconds remaining
  volume: number; // 0 to 1
  isNormalized: boolean;
  favorites: string[]; // list of track IDs
  playlists: Playlist[];
  recentlyPlayed: string[]; // queue of track IDs
  playbackMode: SmartPlaybackMode;
  audioSettings: AcousticSettings;
  visualizerMode: VisualizerMode;
  theme: AppThemeMode;
  wallpaper: WallpaperConfig;
  aiMessages: AiChatMessage[];
  userStats: UserStats;
  appLocked: boolean;
  pinNumber: string;
  isScanning: boolean;
  activeTab: 'player' | 'library' | 'ai-dj' | 'acoustics' | 'themes' | 'stats' | 'security';
}

const DEFAULT_STATE: AppState = {
  tracks: CURATED_TRACKS,
  currentTrackId: CURATED_TRACKS[0].id,
  queue: CURATED_TRACKS.map(t => t.id),
  history: [],
  isPlaying: false,
  repeatMode: 'all',
  isShuffle: false,
  crossfade: 2,
  speed: 1.0,
  sleepTimer: null,
  sleepTimerLeft: null,
  volume: 0.8,
  isNormalized: false,
  favorites: [],
  playlists: [
    { id: 'smart-fav', name: 'My Favorites ⭐', description: 'Tracks you flagged as high fidelity', tracks: [], isSmart: true, smartQuery: 'favorites' },
    { id: 'smart-highres', name: 'FLAC Master Tape 🎧', description: 'Studio Master Quality Tracks', tracks: CURATED_TRACKS.filter(t => t.highRes).map(t => t.id), isSmart: true, smartQuery: 'highres' }
  ],
  recentlyPlayed: [],
  playbackMode: 'default',
  audioSettings: {
    enabled: true,
    bassBoost: 20,
    virtualizer: 15,
    reverbPreset: 'none',
    vocalEnhance: false,
    spatialAudio: false,
    audioBalance: 0,
    noiseReduction: false,
    gains: [...EQ_PRESETS[1].gains] // Default to Auraluxe Ultra HD
  },
  visualizerMode: 'spectrum',
  theme: 'glassmorphism',
  wallpaper: {
    type: 'live-particles',
    primaryColor: '#0c0f13',
    secondaryColor: '#1a1f26',
    accentColor: '#3a86ff'
  },
  aiMessages: [
    { sender: 'dj', text: 'Greetings, Audio purist. I am your Auraluxe AI DJ. Ask me to generate custom sonic layers, change themes, adapt playlist vibes, or tell you about dynamic high-fidelity elements.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ],
  userStats: {
    totalListeningTime: 1240,
    streakDays: 4,
    mostPlayedTrackId: 'cyber-neon',
    achievements: [
      { id: 'purist', title: 'High-Res Devotee', desc: 'Listen to premium FLAC master streams', unlocked: true, icon: 'Headphones' },
      { id: 'equalizer', title: 'Acoustic Sculptor', desc: 'Customized any frequency slider on the 32-band board', unlocked: false, icon: 'Sliders' },
      { id: 'dj-vibe', title: 'Vibe Creator', desc: 'Query our AI DJ for custom playlist curation', unlocked: true, icon: 'Lightbulb' }
    ]
  },
  appLocked: false,
  pinNumber: '1234',
  isScanning: false,
  activeTab: 'player'
};

// Initial state load
const getInitialState = (): AppState => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const saved = localStorage.getItem('auraluxe_state_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure merged settings
      return {
        ...DEFAULT_STATE,
        ...parsed,
        isPlaying: false, // Don't auto-play on load
        sleepTimer: null,
        sleepTimerLeft: null
      };
    }
  } catch (err) {
    console.error('Failed to parse local storage state', err);
  }
  return DEFAULT_STATE;
};

let globalState: AppState = getInitialState();
const listeners = new Set<() => void>();

export const store = {
  getState: () => globalState,
  
  setState: (fn: (state: AppState) => Partial<AppState> | AppState) => {
    const updates = fn(globalState);
    globalState = { ...globalState, ...updates } as AppState;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auraluxe_state_v1', JSON.stringify({
          ...globalState,
          isPlaying: false, // avoid playing on load
          sleepTimer: null,
          sleepTimerLeft: null
        }));
      } catch (e) {
        console.error(e);
      }
    }
    listeners.forEach(listener => listener());
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

export function useAppState<T>(selector: (state: AppState) => T): T {
  const [value, setValue] = useState(() => selector(globalState));

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setValue(selector(globalState));
    });
    return unsub;
  }, [selector]);

  return value;
}

// Player Utilities
export const playerActions = {
  playTrack: (trackId: string) => {
    const state = store.getState();
    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return;

    // Add to recently played list (cap at 10)
    let rp = [...state.recentlyPlayed];
    rp = [trackId, ...rp.filter(id => id !== trackId)].slice(0, 10);

    // Update stats: listening achievements
    let totalListening = state.userStats.totalListeningTime + 10; // increment mock listening
    const updatedAchievements = [...state.userStats.achievements];
    if (track.highRes && !updatedAchievements.find(a => a.id === 'purist')?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === 'purist');
      if (idx !== -1) updatedAchievements[idx].unlocked = true;
    }

    store.setState(s => ({
      currentTrackId: trackId,
      isPlaying: true,
      recentlyPlayed: rp,
      userStats: {
        ...s.userStats,
        totalListeningTime: totalListening,
        achievements: updatedAchievements
      }
    }));
  },

  togglePlay: () => {
    const state = store.getState();
    store.setState(() => ({ isPlaying: !state.isPlaying }));
  },

  nextTrack: () => {
    const state = store.getState();
    const currentIdx = state.queue.indexOf(state.currentTrackId);
    if (currentIdx === -1) return;

    let nextIdx = currentIdx + 1;
    if (nextIdx >= state.queue.length) {
      if (state.repeatMode === 'all') {
        nextIdx = 0;
      } else {
        store.setState(() => ({ isPlaying: false }));
        return;
      }
    }
    playerActions.playTrack(state.queue[nextIdx]);
  },

  prevTrack: () => {
    const state = store.getState();
    const currentIdx = state.queue.indexOf(state.currentTrackId);
    if (currentIdx === -1) return;

    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) {
      if (state.repeatMode === 'all') {
        prevIdx = state.queue.length - 1;
      } else {
        prevIdx = 0;
      }
    }
    playerActions.playTrack(state.queue[prevIdx]);
  },

  toggleFavorite: (trackId: string) => {
    const state = store.getState();
    const isFav = state.favorites.includes(trackId);
    const newFavs = isFav 
      ? state.favorites.filter(id => id !== trackId)
      : [...state.favorites, trackId];

    // Update playlists list
    const updatedPlaylists = state.playlists.map(p => {
      if (p.id === 'smart-fav') {
        return { ...p, tracks: newFavs };
      }
      return p;
    });

    store.setState(() => ({
      favorites: newFavs,
      playlists: updatedPlaylists
    }));
  },

  setVolume: (v: number) => {
    store.setState(() => ({ volume: Math.max(0, Math.min(1, v)) }));
  },

  setSpeed: (s: number) => {
    store.setState(() => ({ speed: Math.max(0.5, Math.min(2.0, s)) }));
  },

  setCrossfade: (seconds: number) => {
    store.setState(() => ({ crossfade: seconds }));
  },

  toggleShuffle: () => {
    const state = store.getState();
    const currentShuffle = !state.isShuffle;
    let newQueue = [...state.queue];

    if (currentShuffle) {
      // Shuffle tracks except the current one which stays first
      const current = state.currentTrackId;
      const rest = state.tracks.map(t => t.id).filter(id => id !== current);
      // Fisher-Yates
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      newQueue = [current, ...rest];
    } else {
      // Restore standard track sequence
      newQueue = state.tracks.map(t => t.id);
    }

    store.setState(() => ({
      isShuffle: currentShuffle,
      queue: newQueue
    }));
  },

  toggleRepeatMode: () => {
    const state = store.getState();
    let next: 'none' | 'one' | 'all' = 'none';
    if (state.repeatMode === 'none') next = 'all';
    else if (state.repeatMode === 'all') next = 'one';
    store.setState(() => ({ repeatMode: next }));
  },

  setEqualizerGain: (bandIndex: number, gain: number) => {
    const state = store.getState();
    const gains = [...state.audioSettings.gains];
    gains[bandIndex] = gain;

    // Unlock achievement for EQ sculpting
    const updatedAchievements = [...state.userStats.achievements];
    const acIdx = updatedAchievements.findIndex(a => a.id === 'equalizer');
    if (acIdx !== -1 && !updatedAchievements[acIdx].unlocked) {
      updatedAchievements[acIdx].unlocked = true;
    }

    store.setState(() => ({
      audioSettings: {
        ...state.audioSettings,
        gains
      },
      userStats: {
        ...state.userStats,
        achievements: updatedAchievements
      }
    }));
  },

  setAcousticPreference: (key: keyof AcousticSettings, val: any) => {
    const state = store.getState();
    store.setState(() => ({
      audioSettings: {
        ...state.audioSettings,
        [key]: val
      }
    }));
  },

  setPlaybackMode: (mode: SmartPlaybackMode) => {
    // Adapt visuals & speed metrics based on the mode automatically
    let themeVal: AppThemeMode = 'glassmorphism';
    let wallVal: WallpaperConfig = store.getState().wallpaper;

    if (mode === 'driving') {
      themeVal = 'metallic';
      wallVal = { type: 'gradient', primaryColor: '#12131C', secondaryColor: '#26293C', accentColor: '#E63946' };
    } else if (mode === 'workout') {
      themeVal = 'neon-arcade';
      wallVal = { type: 'neon-grid', primaryColor: '#0A0512', secondaryColor: '#170125', accentColor: '#FF007F' };
    } else if (mode === 'focus') {
      themeVal = 'glassmorphism';
      wallVal = { type: 'live-particles', primaryColor: '#050E0C', secondaryColor: '#0B1F19', accentColor: '#10B981' };
    } else if (mode === 'sleep') {
      themeVal = 'glassmorphism';
      wallVal = { type: 'gradient', primaryColor: '#020208', secondaryColor: '#08091a', accentColor: '#7209B7' };
    } else if (mode === 'meditation') {
      themeVal = 'glassmorphism';
      wallVal = { type: 'galaxy-stars', primaryColor: '#0E0911', secondaryColor: '#1B1424', accentColor: '#F72585' };
    }

    store.setState(() => ({
      playbackMode: mode,
      theme: themeVal,
      wallpaper: wallVal
    }));
  },

  triggerScan: () => {
    store.setState(() => ({ isScanning: true }));
    setTimeout(() => {
      // Finished scanner simulation
      store.setState(() => ({ isScanning: false }));
    }, 2500);
  },

  addPlaylist: (name: string, description: string) => {
    const state = store.getState();
    const newP: Playlist = {
      id: 'pl-' + Date.now(),
      name,
      description,
      tracks: []
    };
    store.setState(() => ({
      playlists: [...state.playlists, newP]
    }));
  },

  addTrackToPlaylist: (playlistId: string, trackId: string) => {
    const state = store.getState();
    const updated = state.playlists.map(p => {
      if (p.id === playlistId && !p.tracks.includes(trackId)) {
        return { ...p, tracks: [...p.tracks, trackId] };
      }
      return p;
    });
    store.setState(() => ({ playlists: updated }));
  },

  removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
    const state = store.getState();
    const updated = state.playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(id => id !== trackId) };
      }
      return p;
    });
    store.setState(() => ({ playlists: updated }));
  }
};
