/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, Volume2, ShieldCheck, Zap, Disc, Speaker, Headphones, Radio, Sparkles } from 'lucide-react';
import { useAppState, playerActions, store } from '../store';
import { AudioEngine } from './AudioEngine';
import { EQ_PRESETS, FREQUENCIES_10_BAND } from '../data';

export default function AcousticBoard() {
  const audioSettings = useAppState(s => s.audioSettings);
  const accentColor = useAppState(s => s.wallpaper.accentColor);

  const handleGainChange = (idx: number, gain: number) => {
    playerActions.setEqualizerGain(idx, gain);
    AudioEngine.syncAllSettings();
  };

  const handleSettingChange = (key: keyof typeof audioSettings, value: any) => {
    playerActions.setAcousticPreference(key, value);
    AudioEngine.syncAllSettings();
  };

  const selectPreset = (presetName: string) => {
    const preset = EQ_PRESETS.find(p => p.name === presetName);
    if (!preset) return;

    preset.gains.forEach((g, idx) => {
      playerActions.setEqualizerGain(idx, g);
    });
    AudioEngine.syncAllSettings();
  };

  // Human friendly labels for some frequencies
  const getFrequencyLabel = (freq: number) => {
    if (freq < 1000) return `${freq}Hz`;
    return `${freq / 1000}kHz`;
  };

  const getFrequencyDesc = (freq: number) => {
    if (freq <= 62) return 'Sub-bass deep kick';
    if (freq <= 125) return 'Bass response body';
    if (freq <= 250) return 'Lower vocals, warm mid';
    if (freq <= 500) return 'Instrument presence';
    if (freq <= 1000) return 'Core vocal, attack';
    if (freq <= 2000) return 'Crisp presence, snap';
    if (freq <= 4000) return 'Clarity & definition';
    if (freq <= 8000) return 'Shimmer, high vocal';
    return 'Brilliance, air airy feel';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      
      {/* 10-Band Equalizer Sliders Cockpit Container (7 Cols) */}
      <div className="lg:col-span-7 glass-panel rounded-3xl p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4.5 h-4.5" style={{ color: accentColor }} />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              32-Band Precision Equalizer (10 Core Co-processors)
            </h3>
          </div>
          
          <select
            id="preset-select"
            onChange={(e) => selectPreset(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white outline-none cursor-pointer focus:border-white/20"
          >
            <option value="" className="bg-zinc-950 text-white/50">Custom Filter Sculpt</option>
            {EQ_PRESETS.map(p => (
              <option key={p.name} value={p.name} className="bg-zinc-950 text-white">
                Preset: {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Master EQ toggle */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-950/30 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${audioSettings.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              <Speaker className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Acoustic Equalizer Node</p>
              <p className="text-4xs font-mono text-white/40">Real-time Web Audio API frequency convolution biquad filters</p>
            </div>
          </div>
          
          <button
            id="eq-toggle-btn"
            onClick={() => handleSettingChange('enabled', !audioSettings.enabled)}
            className={`w-14 h-7 p-1 rounded-full transition-colors relative ${audioSettings.enabled ? 'bg-emerald-500' : 'bg-white/10'}`}
          >
            <span className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${audioSettings.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Interactive Slider Columns */}
        <div className="grid grid-cols-10 gap-2 sm:gap-4 md:gap-5 h-64 pt-4 pb-2 items-center justify-items-center">
          {audioSettings.gains.map((gainVal, idx) => {
            const freq = FREQUENCIES_10_BAND[idx];
            return (
              <div key={freq} id={`eq-col-${freq}`} className="flex flex-col items-center h-full gap-2 relative group w-full">
                
                {/* Micro tooltip hovering over gain */}
                <div className="absolute -top-6 bg-zinc-900 border border-white/10 text-[9px] font-mono rounded px-1 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {gainVal > 0 ? '+' : ''}{gainVal} dB
                </div>

                <div className="text-[10px] font-mono text-white/40 group-hover:text-white transition-colors">{getFrequencyLabel(freq)}</div>
                
                {/* Real-time Slider input */}
                <div className="flex-1 w-full flex justify-center py-2 h-full">
                  <input
                    id={`eq-slide-${freq}`}
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    disabled={!audioSettings.enabled}
                    value={gainVal}
                    orient="vertical" // Legacy support
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }} // Standard modern vertical slider
                    onChange={(e) => handleGainChange(idx, parseFloat(e.target.value))}
                    className="h-full w-2 appearance-none cursor-grab rounded-full bg-white/10 accent-blue-500 outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="text-3xs font-mono text-white/50 bg-white/5 py-0.5 px-1 rounded">{gainVal}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/2 pt-3 border-t border-white/5 text-3xs font-mono text-white/30 flex justify-between">
          <span>MIN: -12.0dB</span>
          <span>FLAT: 0.0dB</span>
          <span>MAX: +12.0dB</span>
        </div>
      </div>

      {/* Acoustic Sculptor details Panel (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Spatializer & Reverb Presets Board */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Radio className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Dimension Acoustic Reverb Simulator
            </h3>
          </div>

          <div id="reverb-grid" className="grid grid-cols-2 gap-2">
            {[
              { id: 'none', label: 'Dry studio', desc: 'Raw uncolored sound signature' },
              { id: 'studio', label: 'Cozy Lounge', desc: 'Short organic delay, warm proximity' },
              { id: 'hall', label: 'Concert Hall', desc: 'Large high-fidelity reflection pattern' },
              { id: 'cathedral', label: 'Sacred Cathedral', desc: 'Infinite echoing, cathedral brick walls' },
              { id: 'ambient', label: 'Ocean Twilight', desc: 'Floating slow decaying space' }
            ].map(preset => {
              const isActive = audioSettings.reverbPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`reverb-preset-${preset.id}`}
                  onClick={() => handleSettingChange('reverbPreset', preset.id)}
                  disabled={!audioSettings.enabled}
                  className={`p-3 text-left rounded-2xl hover:scale-101 border transition-all disabled:opacity-30 flex flex-col gap-0.5 ${
                    isActive 
                      ? 'border-white/15 bg-white/10 font-bold' 
                      : 'border-white/5 bg-zinc-950/20 hover:bg-zinc-950/45'
                  }`}
                >
                  <p className="text-xs text-white">{preset.label}</p>
                  <p className="text-4xs font-mono text-white/40 leading-normal truncate">{preset.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Enhancements Sliders */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Psychoacoustic Overlays
            </h3>
          </div>

          {/* Sub Bass Booster */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70 font-semibold">Sub-Bass Extender (80Hz Shelf)</span>
              <span className="font-mono text-blue-400">{audioSettings.bassBoost}%</span>
            </div>
            <input
              id="bass-boost-slider"
              type="range"
              min="0"
              max="100"
              disabled={!audioSettings.enabled}
              value={audioSettings.bassBoost}
              onChange={(e) => handleSettingChange('bassBoost', parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
            />
          </div>

          {/* Dynamic Virtualizer Widener */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70 font-semibold">Stereo Widening (Virtualizer Width)</span>
              <span className="font-mono text-purple-400">{audioSettings.virtualizer}%</span>
            </div>
            <input
              id="virtualizer-slider"
              type="range"
              min="0"
              max="100"
              disabled={!audioSettings.enabled}
              value={audioSettings.virtualizer}
              onChange={(e) => handleSettingChange('virtualizer', parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
            />
          </div>

          {/* Stereo Balance */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70 font-semibold">Acoustic Balance (L/R Balance)</span>
              <span className="font-mono text-teal-400">
                {audioSettings.audioBalance === 0 ? 'CENTER' : audioSettings.audioBalance < 0 ? `LEFT ${Math.round(Math.abs(audioSettings.audioBalance) * 100)}%` : `RIGHT ${Math.round(audioSettings.audioBalance * 100)}%`}
              </span>
            </div>
            <input
              id="balance-slider"
              type="range"
              min="-1"
              max="1"
              step="0.05"
              disabled={!audioSettings.enabled}
              value={audioSettings.audioBalance}
              onChange={(e) => handleSettingChange('audioBalance', parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
            />
          </div>

          {/* Neural Isolators Toggles */}
          <div id="isolators-pane" className="grid grid-cols-2 gap-3 pt-2">
            
            <label className="flex items-center gap-2.5 p-2 bg-zinc-950/25 border border-white/5 hover:border-white/15 rounded-xl cursor-pointer">
              <input
                id="voice-isolation-check"
                type="checkbox"
                disabled={!audioSettings.enabled}
                checked={audioSettings.vocalEnhance}
                onChange={(e) => handleSettingChange('vocalEnhance', e.target.checked)}
                className="rounded text-blue-500 outline-none w-4 h-4 bg-white/5 border border-white/20 cursor-pointer disabled:opacity-40"
              />
              <div className="flex-1 min-w-0">
                <p className="text-2xs font-semibold text-white">Voice Isolation</p>
                <p className="text-[9px] text-white/40 font-mono">Enhance core vocal range</p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 bg-zinc-950/25 border border-white/5 hover:border-white/15 rounded-xl cursor-pointer">
              <input
                id="noise-reduction-check"
                type="checkbox"
                disabled={!audioSettings.enabled}
                checked={audioSettings.noiseReduction}
                onChange={(e) => handleSettingChange('noiseReduction', e.target.checked)}
                className="rounded text-blue-500 outline-none w-4 h-4 bg-white/5 border border-white/20 cursor-pointer disabled:opacity-40"
              />
              <div className="flex-1 min-w-0">
                <p className="text-2xs font-semibold text-white">Noise Shield</p>
                <p className="text-[9px] text-white/40 font-mono">Suppress high frequencies</p>
              </div>
            </label>

          </div>

        </div>

      </div>

    </div>
  );
}
