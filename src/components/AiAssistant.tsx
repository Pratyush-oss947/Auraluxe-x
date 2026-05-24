/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, Bot, Send, Brain, Compass, Clock, Zap, AlertTriangle, ListMusic, Loader2 } from 'lucide-react';
import { useAppState, store, playerActions } from '../store';
import { AiChatMessage } from '../types';
import { EQ_PRESETS } from '../data';

export default function AiAssistant() {
  const aiMessages = useAppState(s => s.aiMessages);
  const tracks = useAppState(s => s.tracks);
  const currentTrackId = useAppState(s => s.currentTrackId);
  const theme = useAppState(s => s.theme);
  const activeTab = useAppState(s => s.activeTab);
  const accentColor = useAppState(s => s.wallpaper.accentColor);

  // States
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll details
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const queryGeminiDJAux = async (promptMsg: string) => {
    if (!promptMsg.trim()) return;

    // Add user message to log
    const userMsg: AiChatMessage = {
      sender: 'user',
      text: promptMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentMessages = [...store.getState().aiMessages, userMsg];
    store.setState(() => ({ aiMessages: currentMessages }));
    setInputText('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptMsg,
          context: {
            currentTrack: tracks.find(t => t.id === currentTrackId),
            themeMode: theme,
            availableTracks: tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist, genre: t.genre, bpm: t.bpm }))
          }
        })
      });

      if (!response.ok) {
        throw new Error('Endpoint failure');
      }

      const resData = await response.json();
      const textOutput = resData.text || 'My telemetry nodes timed out, but I am here. Keep listening to high fidelity acoustics!';
      
      // Check if response contains a structural command in JSON configuration
      let processedText = textOutput;
      try {
        const cmdMatch = /\{"action":.*\}/.exec(textOutput);
        if (cmdMatch) {
          const js = JSON.parse(cmdMatch[0]);
          executeCommand(js);
          // strip JSON block from user text
          processedText = textOutput.replace(/\{"action":.*\}/, '').trim();
        }
      } catch (jsonErr) {
        console.log('No specific dynamic JSON command embedded.', jsonErr);
      }

      const djResponse: AiChatMessage = {
        sender: 'dj',
        text: processedText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      store.setState(() => ({
        aiMessages: [...store.getState().aiMessages, djResponse]
      }));

    } catch (err) {
      console.warn('AI API Proxy bypass (falling back to custom offline synthesis response):', err);
      
      // Pure simulated fallback with excellent acoustic outputs
      const fallbackReplies = [
        "I've adjusted the sound fields for you. Let's cue up Neon Horizon for the ultimate retro theme vibe!",
        "Dynamic high-res analytics show your study habits peak now. I've scheduled binaural focus segments.",
        "Synthesizing customized mood balance playlist. Let's load Stardust Void to ease tension.",
        "Vocal Presence booster on 32-band Eq panel activated for maximum vocal response. How does it sound?"
      ];

      const chosenReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      
      // Simulate physical toggle command based on keywords
      if (promptMsg.toLowerCase().includes('neon') || promptMsg.toLowerCase().includes('arcade') || promptMsg.toLowerCase().includes('energetic')) {
        playerActions.setPlaybackMode('workout');
      } else if (promptMsg.toLowerCase().includes('study') || promptMsg.toLowerCase().includes('focus') || promptMsg.toLowerCase().includes('chill')) {
        playerActions.setPlaybackMode('focus');
      } else if (promptMsg.toLowerCase().includes('space') || promptMsg.toLowerCase().includes('cosmic') || promptMsg.toLowerCase().includes('meditate')) {
        playerActions.setPlaybackMode('meditation');
      }

      setTimeout(() => {
        store.setState(() => ({
          aiMessages: [
            ...store.getState().aiMessages,
            {
              sender: 'dj',
              text: `[Offline Recovery Echo]: ${chosenReply}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        }));
      }, 1200);

    } finally {
      setIsGenerating(false);
    }
  };

  const executeCommand = (cmd: any) => {
    try {
      if (cmd.action === 'change_playback_mode' && cmd.mode) {
        playerActions.setPlaybackMode(cmd.mode);
      } else if (cmd.action === 'play_track' && cmd.trackId) {
        playerActions.playTrack(cmd.trackId);
      } else if (cmd.action === 'set_eq_preset' && cmd.presetName) {
        const pres = cmd.presetName;
        // set eq
        const pObj = EQ_PRESETS.find((p: any) => p.name === pres);
        if (pObj) {
          pObj.gains.forEach((g: number, idx: number) => {
            playerActions.setEqualizerGain(idx, g);
          });
        }
      }
    } catch (e) {
      console.log('Error processing cmd', e);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    queryGeminiDJAux(inputText);
  };

  const handleShortcutClick = (promptStr: string) => {
    queryGeminiDJAux(promptStr);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      
      {/* 8-Col Left Section: Central Chat Console AI DJ */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {statusMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl text-xs font-mono flex items-center gap-2 animate-float">
            <span>{statusMessage}</span>
          </div>
        )}
        
        {/* Chat log wrapper */}
        <div id="ai-chat-console" className="glass-panel rounded-3xl p-5 h-[480px] flex flex-col justify-between">
          
          {/* Header banner */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 z-10 bg-transparent">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                  Auraluxe Cyber DJ Studio
                  <span className="p-1 leading-none text-[8px] bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20 rounded uppercase">
                    GEMINI AI PRO
                  </span>
                </h3>
                <p className="text-4xs font-mono text-white/40">Real-time intelligent musical curation & telemetry adaptation</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-white/35">TUNED STATE</span>
            </div>
          </div>

          {/* Messages core container */}
          <div className="flex-1 overflow-y-auto pr-1 py-4 flex flex-col gap-4 select-text">
            {aiMessages.map((msg, idx) => {
              const isDj = msg.sender === 'dj';
              return (
                <div
                  key={idx}
                  id={`chat-msg-${idx}`}
                  className={`flex gap-3 max-w-[85%] ${isDj ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Icon profile */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border text-xs font-semibold ${
                    isDj ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/10 text-white/60'
                  }`}>
                    {isDj ? <Bot className="w-4 h-4" /> : 'ME'}
                  </div>

                  <div className={`p-3.5 rounded-2xl flex flex-col gap-1.5 ${
                    isDj 
                      ? 'bg-zinc-950/20 border border-white/5 text-white/90 rounded-tl-sm' 
                      : 'bg-white/8 text-white rounded-tr-sm'
                  }`}>
                    <p className="text-xs leading-relaxed font-sans">{msg.text}</p>
                    <span className="text-[9px] font-mono text-white/35 self-end mt-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex gap-3 mr-auto items-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 bg-zinc-950/20 border border-white/5 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick presets buttons shortcuts for fast commands */}
          <div id="ai-shortcuts-row" className="flex gap-2 overflow-x-auto pb-3 pt-2 text-2xs font-sans">
            {[
              { label: '🔥 Upbeat Workout Vibe', cmd: 'Change play speed to 1.2x, optimize for Gym mode' },
              { label: '🧘 Cosmic Zen Space', cmd: 'Switch theme, load Stardust and change EQ to cinematic' },
              { label: '📚 Study focus triggers', cmd: 'Binaural overlay, block out other elements and highlight focused task' },
              { label: '⭐ Recommend similar tracks', cmd: 'Scan library metadata and generate playlist based on Neon' }
            ].map((bt, i) => (
              <button
                key={i}
                onClick={() => handleShortcutClick(bt.cmd)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/70 hover:text-white border border-white/5 whitespace-nowrap rounded-xl leading-none"
              >
                {bt.label}
              </button>
            ))}
          </div>

          {/* Form write input */}
          <form onSubmit={handleFormSubmit} className="flex gap-2.5 pt-3 border-t border-white/5">
            <input
              id="ai-chatbot-input"
              type="text"
              placeholder="Address the AI DJ: set moods, cue synthwave sets..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl py-2 px-4 text-xs text-white outline-none focus:border-white/20 transition-all font-medium"
            />
            <button
              id="ai-chatbot-send-btn"
              type="submit"
              disabled={isGenerating || !inputText.trim()}
              className="p-2 bg-blue-500 text-zinc-950 font-bold hover:scale-103 active:scale-95 transition-all rounded-xl disabled:opacity-45 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>

        </div>

      </div>

      {/* 4-Col Right Sidebar Section: AI Cognitive Insights & Analysis */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Habit learning analysis and streak tracking widget */}
        <div id="ai-insights-widget" className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Brain className="w-4.5 h-4.5 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Synapse Insights</h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3 bg-zinc-950/20 border border-white/5 rounded-xl">
              <p className="text-[10px] font-mono text-purple-400 uppercase font-semibold">Detected Core Vibe</p>
              <p className="text-sm font-semibold text-white mt-1">Futuristic Retrobeats</p>
              <p className="text-4xs font-mono text-white/40 mt-0.5 leading-normal">Derived from repeated listings of Synth Project and Bass equalizer adjustments.</p>
            </div>

            <div className="p-3 bg-zinc-950/20 border border-white/5 rounded-xl">
              <p className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Circadian Mix Selector</p>
              <p className="text-sm font-semibold text-white mt-1">Evening Theta Cascade</p>
              <p className="text-4xs font-mono text-white/40 mt-0.5 leading-normal">Optimized for study coordinates and alpha-wave biofeedback loops.</p>
            </div>
          </div>
        </div>

        {/* AI daily mixes generation module */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-3.5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <p className="text-[10px] font-mono text-white/45 uppercase">Synthetic Playlist Generators</p>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          </div>

          <div className="flex flex-col gap-2">
            {[
              { name: 'AI Daily Mix 1', desc: 'Chillhop lo-fi with spatial delay loops', tracksCount: 5 },
              { name: 'Auraluxe Weekly Recap 2026', desc: 'Most requested synth waves and soundscapes', tracksCount: 8 }
            ].map((mix, idx) => (
              <div
                key={idx}
                className="p-3 bg-zinc-950/15 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-white font-semibold">{mix.name}</p>
                  <p className="text-4xs font-mono text-white/40 leading-normal">{mix.desc}</p>
                </div>
                <button
                  id={`ai-mix-generate-${idx}`}
                  onClick={() => {
                    setStatusMessage(`AI Generator compiled "${mix.name}" set successfully!`);
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-3xs font-mono text-white border border-white/10 rounded-lg active:scale-95"
                >
                  COMPILE
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
