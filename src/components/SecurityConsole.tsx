/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Unlock, EyeOff, Key, AlertCircle } from 'lucide-react';
import { useAppState, store } from '../store';

export default function SecurityConsole() {
  const pinNumber = useAppState(s => s.pinNumber);
  const appLocked = useAppState(s => s.appLocked);
  const accentColor = useAppState(s => s.wallpaper.accentColor);

  const [enteredPin, setEnteredPin] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pinChangeCurrent, setPinChangeCurrent] = useState('');
  const [pinChangeNew, setPinChangeNew] = useState('');

  const pressNumber = (num: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + num;
      setEnteredPin(next);
      setErrorMsg(null);
      
      // Auto unlock check if 4 chars entered and currently locked
      if (next.length === 4) {
        if (appLocked) {
          if (next === pinNumber) {
            store.setState(() => ({ appLocked: false }));
            setSuccessMsg('Pristine security bypass approved. Workspace unlocked!');
            setEnteredPin('');
            setTimeout(() => setSuccessMsg(null), 3000);
          } else {
            setErrorMsg('Invalid code signature. Pin rejected.');
            setEnteredPin('');
          }
        }
      }
    }
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinChangeCurrent === pinNumber) {
      if (pinChangeNew.length === 4 && /^\d+$/.test(pinChangeNew)) {
        store.setState(() => ({ pinNumber: pinChangeNew }));
        setSuccessMsg(`Pristine clearance code updated to: ****`);
        setPinChangeCurrent('');
        setPinChangeNew('');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg('New passcode must be exactly 4 digits.');
      }
    } else {
      setErrorMsg('Current verification passcode mismatch.');
    }
  };

  const handleLockTrigger = () => {
    store.setState(() => ({ appLocked: true }));
    setSuccessMsg('Cleared security vaults. App locked.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      
      {/* 7-Col Left Section: Interactive Keypad terminal and bypass */}
      <div className="lg:col-span-7 glass-panel rounded-3xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4.5 h-4.5 text-blue-400" style={{ color: accentColor }} />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Security Clearance Console
            </h3>
          </div>
          
          <span className="text-[10px] font-mono uppercase bg-zinc-950 px-2 py-0.5 rounded border border-white/5 text-white/50">
            Vault 256-Bit SSL
          </span>
        </div>

        {/* Success/Error displays */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 p-3 rounded-2xl text-xs font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/15 text-red-400 p-3 rounded-2xl text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center py-6">
          
          {/* Virtual PIN Pad UI */}
          <div className="flex flex-col gap-3">
            <div className="w-44 text-center py-2 bg-zinc-950/40 border border-white/10 rounded-2xl font-mono text-xl text-white tracking-widest min-h-12 flex items-center justify-center">
              {enteredPin.padStart(4, '-').split('').map((char, i) => (
                <span key={i} className="mx-1">{char !== '-' ? '•' : '-'}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 w-44">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map(btn => {
                const isSpecial = btn === 'C' || btn === '✓';
                return (
                  <button
                    key={btn}
                    id={`pin-btn-${btn === '✓' ? 'ok' : btn.toLowerCase()}`}
                    onClick={() => {
                      if (btn === 'C') setEnteredPin('');
                      else if (btn === '✓') {
                        // Action check
                        if (enteredPin === pinNumber) {
                          store.setState(() => ({ appLocked: false }));
                        } else {
                          setErrorMsg('Clearance mismatch.');
                          setEnteredPin('');
                        }
                      }
                      else pressNumber(btn);
                    }}
                    className={`h-11 w-11 flex items-center justify-center text-xs font-mono rounded-xl border active:scale-90 transition-all ${
                      isSpecial 
                        ? 'bg-zinc-900 border-white/10 text-white/60 hover:text-white' 
                        : 'bg-zinc-950/20 border-white/5 text-white hover:bg-zinc-950/40'
                    }`}
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              {appLocked ? (
                <Lock className="w-6 h-6 text-red-500 animate-pulse" />
              ) : (
                <Unlock className="w-6 h-6 text-emerald-400" />
              )}
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {appLocked ? 'Application Vault Locked' : 'Clearance Status: OK'}
              </h4>
            </div>

            <p className="text-4xs font-sans text-white/45 leading-relaxed">
              When Auraluxe is locked, all user state metrics, equalizer gains, custom live wallpaper selections, and metadata scanners are fully encrypted in sandboxed parameters. Use current clearance passcode <span className="font-mono text-blue-400">"{pinNumber}"</span> to unlock or configure details.
            </p>

            <button
              id="app-vault-lock-btn"
              onClick={handleLockTrigger}
              disabled={appLocked}
              className="mt-2 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-35 text-zinc-950 text-2xs font-bold rounded-xl active:scale-95 transition-all w-full sm:w-40"
            >
              Failsafe Lock Now
            </button>
          </div>

        </div>

      </div>

      {/* 5-Col Right Section: Code Customizer & Privacy mode options */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Passcode changer console */}
        <form onSubmit={handleUpdatePin} className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Key className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configure Passcode</h4>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-white/45 uppercase">Current Verification Passcode</label>
              <input
                id="old-pin-input"
                type="password"
                maxLength={4}
                required
                value={pinChangeCurrent}
                onChange={(e) => setPinChangeCurrent(e.target.value)}
                placeholder="****"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white text-center font-mono outline-none focus:border-white/25"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-white/45 uppercase">New 4-digit Passcode</label>
              <input
                id="new-pin-input"
                type="password"
                maxLength={4}
                required
                value={pinChangeNew}
                onChange={(e) => setPinChangeNew(e.target.value)}
                placeholder="****"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white text-center font-mono outline-none focus:border-white/25"
              />
            </div>

            <button
              id="submit-new-pin"
              type="submit"
              className="mt-2 py-2 bg-purple-500 hover:bg-purple-600 text-zinc-950 text-2xs font-bold rounded-xl transition-all"
            >
              Sign new authorization credentials
            </button>
          </div>
        </form>

        {/* Privacy modes overview */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-3 text-3xs font-mono text-white/30 border border-white/5 bg-zinc-950/20">
          <div className="flex items-center gap-1 text-white">
            <EyeOff className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-2xs font-bold uppercase tracking-wider font-sans">Incognito Privacy Mode</span>
          </div>
          <p className="leading-relaxed font-sans text-white/45">
            Privacy controls allow you to stream ambient mixes and adjust frequencies while hiding track titles from telemetry grids or local recaps. Set clearance levels appropriately to maintain high security standard.
          </p>
        </div>

      </div>

    </div>
  );
}
