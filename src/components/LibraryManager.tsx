/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, Play, Heart, Trash2, FolderOpen, ListPlus, ShieldAlert,
  Loader2, RefreshCw, CheckCircle, Database, HelpCircle, Layers, FileMusic
} from 'lucide-react';
import { useAppState, playerActions, store } from '../store';
import { Track } from '../types';
import { CURATED_TRACKS } from '../data';

export default function LibraryManager() {
  const tracks = useAppState(s => s.tracks);
  const currentTrackId = useAppState(s => s.currentTrackId);
  const isPlaying = useAppState(s => s.isPlaying);
  const favorites = useAppState(s => s.favorites);
  const playlists = useAppState(s => s.playlists);
  const isScanning = useAppState(s => s.isScanning);
  const accentColor = useAppState(s => s.wallpaper.accentColor);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedTab, setSelectedTab] = useState<'songs' | 'playlists' | 'folders' | 'duplicates'>('songs');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filter track list
  const filteredTracks = tracks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.album.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || t.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = ['all', ...Array.from(new Set(tracks.map(t => t.genre)))];

  // Duplicate Analyzer Simulations
  const mockDuplicates = [
    { id: 'dup-1', title: 'Neon Horizon (Cached Mirror)', artist: 'Auraluxe Synth Project', size: '10.2 MB', path: '/music/cache/cyber-neon-temp.mp3', originalId: 'cyber-neon' }
  ];
  const [duplicatesList, setDuplicatesList] = useState(mockDuplicates);

  const cleanDuplicate = (id: string) => {
    setDuplicatesList(prev => prev.filter(d => d.id !== id));
    setStatusMessage('Cleaned up metadata redundancies. Audio storage optimized by 10.2MB!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    playerActions.addPlaylist(newPlaylistName, newPlaylistDesc);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreatePlaylist(false);
    setStatusMessage(`Playlist "${newPlaylistName}" initialized.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      
      {/* 8-Col Left Section: Central Search and Music lists Grid */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {/* Search, Filter & Scan bar */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-white/40" />
            <input
              id="search-input"
              type="text"
              placeholder="Instant Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-white/20 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="flex p-0.5 glass-panel-light rounded-xl">
              {(['songs', 'playlists', 'folders', 'duplicates'] as const).map(tab => (
                <button
                  key={tab}
                  id={`library-tab-${tab}`}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-3 py-1.5 text-2xs font-mono rounded-lg transition-all capitalize ${
                    selectedTab === tab 
                      ? 'bg-white/10 text-white shadow-sm font-semibold' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              id="scan-library-btn"
              onClick={() => playerActions.triggerScan()}
              disabled={isScanning}
              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 active:scale-95 transition-all text-xs flex items-center gap-1.5 disabled:opacity-55"
              title="Automated Library Refresh Scan"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span className="text-3xs font-mono">SCANNING</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-3xs font-mono">SCAN</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Status Banner */}
        {statusMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl text-xs font-mono flex items-center gap-2.5 animate-float">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Main interactive Tab panels */}
        <div className="glass-panel rounded-3xl p-5 min-h-[360px] flex flex-col">
          
          {selectedTab === 'songs' && (
            <div className="flex flex-col gap-4 flex-1">
              {/* Category filters */}
              <div className="flex gap-2 flex-wrap pb-2 border-b border-white/5">
                {genres.map(genre => (
                  <button
                    key={genre}
                    id={`filter-genre-${genre}`}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-2.5 py-1 text-3xs font-sans rounded-lg border transition-all uppercase ${
                      selectedGenre === genre
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                        : 'bg-zinc-950/20 text-white/50 border-white/5 hover:text-white/80'
                    }`}
                  >
                    {genre === 'all' ? 'All Genres' : genre}
                  </button>
                ))}
              </div>

              {/* Songs List Grid */}
              <div id="songs-list" className="flex flex-col gap-1.5">
                {filteredTracks.length > 0 ? (
                  filteredTracks.map(t => {
                    const isActive = currentTrackId === t.id;
                    return (
                      <div
                        key={t.id}
                        id={`track-list-item-${t.id}`}
                        className={`p-3.5 rounded-2xl flex items-center justify-between border cursor-pointer hover:bg-white/5 transition-all group ${
                          isActive 
                            ? 'border-white/10 bg-white/8 font-medium' 
                            : 'border-white/5 bg-zinc-950/15'
                        }`}
                        onClick={() => playerActions.playTrack(t.id)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Inner list icon */}
                          <div className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border text-xs font-semibold ${
                            isActive ? 'bg-blue-500/15 border-blue-500/30 text-blue-400 animate-pulse' : 'bg-white/5 border-white/10 text-white/40'
                          }`}>
                            {isActive && isPlaying ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <FileMusic className="w-4.5 h-4.5" />}
                          </div>

                          <div className="min-w-0">
                            <p className={`text-xs text-white truncate ${isActive ? 'font-bold' : ''}`}>
                              {t.title}
                            </p>
                            <p className="text-4xs font-mono text-white/40 truncate mt-0.5">
                              {t.artist} • {t.album}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-3xs font-mono text-white/40">
                          <span className="hidden sm:inline-block uppercase px-2 py-0.5 bg-white/5 rounded border border-white/10 text-4xs">
                            {t.genre}
                          </span>
                          <span>{Math.floor(t.duration / 60)}:{(t.duration % 60) < 10 ? '0' : ''}{t.duration % 60}</span>
                          
                          {/* Quick trigger action button hoverable */}
                          <button
                            id={`fav-shortcut-${t.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              playerActions.toggleFavorite(t.id);
                            }}
                            className={`p-2 bg-zinc-950/20 hover:scale-105 border border-white/5 rounded-xl transition-all ${
                              favorites.includes(t.id) ? 'text-rose-500' : 'text-white/20 hover:text-white/50'
                            }`}
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-12 text-white/40 flex flex-col items-center justify-center gap-3">
                    <Database className="w-10 h-10 stroke-1 text-white/30" />
                    <p className="text-xs font-bold">No tracks match your query</p>
                    <p className="text-3xs font-mono">Try searching with dynamic filter combinations.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'playlists' && (
            <div className="flex flex-col gap-6 flex-1">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <p className="text-xs text-white/50 font-mono uppercase">User Created & Intelligent Playlists</p>
                <button
                  id="toggle-create-playlist-btn"
                  onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
                  className="px-3 py-1.5 bg-blue-500 text-zinc-950 text-2xs font-semibold rounded-xl hover:scale-101 active:scale-95 transition-all flex items-center gap-1 leading-none"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>New Playlist</span>
                </button>
              </div>

              {showCreatePlaylist && (
                <form onSubmit={handleCreatePlaylist} className="p-4 bg-zinc-950/20 border border-white/8 rounded-2xl flex flex-col gap-3 animate-float">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      id="playlist-name-input"
                      type="text"
                      placeholder="Playlist Vibe Name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none"
                      required
                    />
                    <input
                      id="playlist-desc-input"
                      type="text"
                      placeholder="Descriptions (Optional)"
                      value={newPlaylistDesc}
                      onChange={(e) => setNewPlaylistDesc(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      id="cancel-create-playlist"
                      type="button"
                      onClick={() => setShowCreatePlaylist(false)}
                      className="px-3 py-1.5 text-2xs text-white/50 hover:text-white"
                    >
                      Hold off
                    </button>
                    <button
                      id="submit-create-playlist"
                      type="submit"
                      className="px-3 py-1.5 text-2xs font-bold rounded-xl text-zinc-950"
                      style={{ backgroundColor: accentColor }}
                    >
                      Construct Deck
                    </button>
                  </div>
                </form>
              )}

              {/* Grid lists of customized decks */}
              <div id="playlists-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {playlists.map(p => (
                  <div
                    key={p.id}
                    id={`playlist-card-${p.id}`}
                    className="p-4 bg-zinc-950/25 border border-white/5 hover:border-white/12 rounded-2xl flex flex-col gap-2 relative group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{p.name}</span>
                        {p.isSmart && (
                          <span className="px-1.5 py-0.2 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] font-mono rounded uppercase">
                            AI engine smart
                          </span>
                        )}
                      </h4>
                      <p className="text-4xs font-mono text-white/40 leading-normal mt-0.5">{p.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/5">
                      <span className="text-[10px] font-mono text-white/50">{p.tracks.length} streams index</span>
                      
                      {/* Play action button */}
                      <button
                        id={`play-playlist-${p.id}`}
                        disabled={p.tracks.length === 0}
                        onClick={() => {
                          store.setState(() => ({ queue: p.tracks }));
                          playerActions.playTrack(p.tracks[0]);
                        }}
                        className="p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-white font-mono text-3xs disabled:opacity-40"
                      >
                        Play Set
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'folders' && (
            <div className="flex flex-col gap-4 flex-1">
              <p className="text-xs text-white/50 font-mono uppercase border-b border-white/5 pb-2">Workspace Virtual Storage Paths</p>
              
              <div id="folders-list" className="flex flex-col gap-2.5">
                {[
                  { name: '/music/studio-masters', count: CURATED_TRACKS.filter(t => t.highRes).length, size: '42.4 MB' },
                  { name: '/music/downloads', count: 2, size: '20.1 MB' },
                  { name: '/music/cache', count: 1, size: '10.2 MB' }
                ].map(folder => (
                  <div
                    key={folder.name}
                    className="p-3.5 bg-zinc-950/15 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4.5 h-4.5 text-amber-400" />
                      <div>
                        <p className="text-xs text-white font-semibold font-mono">{folder.name}</p>
                        <p className="text-[10px] text-white/40">{folder.count} tracks loaded • {folder.size}</p>
                      </div>
                    </div>
                    <span className="text-4xs font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50">LOCAL SCAN HEALTHY</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'duplicates' && (
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <p className="text-xs text-white/50 font-mono uppercase">Duplicate Finder Optimization Node</p>
                <div className="text-3xs font-mono text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Clean double streams to save disk cache</span>
                </div>
              </div>

              {duplicatesList.length > 0 ? (
                <div id="duplicates-list" className="flex flex-col gap-3">
                  {duplicatesList.map(dup => (
                    <div
                      key={dup.id}
                      className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-center justify-between flex-wrap sm:flex-nowrap gap-3"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-wide">{dup.title}</h4>
                        <p className="text-4xs font-mono text-white/40 mt-0.5">{dup.artist} • Path: {dup.path}</p>
                        <p className="text-3xs text-yellow-400/80 font-semibold mt-1">Found size redundant mirror of Cyber Neon original track.</p>
                      </div>

                      <button
                        id={`remediate-dup-${dup.id}`}
                        onClick={() => cleanDuplicate(dup.id)}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 transition-colors text-zinc-950 text-2xs font-bold rounded-xl whitespace-nowrap active:scale-95"
                      >
                        Optimize & Remediate
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 text-white/40 flex flex-col items-center justify-center gap-2">
                  <CheckCircle className="w-10 h-10 stroke-1 text-emerald-400" />
                  <p className="text-xs font-bold">Storage Optimization Complete</p>
                  <p className="text-3xs font-mono text-emerald-500/80">0 redundant file mirrors found. Bitrate matches pristine states!</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 4-Col Right Sidebar Section: Storage Health and Library statistics */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Storage footprint and Health Widget */}
        <div id="storage-health-widget" className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Database className="w-4.5 h-4.5 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Storage Footprint Meter</h3>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-white/55 font-medium">Sonic Cache Footprint</span>
            <span className="font-mono text-white/70">72.7 MB / 1000 MB</span>
          </div>

          {/* Simple custom colored progress bar */}
          <div className="w-full h-2 bg-white/10 rounded-lg overflow-hidden">
            <div className="h-full bg-blue-500 rounded-lg" style={{ width: '7.27%' }} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-2">
            <div className="p-3 bg-zinc-950/25 border border-white/5 rounded-xl">
              <p className="text-3xs font-mono text-white/40 uppercase">Audio streams</p>
              <p className="text-base font-bold text-white mt-1">{tracks.length}</p>
            </div>
            <div className="p-3 bg-zinc-950/25 border border-white/5 rounded-xl">
              <p className="text-3xs font-mono text-white/40 uppercase">Playback Decks</p>
              <p className="text-base font-bold text-white mt-1">{playlists.length}</p>
            </div>
          </div>
        </div>

        {/* Master Audio Scanner status detail */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-3">
          <p className="text-3xs font-mono text-white/40 uppercase">Scanner specifications</p>
          <ul className="flex flex-col gap-2.5 text-2xs font-mono text-white/75">
            <li className="flex justify-between">
              <span>Automatic Library Poll:</span>
              <span className="text-emerald-400 shrink-0">ACTIVE</span>
            </li>
            <li className="flex justify-between">
              <span>MIME Formats Scan:</span>
              <span className="text-white/50 text-right shrink-0">WAV, FLAC, MP3, AAC, OGG</span>
            </li>
            <li className="flex justify-between">
              <span>Dynamic Tag Index:</span>
              <span className="text-white/50 text-right shrink-0">Metatag ID3v2, FLAC COMMENT</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
