/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track, EqualizerPreset } from './types';

export const CURATED_TRACKS: Track[] = [
  {
    id: 'cyber-neon',
    title: 'Neon Horizon',
    artist: 'Auraluxe Synth Project',
    album: 'Grid Runner 2099',
    genre: 'Synthwave',
    duration: 180,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'synthwave.png',
    highRes: true,
    bpm: 110,
    year: 2026,
    lyrics: `[00:00.00] Neon Horizon - Spatial Atmosphere Live
[00:05.00] Code running. Cyber systems initialized...
[00:12.00] The grid expands before our binary eyes.
[00:20.00] Glowing streams of fluorescent light.
[00:28.00] We trace the pathways through the heavy night.
[00:36.00] 32 channels of dynamic sound.
[00:44.00] Feel the sub-bass shaking the floorboards below.
[00:52.00] Reverb expanding through the simulation chamber.
[01:00.00] This is where data meets beautiful infinity.
[01:10.00] Synths soaring higher, breaking through.
[01:25.00] Acoustic boundaries bending for me and you.
[01:40.00] Back to the silence of the glowing code...
[01:55.00] Neon Horizon: Complete. All sectors locked.`
  },
  {
    id: 'ambient-stardust',
    title: 'Stardust Void',
    artist: 'Celestial Echoes',
    album: 'Deep Atmosphere Vol. IV',
    genre: 'Ambient',
    duration: 210,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'space.png',
    highRes: true,
    bpm: 72,
    year: 2025,
    lyrics: `[00:00.00] Stardust Void - Infinite Echo Simulator
[00:08.00] Silent drift into the celestial clouds.
[00:18.00] Soundwaves bounce off cosmic ice.
[00:30.00] Floating lightyears away from corporate hubs.
[00:45.00] No gravity, only acoustic balance.
[01:00.00] Space expansion. Left and right channel separation.
[01:20.00] Beautiful nebula particles rotating in sync.
[01:42.00] Sleep timer activated. Safe journey, pilot.
[02:00.00] Stardust Void... Echo fading out.`
  },
  {
    id: 'focus-binaural',
    title: 'Alpha Wave Sanctuary',
    artist: 'Neuroscape Labs',
    album: 'Psychoacoustic Synapse Engine',
    genre: 'Binaural / Chill',
    duration: 154,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'zen.png',
    highRes: false,
    bpm: 60,
    year: 2026,
    lyrics: `[00:00.00] Alpha Wave Sanctuary - Synced Brainwave Stimulation
[00:06.00] Synchronize deep breaths. Let go of secondary noise.
[00:15.00] 40Hz carrier wave loaded in spatial surround.
[00:25.00] Focus coordinates established. Timer running.
[00:40.00] Study Mode: Maximum visual and cognitive filter.
[01:00.00] Steady rhythmic hum keeping your focus anchored.
[01:25.00] Perfect acoustic resonance.
[01:45.00] Alpha Wave Sanctuary: Breathing cycle ending.`
  },
  {
    id: 'workout-electro',
    title: 'Quantum Overdrive',
    artist: 'BPM Acceleration Unit',
    album: 'Pulse Overlord',
    genre: 'Workout / Electro',
    duration: 195,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    coverUrl: 'pulse.png',
    highRes: true,
    bpm: 140,
    year: 2026,
    lyrics: `[00:00.00] Quantum Overdrive - Maximum BPM Acceleration
[00:04.00] Heartbeats ticking. Synching target speed.
[00:10.00] Power boost: On. Virtualizer widened.
[00:16.00] Push the limit. Bass response amplified.
[00:24.00] One, two, three, move to the spectrum flow.
[00:32.00] Accelerate. Speed controls adjusting.
[00:45.00] Feel the energetic currents in high fidelity.
[00:58.00] Unleash complete performance.
[01:15.00] Pulse pumping. Neon grids glowing.
[01:30.00] Keep going, there are no limits in the simulation.
[01:50.00] Core workout cycle finished. Overdrive cooling down.`
  }
];

export const EQ_PRESETS: EqualizerPreset[] = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Auraluxe Ultra HD', gains: [5, 4, 2, 1, 0, 1, 2, 4, 5, 6] },
  { name: 'Sub Bass Extender', gains: [8, 7, 5, 2, 0, -1, -2, -1, 1, 2] },
  { name: 'Vocal Presence', gains: [-3, -2, 0, 2, 4, 6, 5, 3, 1, 0] },
  { name: 'Spacious Hall', gains: [3, 2, 1, 0, -1, 1, 2, 3, 4, 3] },
  { name: 'Chillhop Lo-Fi', gains: [2, 3, 1, -1, -2, -3, -1, 0, 1, -2] },
  { name: 'Cinematic Thrill', gains: [6, 5, 2, -1, -2, 1, 3, 5, 6, 7] }
];

export const FREQUENCIES_10_BAND = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

// Expanded 32 bands list for our high-precision simulation visualizer
export const FREQUENCIES_32_BAND = [
  16, 20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500,
  630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000,
  10000, 12500, 16000, 20000
];
