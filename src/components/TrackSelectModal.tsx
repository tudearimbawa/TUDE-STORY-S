import React, { useState } from 'react';
import { X, Music2, Upload, Link, Check, Radio, Play, Pause } from 'lucide-react';
import { MusicTrack } from '../types.ts';

interface TrackSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: MusicTrack[];
  currentTrackId: string;
  isPlaying: boolean;
  onSelectTrack: (track: MusicTrack) => void;
  onTogglePlay: () => void;
  onAddCustomTrack: (newTrack: MusicTrack) => void;
}

export const TrackSelectModal: React.FC<TrackSelectModalProps> = ({
  isOpen,
  onClose,
  tracks,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
  onAddCustomTrack,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [urlError, setUrlError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const newTrack: MusicTrack = {
      id: `custom-file-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Musik Pribadi Kamu',
      mood: 'calm',
      moodLabel: 'Kustom',
      coverImage: '/src/assets/images/ambient_cozy_cafe_1791551447126.jpg',
      sourceUrl: fileUrl,
      description: `File audio lokal: ${file.name}`,
    };

    onAddCustomTrack(newTrack);
    onSelectTrack(newTrack);
    onClose();
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    try {
      new URL(customUrl.trim());
      const newTrack: MusicTrack = {
        id: `custom-url-${Date.now()}`,
        title: customTitle.trim() || 'Tautan Musik Kustom',
        artist: 'Streaming Eksternal',
        mood: 'calm',
        moodLabel: 'Kustom',
        coverImage: '/src/assets/images/ambient_midnight_desk_1791551427549.jpg',
        sourceUrl: customUrl.trim(),
        description: `Tautan streaming eksternal: ${customUrl.trim()}`,
      };

      onAddCustomTrack(newTrack);
      onSelectTrack(newTrack);
      setCustomTitle('');
      setCustomUrl('');
      setUrlError('');
      onClose();
    } catch {
      setUrlError('Format tautan URL tidak valid. Gunakan URL https:// yang dapat diakses langsung.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-[#181b20] border border-stone-800 rounded-2xl shadow-2xl p-6 text-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-100 flex items-center gap-2">
              <Music2 className="w-5 h-5 text-amber-400" />
              Pilihan Musik Latar
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Pilih melodi syahdu atau gunakan musik favoritmu sendiri
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 rounded-lg mt-4 mb-4 border border-stone-800">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'presets' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Koleksi Syahdu Pilihan
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'custom' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Unggah / Tambah Lagu Sendiri
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {tracks.map((track) => {
              const isSelected = track.id === currentTrackId;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    onSelectTrack(track);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-amber-950/30 border-amber-500/40 shadow-sm' 
                      : 'bg-stone-900/40 border-stone-800/80 hover:bg-stone-850 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={track.coverImage}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover border border-stone-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-100">
                          {track.title}
                        </span>
                        {track.isProcedural && (
                          <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Tak Berbatas
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 line-clamp-1">
                        {track.artist} · <span className="text-stone-400">{track.moodLabel}</span>
                      </p>
                      <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                        {track.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePlay();
                        }}
                        className="p-2 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
                        title={isPlaying ? "Jeda" : "Putar"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    )}
                    {!isSelected && (
                      <div className="p-2 text-stone-400 hover:text-stone-200">
                        <Play className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom upload & URL */}
        {activeTab === 'custom' && (
          <div className="space-y-4 pt-1">
            {/* File Upload Box */}
            <div className="p-4 bg-stone-900/50 rounded-xl border border-stone-800 text-center">
              <Upload className="w-7 h-7 text-amber-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-stone-200">
                Pilih File Audio dari Komputer / HP
              </h3>
              <p className="text-xs text-stone-400 mt-1 mb-3">
                Mendukung file format MP3, WAV, M4A, AAC, atau OGG langsung di browser
              </p>
              <label className="inline-block px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors">
                Pilih File Musik
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* URL streaming */}
            <form onSubmit={handleAddUrl} className="p-4 bg-stone-900/50 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-200">
                <Link className="w-4 h-4 text-amber-400" />
                <span>Gunakan Tautan Audio Online (URL)</span>
              </div>
              <input
                type="text"
                placeholder="Judul lagu (opsional)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500"
              />
              <input
                type="url"
                placeholder="https://... (contoh: link streaming file .mp3)"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setUrlError('');
                }}
                className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500"
              />
              {urlError && (
                <p className="text-xs text-red-400">{urlError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700"
              >
                Putar Tautan Musik Ini
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
