/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Palette, Grid, Settings, Sparkles, Download, Upload, Check, Eye,
  Type, FileJson
} from 'lucide-react';
import { useAppState, store, playerActions } from '../store';
import { WallpaperConfig, AppThemeMode } from '../types';

export default function WallpaperThemes() {
  const currentTheme = useAppState(s => s.theme);
  const wallpaper = useAppState(s => s.wallpaper);
  const accentColor = useAppState(s => s.wallpaper.accentColor);

  const [backupString, setBackupString] = useState('');
  const [copied, setCopied] = useState(false);
  const [imported, setImported] = useState(false);
  const [customPrimary, setCustomPrimary] = useState(wallpaper.primaryColor);
  const [customAccent, setCustomAccent] = useState(wallpaper.accentColor);

  const themeModes: { id: AppThemeMode; name: string; desc: string; preview: string }[] = [
    { id: 'glassmorphism', name: 'Ambient Glass', desc: 'Sophisticated backdrops with transparent glass cards', preview: 'bg-zinc-950/40 border border-white/10 text-white' },
    { id: 'light', name: 'Zen Alabaster', desc: 'Minimal clean light interface for daytime listening', preview: 'bg-white text-zinc-900 border border-zinc-200 shadow-lg' },
    { id: 'dark', name: 'Cosmic Slate', desc: 'Pure black OLED safe background with minimal white texts', preview: 'bg-black text-white/90 border border-zinc-900' },
    { id: 'neon-arcade', name: 'Cyber Wave', desc: 'Deep vaporwave colors with neon pink glow attributes', preview: 'bg-purple-950 text-pink-400 border border-pink-500/25 shadow-pink-500/10' },
    { id: 'metallic', name: 'Brutalist Alloy', desc: 'Swiss layout featuring cold high-contrast steel gradients', preview: 'bg-zinc-900 text-zinc-200 border-2 border-zinc-700' }
  ];

  const presetsWallpapers: WallpaperConfig[] = [
    { type: 'live-particles', primaryColor: '#0a0d14', secondaryColor: '#101520', accentColor: '#3a86ff' },
    { type: 'galaxy-stars', primaryColor: '#080512', secondaryColor: '#120b24', accentColor: '#ff007f' },
    { type: 'neon-grid', primaryColor: '#0c051a', secondaryColor: '#170933', accentColor: '#00f5ff' },
    { type: 'gradient', primaryColor: '#050f0c', secondaryColor: '#09211c', accentColor: '#10b981' }
  ];

  const selectTheme = (themeId: AppThemeMode) => {
    store.setState(() => ({ theme: themeId }));
  };

  const applyWallpaper = (wallObj: WallpaperConfig) => {
    store.setState(() => ({ wallpaper: wallObj }));
    setCustomPrimary(wallObj.primaryColor);
    setCustomAccent(wallObj.accentColor);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.setState(s => ({
      wallpaper: {
        ...s.wallpaper,
        primaryColor: customPrimary,
        accentColor: customAccent
      }
    }));
  };

  // Preset accent dots
  const accentsArr = ['#3a86ff', '#ff007f', '#00f5ff', '#10b981', '#f72585', '#7209b7', '#ffb703', '#ffffff'];

  // Backup configuration serialization
  const exportThemeToText = () => {
    const sObj = {
      theme: store.getState().theme,
      wallpaper: store.getState().wallpaper,
      audioSettings: store.getState().audioSettings
    };
    const bStr = btoa(JSON.stringify(sObj));
    setBackupString(bStr);
    navigator.clipboard.writeText(bStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const importThemeFromText = () => {
    try {
      const decoded = JSON.parse(atob(backupString.trim()));
      if (decoded.theme || decoded.wallpaper) {
        store.setState(() => ({
          theme: decoded.theme || 'glassmorphism',
          wallpaper: decoded.wallpaper || wallpaper,
          audioSettings: decoded.audioSettings || store.getState().audioSettings
        }));
        setImported(true);
        setTimeout(() => setImported(false), 3000);
      }
    } catch (err) {
      alert('Invalid base64 Theme Code parsed.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      
      {/* 8-Col Left Section: Interactive Theme Modes & Wallpapers */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Core Theme Selectors */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Palette className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Theme Canvas Selection Panel
            </h3>
          </div>

          <div id="themes-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {themeModes.map(t => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  id={`theme-btn-${t.id}`}
                  onClick={() => selectTheme(t.id)}
                  className={`p-4 rounded-2xl border text-left flex flex-col gap-3 hover:scale-101 active:scale-95 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-white/15 bg-white/10 ring-1 ring-white/10' 
                      : 'border-white/5 bg-zinc-950/25 hover:bg-zinc-950/45'
                  }`}
                >
                  <div className={`h-16 rounded-xl flex items-center justify-center text-xs font-mono select-none ${t.preview}`}>
                    Auraluxe UI
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{t.name}</span>
                      {isSelected && <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />}
                    </h4>
                    <p className="text-4xs font-mono text-white/45 mt-0.5 leading-normal">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Wallpaper backdrops selection */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Grid className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">
              Dynamic Visual Wallpapers (Music Synced Loops)
            </h3>
          </div>

          <div id="wallpapers-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {presetsWallpapers.map((wall, i) => {
              const isSelected = wallpaper.type === wall.type;
              return (
                <button
                  key={i}
                  id={`wallpaper-preset-${i}`}
                  onClick={() => applyWallpaper(wall)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col gap-2 cursor-pointer transition-all hover:scale-101 active:scale-95 ${
                    isSelected
                      ? 'border-white/20 bg-white/8'
                      : 'border-white/5 bg-zinc-950/20'
                  }`}
                >
                  {/* Backdrop swatch preview rectangle */}
                  <div 
                    className="h-14 rounded-xl border border-white/5 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${wall.primaryColor}, ${wall.secondaryColor})` }}
                  >
                    <div 
                      className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: wall.accentColor }}
                    />
                    {wall.type === 'neon-grid' && (
                      <div className="absolute inset-0 border border-t border-b border-white/5 opacity-15" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-white/90 font-bold capitalize">{wall.type.replace('-', ' ')}</p>
                    <p className="text-[9px] font-mono text-white/40 leading-none mt-0.5">{wall.accentColor} Accent</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4-Col Right Section: Theme Customizer, Accents Picker and Backup Settings */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Custom Accent Dot board */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Accent Color Picker</h4>
          </div>

          <div id="accent-dots" className="grid grid-cols-4 gap-2.5 items-center justify-items-center py-1">
            {accentsArr.map(acc => {
              const isActive = accentColor === acc;
              return (
                <button
                  key={acc}
                  id={`accent-dot-${acc.replace('#', '')}`}
                  onClick={() => store.setState(s => ({ wallpaper: { ...s.wallpaper, accentColor: acc } }))}
                  className="h-7 w-7 rounded-full border-2 hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
                  style={{ backgroundColor: acc, borderColor: isActive ? '#fff' : 'rgba(255,255,255,0.1)' }}
                >
                  {isActive && <Check className="w-3.5 h-3.5 text-zinc-950 font-bold stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Backup settings export codes box */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <FileJson className="w-4.5 h-4.5 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Acoustic Backup Nodes</h4>
            </div>
          </div>

          <p className="text-4xs font-mono text-white/40 leading-normal">
            Export or import customized workspace arrangements, themes, equalizer gains and settings.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              id="export-backup-btn"
              onClick={exportThemeToText}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 font-bold text-zinc-950 text-2xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{copied ? 'Copy complete' : 'Export configuration Code'}</span>
            </button>

            <div className="flex flex-col gap-1.5 pt-1">
              <textarea
                id="backup-code-textarea"
                rows={2}
                placeholder="Paste backup encryption base64 string..."
                value={backupString}
                onChange={(e) => setBackupString(e.target.value)}
                className="bg-white/5 border border-white/15 h-14 p-2 rounded-xl text-[10px] font-mono text-white outline-none focus:border-white/20 resize-none"
              />
              <button
                id="import-backup-btn"
                disabled={!backupString.trim()}
                onClick={importThemeFromText}
                className="w-full py-1.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 font-bold text-white text-3xs rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-45"
              >
                <Upload className="w-3 h-3 text-emerald-400" />
                <span>{imported ? 'State updated!' : 'Import Base64'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
