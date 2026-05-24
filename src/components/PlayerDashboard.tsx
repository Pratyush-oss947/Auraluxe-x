/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX, 
  HelpCircle, Eye, Clock, ListMusic, Music, Heart, Mic, Activity, Flame,
  Share2, Zap, Hourglass, Shield, Lock, Trash2, Edit3, Settings, AlertTriangle
} from 'lucide-react';
import { useAppState, playerActions, store } from '../store';
import { AudioEngine } from './AudioEngine';
import { FREQUENCIES_32_BAND } from '../data';

export default function PlayerDashboard() {
  const currentTrackId = useAppState(s => s.currentTrackId);
  const tracks = useAppState(s => s.tracks);
  const isPlaying = useAppState(s => s.isPlaying);
  const isShuffle = useAppState(s => s.isShuffle);
  const repeatMode = useAppState(s => s.repeatMode);
  const volume = useAppState(s => s.volume);
  const speed = useAppState(s => s.speed);
  const isNormalized = useAppState(s => s.isNormalized);
  const favorites = useAppState(s => s.favorites);
  const visualizerMode = useAppState(s => s.visualizerMode);
  const activeTab = useAppState(s => s.activeTab);
  const accentColor = useAppState(s => s.wallpaper.accentColor);
  const sleepTimer = useAppState(s => s.sleepTimer);

  const track = tracks.find(t => t.id === currentTrackId) || tracks[0];
  const isFav = favorites.includes(track.id);

  // States
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('15');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync state with HTMLAudio currentTime periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(AudioEngine.getCurrentTime());
      setDuration(AudioEngine.getDuration());
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Play/Pause effect
  useEffect(() => {
    AudioEngine.syncAllSettings();
    if (isPlaying) {
      AudioEngine.play(track.url);
    } else {
      AudioEngine.pause();
    }
  }, [isPlaying, track, speed, volume, isNormalized]);

  // Handle Sleep Timer countdown
  useEffect(() => {
    if (sleepTimer === null) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(sleepTimer * 60);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          store.setState(() => ({ isPlaying: false, sleepTimer: null }));
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimer]);

  // Visualizer Animation Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing logic cleanly
    const resizeObserver = new ResizeObserver(() => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = canvas.parentElement?.clientHeight || 260;
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Dynamic state particles helper
    const particles: { x: number; y: number; size: number; speedY: number; speedX: number; color: string }[] = [];
    for (let p = 0; p < 45; p++) {
      particles.push({
        x: Math.random() * 500,
        y: Math.random() * 260,
        size: Math.random() * 3 + 1,
        speedY: -Math.random() * 0.5 - 0.2,
        speedX: (Math.random() - 0.5) * 0.4,
        color: `hsl(${Math.random() * 40 + 200}, 85%, 65%)`
      });
    }

    const draw = () => {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      
      const audioData = AudioEngine.getVisualizerData();
      const length = audioData.length;

      // Calculate simple peak power for dynamic beat reaction
      let ampSum = 0;
      for (let i = 0; i < length; i++) ampSum += audioData[i];
      const avgAmp = ampSum / length;
      const ampRatio = Math.max(1, avgAmp / 128); // scaling factor

      // Clear with background visual overlay trail
      ctx.fillStyle = 'rgba(10, 12, 18, 0.15)';
      ctx.fillRect(0, 0, W, H);

      // Render mode styles
      if (visualizerMode === 'spectrum') {
        const barWidth = (W / 64) - 2;
        let x = 0;
        for (let i = 0; i < 64; i++) {
          const value = audioData[i % length];
          const barHeight = (value / 255) * H * 0.85;

          // Gradient fill
          const grad = ctx.createLinearGradient(0, H, 0, H - barHeight);
          grad.addColorStop(0, accentColor);
          grad.addColorStop(0.5, '#7209b7');
          grad.addColorStop(1, '#ff007f');

          ctx.fillStyle = grad;
          // Round caps
          ctx.beginPath();
          ctx.roundRect(x, H - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          x += barWidth + 2;
        }

      } else if (visualizerMode === 'circular') {
        const centerX = W / 2;
        const centerY = H / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.5 + (ampRatio * 15);

        // Grid accents
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Draw frequency halo circle
        ctx.beginPath();
        for (let i = 0; i < 90; i++) {
          const angle = (i * 4 * Math.PI) / 180;
          const val = audioData[i % length];
          const radiusOffset = (val / 255) * 60;
          const r = baseRadius + radiusOffset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Tiny inner orbit
        ctx.fillStyle = '#ffffff12';
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius - 10, 0, Math.PI * 2);
        ctx.fill();

      } else if (visualizerMode === 'wave') {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = accentColor;
        
        const sliceWidth = W / length;
        let x = 0;

        ctx.moveTo(0, H / 2);
        for (let i = 0; i < length; i++) {
          const v = audioData[i] / 128.0;
          const y = (v * H) / 2;

          ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(W, H / 2);
        ctx.stroke();

        // Overlay ambient glow secondary wave
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#f72585';
        let x2 = 0;
        const sliceWidth2 = W / 100;
        ctx.moveTo(0, H / 2);
        for (let i = 0; i < 100; i++) {
          const v = audioData[(i * 2) % length] / 128.0;
          const y = (v * H) / 2 + Math.sin(i * 0.1 + Date.now() * 0.005) * 15;
          ctx.lineTo(x2, y);
          x2 += sliceWidth2;
        }
        ctx.stroke();

      } else if (visualizerMode === 'galaxy') {
        const centerX = W / 2;
        const centerY = H / 2;

        // Draw orbital particle points in galaxy pattern
        particles.forEach((p, idx) => {
          const ampVal = audioData[idx % length] || 50;
          p.y += p.speedY * (1 + ampVal * 0.015);
          p.x += p.speedX;

          if (p.y < 0) {
            p.y = H;
            p.x = Math.random() * W;
          }

          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + ampVal * 0.01), 0, Math.PI * 2);
          ctx.fill();
        });

        // Pulsating center star
        const starRad = 15 + ampRatio * 15;
        const pulseGrad = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, starRad * 2);
        pulseGrad.addColorStop(0, '#ffffff');
        pulseGrad.addColorStop(0.2, accentColor + '77');
        pulseGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = pulseGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, starRad * 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else { // Holographic neon
        const barWidth = 14;
        const count = Math.min(32, Math.floor(W / 18));
        const offset = (W - (count * 18)) / 2;

        for (let i = 0; i < count; i++) {
          const freqGain = audioData[i % length] || 60;
          const barsCount = Math.floor((freqGain / 255) * 12) + 1;
          for (let b = 0; b < barsCount; b++) {
            ctx.fillStyle = `hsl(${(i * 8 + b * 20) % 360}, 90%, ${70 - b * 3}%)`;
            ctx.fillRect(offset + i * 18, H - (b * 16) - 12, barWidth, 12);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visualizerMode, accentColor]);

  // Lyrics synced search/renderer
  const parseLyrics = (lyricsText: string) => {
    if (!lyricsText) return [];
    const lines = lyricsText.split('\n');
    const result: { time: number; text: string }[] = [];
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2})\]/;

    lines.forEach(line => {
      const match = timeReg.exec(line);
      if (match) {
        const mins = parseInt(match[1]);
        const secs = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const totalSecs = mins * 60 + secs + ms / 100;
        const text = line.replace(timeReg, '').trim();
        result.push({ time: totalSecs, text });
      }
    });

    return result;
  };

  const parsedLyrics = parseLyrics(track.lyrics || '');

  // Find currently selected lyrics index
  const activeLyricIdx = parsedLyrics.reduce((acc, current, idx) => {
    if (currentTime >= current.time) {
      return idx;
    }
    return acc;
  }, -1);

  // Auto scroll lyrics component
  useEffect(() => {
    if (lyricsContainerRef.current && activeLyricIdx !== -1) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIdx] as HTMLElement;
      if (activeEl) {
        lyricsContainerRef.current.scrollTo({
          top: activeEl.offsetTop - (lyricsContainerRef.current.clientHeight / 2) + 24,
          behavior: 'smooth'
        });
      }
    }
  }, [activeLyricIdx, showLyrics]);

  // Player helper handlers
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = parseFloat(e.target.value);
    setCurrentTime(nextVal);
    AudioEngine.seek(nextVal);
  };

  const toggleMute = () => {
    if (isMuted) {
      playerActions.setVolume(volume);
      setIsMuted(false);
    } else {
      playerActions.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    playerActions.setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const triggerSleepTimer = (minutes: number) => {
    store.setState(() => ({ sleepTimer: minutes }));
    setShowSleepMenu(false);
  };

  const formatTimerString = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatSeconds = (totalS: number) => {
    const m = Math.floor(totalS / 60);
    const s = Math.floor(totalS % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      
      {/* LEFT: Complete full rotating Vinyl Player & Visual Workspace (7 Col) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* The Cosmic Visualizer and Sound Field Deck */}
        <div className="relative glass-panel rounded-3xl p-5 h-[280px] overflow-hidden flex flex-col justify-between">
          
          {/* Header Controls Inside Stage */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-mono tracking-wider text-white/50 uppercase">
                {visualizerMode === 'circular' ? 'Multi-Axis Orbit Engine' : 'Holographic Spectrum Field'}
              </p>
            </div>
            
            <div className="flex gap-1.5 p-1 glass-panel-light rounded-xl">
              {(['spectrum', 'circular', 'wave', 'galaxy', 'neon'] as const).map(mode => (
                <button
                  key={mode}
                  id={`vis-mode-${mode}`}
                  onClick={() => store.setState(s => ({ visualizerMode: mode }))}
                  className={`px-3 py-1 text-2xs font-mono rounded-lg transition-all capitalize ${
                    visualizerMode === mode 
                      ? 'bg-white/10 text-white shadow-sm font-semibold' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* HTML5 Canvas Visualizer Animation */}
          <canvas 
            id="vibe-laser-canvas"
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-3xl" 
          />

          {/* Sparkly Spatial Indicators layered on visualizer */}
          <div className="flex items-end justify-between z-10 w-full mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 bg-white/5 rounded text-3xs font-mono text-emerald-400 border border-emerald-500/10">
                BAL: {store.getState().audioSettings.audioBalance}
              </div>
              <div className="px-2 py-1 bg-white/5 rounded text-3xs font-mono text-[#ff007f] border border-[#ff007f]/10">
                REVERB: {store.getState().audioSettings.reverbPreset.toUpperCase()}
              </div>
            </div>
            
            <div className="text-3xs font-mono text-white/30 text-right">
              FFT: 512 | SPEED: {speed.toFixed(1)}x
            </div>
          </div>
        </div>

        {/* Master Control Board (Rotating Vinyl Art, Media Controls) */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            
            {/* Spinning Master Vinyl Deck */}
            <div className="relative group flex-shrink-0">
              <div 
                className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity animate-pulse"
                style={{ content: '""' }}
              />
              <div 
                id="vinyl-record-holder"
                className={`relative h-32 w-32 rounded-full bg-zinc-950 border-4 border-white/15 flex items-center justify-center shadow-2xl overflow-hidden ${
                  isPlaying ? 'animate-vinyl' : 'animate-vinyl-paused'
                }`}
              >
                {/* Simulated Grooves */}
                <div className="absolute inset-2 border border-dashed border-white/5 rounded-full" />
                <div className="absolute inset-5 border border-white/5 rounded-full" />
                <div className="absolute inset-8 border border-white/10 rounded-full" />
                
                {/* Album Cover inside Center Hub */}
                <div className="h-14 w-14 rounded-full bg-zinc-900 border-2 border-zinc-950 overflow-hidden flex items-center justify-center">
                  <div className="text-white font-bold text-lg select-none">
                    {track.title[0]}
                  </div>
                </div>
              </div>
              
              {/* Dynamic Lock indicator */}
              <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-zinc-950/80 rounded-full border border-white/10 text-white leading-none">
                <Music className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>

            {/* Title & metadata info pane */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-1 text-3xs font-mono">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 uppercase font-semibold">
                  {track.highRes ? 'studio master 24-bit flac' : 'hi-res raw stream'}
                </span>
                <span className="px-2 py-0.5 bg-white/5 text-white/50 rounded-full border border-white/10">
                  {track.bpm} bpm
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-white tracking-tight leading-tight truncate">
                {track.title}
              </h2>
              <p className="text-sm text-white/60 font-medium truncate mt-0.5">
                {track.artist}
              </p>
              <p className="text-xs text-white/40 font-mono mt-1 italic truncate">
                Album: {track.album} • {track.year}
              </p>
            </div>
          </div>

          {/* Precision Seek Bar */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <input
                id="seek-slider"
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            
            <div className="flex justify-between text-3xs font-mono text-white/40 mt-1">
              <span>{formatSeconds(currentTime)}</span>
              <span>{formatSeconds(duration)}</span>
            </div>
          </div>

          {/* Master Cockpit Buttons Panel */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
            
            {/* Auxiliary micro options */}
            <div className="flex items-center gap-1">
              <button
                id="shuffle-btn"
                onClick={() => playerActions.toggleShuffle()}
                className={`p-2.5 rounded-xl transition-all ${
                  isShuffle 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                    : 'text-white/40 hover:text-white/70'
                }`}
                title="Smart Shuffle"
              >
                <Shuffle className="w-4.5 h-4.5" />
              </button>

              <button
                id="repeat-btn"
                onClick={() => playerActions.toggleRepeatMode()}
                className={`p-2.5 rounded-xl transition-all relative ${
                  repeatMode !== 'none'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'text-white/40 hover:text-white/70'
                }`}
                title={`Repeat Mode: ${repeatMode}`}
              >
                <Repeat className="w-4.5 h-4.5" />
                {repeatMode === 'one' && (
                  <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-[8px] font-bold text-white px-1 py-0.2 rounded-full leading-none">
                    1
                  </span>
                )}
              </button>

              {/* Volume normalize indicator */}
              <button
                id="normalizer-btn"
                onClick={() => store.setState(s => ({ isNormalized: !s.isNormalized }))}
                className={`p-2.5 rounded-xl transition-all ${
                  isNormalized
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-white/40 hover:text-white/70'
                }`}
                title="Volume Normalization"
              >
                <Zap className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Main Central Play Core */}
            <div className="flex items-center gap-3.5">
              <button
                id="prev-btn"
                onClick={() => playerActions.prevTrack()}
                className="p-3 bg-white/5 border border-white/5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <SkipBack className="w-5.5 h-5.5" />
              </button>

              <button
                id="play-pause-btn"
                onClick={() => playerActions.togglePlay()}
                className="p-4.5 rounded-2xl text-zinc-950 active:scale-90 transition-all font-bold shadow-lg"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 20px ${accentColor}50` }}
              >
                {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current translate-x-0.5" />}
              </button>

              <button
                id="next-btn"
                onClick={() => playerActions.nextTrack()}
                className="p-3 bg-white/5 border border-white/5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <SkipForward className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Quick adjust menu options (Volume, speed, sleep) */}
            <div className="flex items-center gap-1.5">
              
              {/* Speed dropdown control toggle */}
              <div className="relative">
                <button
                  id="speed-btn"
                  onClick={() => {
                    setShowSpeedControls(!showSpeedControls);
                    setShowSleepMenu(false);
                  }}
                  className={`p-2.5 rounded-xl transition-all text-xs font-mono font-medium ${
                    speed !== 1.0 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {speed.toFixed(1)}x
                </button>

                {showSpeedControls && (
                  <div className="absolute right-0 bottom-12 z-20 w-44 p-3 glass-panel rounded-2xl shadow-xl flex flex-col gap-2">
                    <p className="text-[10px] font-mono text-white/40 uppercase">Playback Rate</p>
                    <div className="grid grid-cols-4 gap-1">
                      {[0.5, 1.0, 1.2, 1.5, 1.8, 2.0].map(val => (
                        <button
                          key={val}
                          id={`speed-val-${val}`}
                          onClick={() => {
                            playerActions.setSpeed(val);
                            setShowSpeedControls(false);
                          }}
                          className={`py-1 text-2xs font-mono rounded ${
                            speed === val ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-white/5 hover:bg-white/10 text-white/70'
                          }`}
                        >
                          {val}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sleep timer utility click */}
              <div className="relative">
                <button
                  id="sleep-timer-btn"
                  onClick={() => {
                    setShowSleepMenu(!showSleepMenu);
                    setShowSpeedControls(false);
                  }}
                  className={`p-2.5 rounded-xl transition-all relative ${
                    sleepTimer !== null 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  title="Sleep Timer"
                >
                  <Clock className="w-4.5 h-4.5" />
                  {sleepTimer !== null && (
                    <span className="absolute -top-1.5 -right-1 text-[8px] font-mono font-bold text-rose-400 border border-rose-500/10 bg-zinc-950 px-1 py-0.1 rounded">
                      {timeLeft ? formatTimerString(timeLeft) : sleepTimer}
                    </span>
                  )}
                </button>

                {showSleepMenu && (
                  <div className="absolute right-0 bottom-12 z-20 w-48 p-4 glass-panel rounded-2xl shadow-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono text-white/40 uppercase">Sleep Timer</p>
                      {sleepTimer !== null && (
                        <button 
                          id="clear-sleep-btn"
                          onClick={() => triggerSleepTimer(0)}
                          className="text-[9px] font-mono text-red-400 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {[15, 30, 45, 60].map(m => (
                        <button
                          key={m}
                          id={`sleep-val-${m}`}
                          onClick={() => triggerSleepTimer(m)}
                          className="w-full py-1.5 px-3 bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/70 text-left rounded-lg font-mono flex items-center justify-between"
                        >
                          <span>{m} Minutes</span>
                          {sleepTimer === m && <span className="h-1.5 w-1.5 bg-rose-500 rounded-full" />}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-2xs pt-1 border-t border-white/5">
                      <input
                        id="custom-sleep-input"
                        type="number"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                        className="w-12 px-1 py-0.5 rounded bg-white/5 border border-white/10 text-white font-mono text-center outline-none"
                      />
                      <span className="text-white/50">min</span>
                      <button
                        id="custom-sleep-set"
                        onClick={() => {
                          const m = parseInt(customMinutes);
                          if (m > 0) triggerSleepTimer(m);
                        }}
                        className="ml-auto px-2 py-0.5 text-3xs font-semibold rounded text-zinc-950"
                        style={{ backgroundColor: accentColor }}
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Heart flag favorite toggle */}
              <button
                id="fav-toggle-btn"
                onClick={() => playerActions.toggleFavorite(track.id)}
                className={`p-2.5 rounded-xl transition-all ${
                  isFav 
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Heart className={`w-4.5 h-4.5 ${isFav ? 'fill-current' : ''}`} />
              </button>
            </div>

          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <button
              id="mute-btn"
              onClick={toggleMute}
              className="text-white/50 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeSlide}
              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-2xs font-mono text-white/40 w-8 text-right">
              {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
            </span>
          </div>

        </div>

      </div>

      {/* RIGHT: Dynamic Synced Lyrics Board & Playback Modes (5 Col) */}
      <div className="lg:col-span-5 flex flex-col gap-6 h-full">
        
        {/* Sync Karaoke Lyrics Terminal Section */}
        <div className="glass-panel rounded-3xl p-5 flex-1 flex flex-col min-h-[380px] max-h-[460px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Live Acoustic Lyrics
              </h3>
            </div>
            
            <button
              id="lyrics-view-toggle"
              onClick={() => setShowLyrics(!showLyrics)}
              className="text-xs font-mono text-white/50 hover:text-white flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            >
              <Mic className="w-3 h-3 text-emerald-400 h-3.5 w-3.5 fill-emerald-500/20" />
              <span>{showLyrics ? 'Normal Screen' : 'Karaoke Sync'}</span>
            </button>
          </div>

          {/* Scrolling Sync Body container */}
          <div 
            id="lyrics-scroll-box"
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 py-8 select-none"
            style={{ contentVisibility: 'auto' }}
          >
            {parsedLyrics.length > 0 ? (
              parsedLyrics.map((lyric, idx) => {
                const isActive = activeLyricIdx === idx;
                const isPassed = activeLyricIdx > idx;

                return (
                  <p
                    key={idx}
                    id={`lyric-line-${idx}`}
                    className={`text-base transition-all duration-300 font-medium ${
                      isActive 
                        ? 'text-white text-lg scale-102 filter opacity-100' 
                        : isPassed 
                          ? 'text-white/45 font-normal' 
                          : 'text-white/20'
                    }`}
                    style={{ 
                      textShadow: isActive ? `0 0 10px ${accentColor}40` : 'none',
                      color: isActive ? accentColor : undefined
                    }}
                  >
                    {lyric.text}
                  </p>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/40 gap-2">
                <Music className="w-10 h-10 stroke-1 opacity-60 animate-bounce" />
                <p className="text-xs font-semibold">Instrumental Segment</p>
                <p className="text-3xs font-mono">No synchronized lyric stamps parsed for this track.</p>
              </div>
            )}
          </div>
          
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-3xs font-mono text-white/30">
            <span>Synced Timeline Loop</span>
            <span>Auraluxe Lyrics Core</span>
          </div>
        </div>

        {/* Workspace Quick Smart Mode Adjuster Widget */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Smart Environment Modes</h3>
          </div>

          <div id="smart-modes-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2.5">
            {[
              { id: 'default', title: 'Default', desc: 'Stereo Hi-Fi standard output', icon: 'Headphones', color: 'text-blue-400 bg-blue-500/5' },
              { id: 'driving', title: 'Driving Mode', desc: 'Oversized controls for safety', icon: 'Car', color: 'text-orange-400 bg-orange-500/5' },
              { id: 'workout', title: 'Workout Zone', desc: 'BPM accelerator active', icon: 'Dumbbell', color: 'text-pink-400 bg-pink-500/5' },
              { id: 'focus', title: 'Study Space', desc: 'Binaural wave filter overlay', icon: 'BookOpen', color: 'text-emerald-400 bg-emerald-500/5' },
              { id: 'sleep', title: 'Sleep Sanctuary', desc: 'Deep alpha waves & ambient wind', icon: 'Moon', color: 'text-indigo-400 bg-indigo-500/5' },
              { id: 'meditation', title: 'Zen Chamber', desc: 'Harmonic sine-waves', icon: 'Compass', color: 'text-fuchsia-400 bg-fuchsia-500/5' }
            ].map(m => {
              const isActive = store.getState().playbackMode === m.id;
              return (
                <button
                  key={m.id}
                  id={`smart-mode-${m.id}`}
                  onClick={() => playerActions.setPlaybackMode(m.id as any)}
                  className={`p-3 text-left rounded-2xl hover:scale-101 border transition-all flex flex-col gap-1 ${
                    isActive 
                      ? 'border-white/15 bg-white/10' 
                      : 'border-white/5 bg-zinc-950/20 hover:bg-zinc-950/45'
                  }`}
                >
                  <p className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>{m.title}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  </p>
                  <p className="text-4xs font-mono text-white/40 leading-normal truncate">
                    {m.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
