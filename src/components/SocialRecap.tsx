/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart2, Flame, Trophy, Award, Headphones, Sliders, Play,
  Compass, Share2, Calendar, Music, Activity, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { useAppState, store } from '../store';

export default function SocialRecap() {
  const userStats = useAppState(s => s.userStats);
  const tracks = useAppState(s => s.tracks);
  const accentColor = useAppState(s => s.wallpaper.accentColor);

  const formatHours = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} mins`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs} Hours`;
  };

  const shareRecapCard = () => {
    alert('Bespoke recap file compiled into memory. Shares link ready for social broadcast channels!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      
      {/* 8-Col Left Section: Listening Milestones & Achievements Grid */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Achievements list tracker */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Listening Milestones & Achievements
              </h3>
            </div>
            
            <div className="text-3xs font-mono text-white/50 bg-white/5 px-2.5 py-1 rounded-xl">
              unlocked: {userStats.achievements.filter(a => a.unlocked).length} / {userStats.achievements.length}
            </div>
          </div>

          <div id="achievements-list" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userStats.achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all relative overflow-hidden ${
                  ach.unlocked 
                    ? 'bg-amber-500/5 border-amber-500/20' 
                    : 'bg-zinc-950/25 border-white/5 opacity-55'
                }`}
              >
                {/* Floating dynamic corner tag */}
                {ach.unlocked && (
                  <div className="absolute top-0 right-0 h-10 w-10 bg-amber-500/10 rotate-45 translate-x-5 -translate-y-5 border border-amber-500/20" />
                )}

                <div className={`p-2.5 rounded-xl ${ach.unlocked ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-white/30'}`}>
                  {ach.id === 'purist' ? <Headphones className="w-5 h-5" /> : ach.id === 'equalizer' ? <Sliders className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className="text-xs font-bold text-white flex items-center justify-between">
                    <span>{ach.title}</span>
                    {ach.unlocked && (
                      <span className="text-[8px] font-mono font-semibold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/25">
                        unlocked
                      </span>
                    )}
                  </h4>
                  <p className="text-4xs font-mono text-white/45 leading-normal mt-1">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Recaps Timeline representation */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Calendar className="w-5 h-5 text-blue-400" style={{ color: accentColor }} />
            <h3 className="text-sm font-semibold text-white">
              Auraluxe Sonic Recaps Chronology
            </h3>
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/15 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-white">Your May 2026 Recap Is Locked!</p>
              <p className="text-4xs font-mono text-white/45 leading-normal mt-0.5">Stream at least 20 minutes of dynamic spatial audio before month-end to generate social share boards.</p>
            </div>
            
            <button
              id="unlock-recap-share"
              onClick={shareRecapCard}
              className="px-3.5 py-1.5 bg-yellow-500 text-zinc-950 text-2xs font-bold rounded-xl whitespace-nowrap hover:scale-101 transition-all active:scale-95 shadow-sm leading-none"
            >
              Examine coordinates
            </button>
          </div>

          <div id="chrono-stats" className="grid grid-cols-3 gap-2.5 text-center mt-1">
            {[
              { label: 'Avg Frequency Level', val: '12,400 Hz' },
              { label: 'Stereo Widener Focus', val: 'Mid-Side Stereo' },
              { label: 'Most Streamed hour', val: '01:00 AM UTC' }
            ].map((st, idx) => (
              <div key={idx} className="p-3 bg-zinc-950/20 border border-white/5 rounded-xl">
                <p className="text-3xs font-mono text-white/40 uppercase">{st.label}</p>
                <p className="text-xs font-bold text-white mt-1 font-mono">{st.val}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4-Col Right Sidebar Section: Active Streaks & Dashboard Recaps */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Flame Streaks display board */}
        <div id="streak-meter-widget" className="glass-panel rounded-3xl p-5 flex flex-col gap-4 text-center items-center justify-center">
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full animate-float">
            <Flame className="w-9 h-9 fill-current text-red-500" />
          </div>
          
          <div>
            <h4 className="text-xl font-bold text-white tracking-tight leading-none">
              {userStats.streakDays} Day Streaks ACTIVE
            </h4>
            <p className="text-4xs font-mono text-white/45 uppercase tracking-wider mt-1.5">Acoustic Consistency Index</p>
          </div>

          <p className="text-4xs font-sans text-white/40 leading-relaxed px-2">
            You processed and equalized stereo content {userStats.streakDays} days in a row! Stream daily to unlock holographic theme presets.
          </p>

          <button
            id="share-recap-social"
            onClick={shareRecapCard}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all mt-1"
          >
            <Share2 className="w-3.5 h-3.5 text-red-400" />
            <span>Broadcast Stats</span>
          </button>
        </div>

        {/* Dynamic Cumulative Time Tracked */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Activity className="w-4.5 h-4.5 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Acoustic Mileage</h4>
          </div>

          <div className="flex justify-between items-center bg-zinc-950/20 p-3.5 border border-white/5 rounded-2xl">
            <div className="text-left">
              <p className="text-3xs font-mono text-white/45 uppercase leading-none">Pristine Processing</p>
              <p className="text-lg font-bold text-white tracking-tight mt-1 font-mono">
                {formatHours(userStats.totalListeningTime)}
              </p>
            </div>
            
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs leading-none">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
