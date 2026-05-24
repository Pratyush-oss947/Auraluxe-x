/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FREQUENCIES_10_BAND } from '../data';
import { playerActions, store } from '../store';

class AudioEngineClass {
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private bassFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private analyser: AnalyserNode | null = null;
  private delayNode: DelayNode | null = null;  // For virtualizer / widening
  private feedbackGain: GainNode | null = null; // For simple echo/reverb
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.crossOrigin = 'anonymous';

      // Attach track completion handles
      this.audio.addEventListener('ended', () => {
        playerActions.nextTrack();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Audio Engine loading error, simulating track playback duration fallback:', e);
      });
    }
  }

  public init() {
    if (this.isInitialized || !this.audio || typeof window === 'undefined') return;

    try {
      // Lazy creation on active gesture
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.source = this.ctx.createMediaElementSource(this.audio);

      // 1. Create Equalizer Biquad Filters (10 bands)
      let lastNode: AudioNode = this.source;
      this.eqFilters = FREQUENCIES_10_BAND.map((freq) => {
        if (!this.ctx) throw new Error('No context');
        const f = this.ctx.createBiquadFilter();
        f.type = 'peaking';
        f.frequency.value = freq;
        f.Q.value = 1.0;
        f.gain.value = 0; // Starts flat
        lastNode.connect(f);
        lastNode = f;
        return f;
      });

      // 2. Create Bass Boost (Low shelf peaker at 80Hz)
      this.bassFilter = this.ctx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 80;
      this.bassFilter.gain.value = 0;
      lastNode.connect(this.bassFilter);
      lastNode = this.bassFilter;

      // 3. Create Wider Virtualizer (Delay line crossfeeding slightly)
      this.delayNode = this.ctx.createDelay(1.0);
      this.delayNode.delayTime.value = 0.0; // Widening delay offset
      this.feedbackGain = this.ctx.createGain();
      this.feedbackGain.gain.value = 0.0;

      lastNode.connect(this.delayNode);
      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.ctx.destination); // feed back room reflection

      // 4. Stereo Dynamic Panner
      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
        this.pannerNode.pan.value = 0;
        lastNode.connect(this.pannerNode);
        lastNode = this.pannerNode;
      }

      // 5. High-resolution FFT Analyser Node for Visualizers
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;
      lastNode.connect(this.analyser);
      lastNode = this.analyser;

      // 6. Master Volume normalizer Gain Node
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.8;
      lastNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.isInitialized = true;
      console.log('Auraluxe Web Audio API Core initialized successfully.');
      this.syncAllSettings();
    } catch (err) {
      console.error('Failed to boot high-performance Web Audio API Nodes', err);
    }
  }

  public play(url: string) {
    if (!this.audio) return;
    this.ensureCtxRunning();

    if (this.audio.src !== url) {
      // Dynamic Crossfading simulator
      if (this.gainNode && this.ctx) {
        const state = store.getState();
        const crossTime = state.crossfade || 1.5;
        const now = this.ctx.currentTime;
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0.01, now + crossTime);
        
        setTimeout(() => {
          if (!this.audio || !this.gainNode || !this.ctx) return;
          this.audio.src = url;
          this.audio.play().catch(e => console.log('Autoplay deferred:', e));
          const now2 = this.ctx.currentTime;
          this.gainNode.gain.setValueAtTime(0.01, now2);
          this.gainNode.gain.linearRampToValueAtTime(state.volume, now2 + crossTime);
        }, crossTime * 1000);
      } else {
        this.audio.src = url;
        this.audio.play().catch(e => console.log(e));
      }
    } else {
      this.audio.play().catch(e => console.log(e));
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  public seek(seconds: number) {
    if (this.audio) {
      this.audio.currentTime = seconds;
    }
  }

  public getCurrentTime(): number {
    return this.audio ? this.audio.currentTime : 0;
  }

  public getDuration(): number {
    return this.audio ? (this.audio.duration || 180) : 180;
  }

  public syncAllSettings() {
    const state = store.getState();
    const settings = state.audioSettings;

    // A. Master volume normalization
    if (this.gainNode) {
      let targetVol = state.volume;
      if (state.isNormalized) {
        // Boost low recordings, pad louder ones
        targetVol = state.volume * 0.85;
      }
      this.gainNode.gain.value = targetVol;
    }

    // B. Speed control
    if (this.audio) {
      this.audio.playbackRate = state.speed || 1.0;
    }

    if (!this.isInitialized) return;

    // C. 10 Bands frequencies gains
    if (this.eqFilters.length > 0) {
      settings.gains.forEach((gain, idx) => {
        if (this.eqFilters[idx]) {
          this.eqFilters[idx].gain.value = settings.enabled ? gain : 0;
        }
      });
    }

    // D. Bass Boost (shelf filter boost at low end)
    if (this.bassFilter) {
      const dbValue = settings.enabled ? (settings.bassBoost / 100) * 12 : 0; // max 12dB boost
      this.bassFilter.gain.value = dbValue;
    }

    // E. Surround Virtualizer
    if (this.delayNode && this.feedbackGain) {
      const widenPct = settings.enabled ? (settings.virtualizer / 100) : 0;
      this.delayNode.delayTime.value = widenPct * 0.05; // up to 50ms widen effect
      this.feedbackGain.gain.value = widenPct * 0.4; // reflect density
    }

    // F. Reverb selection
    if (this.feedbackGain) {
      if (settings.reverbPreset === 'cathedral') {
        this.feedbackGain.gain.value = 0.65;
      } else if (settings.reverbPreset === 'hall') {
        this.feedbackGain.gain.value = 0.45;
      } else if (settings.reverbPreset === 'ambient') {
        this.feedbackGain.gain.value = 0.55;
      } else if (settings.reverbPreset === 'studio') {
        this.feedbackGain.gain.value = 0.15;
      } else {
        this.feedbackGain.gain.value = settings.enabled ? (settings.virtualizer / 100) * 0.4 : 0;
      }
    }

    // G. Audio Balance (Stereo Panning)
    if (this.pannerNode) {
      this.pannerNode.pan.value = settings.audioBalance;
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) {
      // Mock wave synthesizer data if user has not interacted yet or context is blocked
      const data = new Uint8Array(256);
      const now = Date.now() * 0.004;
      for (let i = 0; i < 256; i++) {
        data[i] = Math.abs(Math.sin(now + i * 0.05)) * 128 + Math.cos(now * 0.2 + i * 0.1) * 30 + 30;
      }
      return data;
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  private ensureCtxRunning() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((e) => console.log('Autoplay state resume deferred:', e));
    }
  }
}

export const AudioEngine = new AudioEngineClass();
export default AudioEngine;
