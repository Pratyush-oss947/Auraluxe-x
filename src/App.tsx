/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Music, Sliders, ListMusic, Bot, Palette, Trophy, ShieldCheck, 
  Play, Pause, SkipForward, Volume2, Lock, Unlock, KeyRound, Headphones, EyeOff
} from 'lucide-react';
import { useAppState, store, playerActions } from './store';
import PlayerDashboard from './components/PlayerDashboard';
import AcousticBoard from './components/AcousticBoard';
import LibraryManager from './components/LibraryManager';
import AiAssistant from './components/AiAssistant';
import WallpaperThemes from './components/WallpaperThemes';
import SocialRecap from './components/SocialRecap';
import SecurityConsole from './components/SecurityConsole';
import { AudioEngine } from './components/AudioEngine';

export default function App() {
  const activeTab = useAppState(s => s.activeTab);
  const currentTrackId = useAppState(s => s.currentTrackId);
  const tracks = useAppState(s => s.tracks);
  const isPlaying = useAppState(s => s.isPlaying);
  const volume = useAppState(s => s.volume);
  const themeMode = useAppState(s => s.theme);
  const wallpaper = useAppState(s => s.wallpaper);
  const appLocked = useAppState(s => s.appLocked);
  const pinNumber = useAppState(s => s.pinNumber);

  const track = tracks.find(t => t.id === currentTrackId) || tracks[0];

  // PIN entry for Locked Screen overlay
  const [lockedPin, setLockedPin] = useState('');
  const [lockError, setLockError] = useState(false);

  // Sync Audio context
  useEffect(() => {
    AudioEngine.init();
    AudioEngine.syncAllSettings();
  }, []);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedPin === pinNumber) {
      store.setState(() => ({ appLocked: false }));
      setLockedPin('');
      setLockError(false);
    } else {
      setLockError(true);
      setLockedPin('');
    }
  };

  const menuItems = [
    { id: 'player' as const, label: 'Player Engine', icon: Music, desc: '60FPS cockpit & visuals' },
    { id: 'acoustics' as const, label: 'Acoustics Lab', icon: Sliders, desc: '32-Band EQ & spatializers' },
    { id: 'library' as const, label: 'Audio Library', icon: ListMusic, desc: 'File scanner & duplicates' },
    { id: 'ai-dj' as const, label: 'Cyber DJ Studio', icon: Bot, desc: 'Gemini assistant loop' },
    { id: 'themes' as const, label: 'Canvas Themes', icon: Palette, desc: 'Presets & backup settings' },
    { id: 'stats' as const, label: 'Achievements', icon: Trophy, desc: 'Listening streaks & recaps' },
    { id: 'security' as const, label: 'Clearance Vault', icon: ShieldCheck, desc: 'App vault configurations' }
  ];

  return (
    <div 
      className={`min-h-screen relative flex flex-col font-sans transition-all duration-700 ease-in-out select-none ${
        themeMode === 'light' ? 'bg-zinc-50 text-zinc-900' : 'bg-[#040608] text-[#f1f2f5]'
      }`}
      style={{
        background: themeMode === 'light' 
          ? 'linear-gradient(135deg, #f4f4f6 0%, #e4e7eb 100%)' 
          : `radial-gradient(circle at 50% 50%, ${wallpaper.secondaryColor} 0%, ${wallpaper.primaryColor} 100%)`
      }}
    >
      
      {/* Dynamic Animated Wallpaper grid layers inside App background */}
      {wallpaper.type === 'neon-grid' && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30" />
      )}
      {wallpaper.type === 'galaxy-stars' && (
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-color-dodge bg-[radial-gradient(ellipse_at_top,#7209b7,#ff007f)] animate-glow" />
      )}

      {/* Header bar */}
      <header className="z-10 px-6 py-4 flex items-center justify-between border-b border-white/5 glass-panel-light">
        <div className="flex items-center gap-3">
          <div 
            className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-white shadow-lg animate-vinyl-paused"
            style={{ 
              backgroundColor: wallpaper.accentColor,
              boxShadow: `0 0 15px ${wallpaper.accentColor}50`
            }}
          >
            A
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Auraluxe Premium Studio
              <span className="text-[8px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/15 rounded leading-none">
                v1.2.6 LIVE
              </span>
            </h1>
            <p className="text-[10px] text-white/40 font-mono">Multidimensional Audio Workspace</p>
          </div>
        </div>

        {/* Dynamic playback activity banner */}
        <div className="hidden md:flex items-center gap-3 p-2.5 bg-zinc-950/20 border border-white/5 rounded-2xl">
          <Headphones className="w-4 h-4 text-white/50" />
          <div className="text-left leading-none max-w-44">
            <p className="text-3xs font-mono text-white/40 uppercase">Acoustic Destination</p>
            <p className="text-2xs font-semibold text-white mt-1 truncate">{track.title}</p>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      {/* Main Body Columns */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start z-10">
        
        {/* Left Rail Menu Drawer Column (3 Cols) */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <p className="text-[10px] font-mono text-white/40 uppercase px-3 pb-1 tracking-wider">Acoustic Navigation Hub</p>
          <div id="nav-rail" className="flex flex-col gap-1.5">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => store.setState(() => ({ activeTab: item.id }))}
                  className={`p-3.5 rounded-2xl text-left border flex items-center gap-3.5 transition-all group cursor-pointer ${
                    isActive 
                      ? 'border-white/10 bg-white/10 font-bold shadow-md' 
                      : 'border-white/5 bg-zinc-950/15 hover:bg-zinc-950/30'
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-white/10 text-white' 
                      : 'bg-white/5 text-white/40 group-hover:text-white/70'
                  }`}
                  style={{ color: isActive ? wallpaper.accentColor : undefined }}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  
                  <div className="leading-tight">
                    <p className={`text-xs text-white ${isActive ? 'font-bold' : 'font-medium text-white/70 group-hover:text-white/90'}`}>{item.label}</p>
                    <p className="text-[9px] font-mono text-white/45 mt-0.5">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Center Workstation Display (9 Cols) */}
        <div id="main-workstation-panel" className="md:col-span-9 h-full">
          {activeTab === 'player' && <PlayerDashboard />}
          {activeTab === 'acoustics' && <AcousticBoard />}
          {activeTab === 'library' && <LibraryManager />}
          {activeTab === 'ai-dj' && <AiAssistant />}
          {activeTab === 'themes' && <WallpaperThemes />}
          {activeTab === 'stats' && <SocialRecap />}
          {activeTab === 'security' && <SecurityConsole />}
        </div>

      </main>

      {/* Floating Global Compact Mini-Player Bar when browsing other tabs */}
      {activeTab !== 'player' && (
        <div className="sticky bottom-4 left-0 right-0 max-w-5xl mx-auto px-4 z-15 pb-2 animate-float">
          <div className="glass-panel-heavy rounded-2xl p-3 border border-white/10 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className={`h-10 w-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-white text-md overflow-hidden ${
                  isPlaying ? 'animate-vinyl' : 'animate-vinyl-paused'
                }`}
              >
                {track.title[0]}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate leading-none">{track.title}</h4>
                <p className="text-4xs font-mono text-white/45 truncate mt-1">{track.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Previous trigger shortcut */}
              <button
                id="mini-prev"
                onClick={() => playerActions.prevTrack()}
                className="text-white/50 hover:text-white transition-colors"
              >
                <Music className="w-4 h-4" />
              </button>

              {/* Main play pause icon */}
              <button
                id="mini-play-pause"
                onClick={() => playerActions.togglePlay()}
                className="p-2.5 rounded-xl text-zinc-950 font-bold active:scale-90 transition-all shadow-sm"
                style={{ backgroundColor: wallpaper.accentColor }}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-0.2" />}
              </button>

              {/* Next trigger shortcut */}
              <button
                id="mini-next"
                onClick={() => playerActions.nextTrack()}
                className="text-white/50 hover:text-white transition-colors p-1"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failsafe Lock Screen Overlay blocks out page completely if true */}
      {appLocked && (
        <div id="app-lockscreen-overlay" className="fixed inset-0 z-50 bg-[#06080c]/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-fade-in p-6 select-none">
          <div className="glass-panel rounded-3xl p-8 max-w-sm w-full flex flex-col items-center justify-center text-center gap-5 border border-white/12 shadow-2xl">
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-md font-bold text-white tracking-wide uppercase">Auraluxe Secured Node</h3>
              <p className="text-4xs font-mono text-white/40 mt-1 italic">Authorized Personal Clearance Required</p>
            </div>

            {/* Locked PIN entry */}
            <form onSubmit={handleUnlockSubmit} className="flex flex-col gap-3 w-full">
              <input
                id="lockscreen-pin-input"
                type="password"
                maxLength={4}
                required
                value={lockedPin}
                onChange={(e) => {
                  setLockedPin(e.target.value);
                  setLockError(false);
                }}
                placeholder="ENTER 4-DIGIT PIN"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white text-center font-mono outline-none tracking-widest focus:border-white/20"
              />

              {lockError && (
                <p className="text-[10px] font-mono text-red-400 font-bold">Verification Passcode Mismatch.</p>
              )}

              <button
                id="lockscreen-bypass-btn"
                type="submit"
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 font-bold text-zinc-950 text-2xs rounded-xl active:scale-95 transition-all"
                style={{ backgroundColor: wallpaper.accentColor }}
              >
                Sign Clearance Code
              </button>
            </form>

            <div className="text-[9px] font-mono text-white/30 pt-2 border-t border-white/5 w-full">
              Default passcode: <span className="text-blue-400 font-semibold">{pinNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Toast message notifications container */}
      <div id="toast-vault" className="fixed bottom-4 right-4 z-40" />

    </div>
  );
}
