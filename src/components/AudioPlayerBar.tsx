import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Sliders, Music2, Maximize2, Sparkles, BookOpen
} from 'lucide-react';
import { MusicTrack, SoundLayerState } from '../types.ts';

interface AudioPlayerBarProps {
  currentTrack: MusicTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  masterVolume: number;
  onUpdateMasterVolume: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeLayers: SoundLayerState[];
  onOpenMixer: () => void;
  onOpenTrackSelect: () => void;
  onOpenReaderMode: () => void;
  isReaderModeOpen: boolean;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  masterVolume,
  onUpdateMasterVolume,
  isMuted,
  onToggleMute,
  activeLayers,
  onOpenMixer,
  onOpenTrackSelect,
  onOpenReaderMode,
  isReaderModeOpen,
}) => {
  const playingLayerCount = activeLayers.filter(l => l.enabled && l.volume > 0).length;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#16181d]/95 backdrop-blur-md border-t border-stone-800/80 px-4 py-2.5 sm:px-6 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
          <div 
            onClick={onOpenTrackSelect}
            className="relative group cursor-pointer shrink-0"
            title="Klik untuk memilih musik"
          >
            <img
              src={currentTrack.coverImage}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-lg object-cover border border-stone-700/60 shadow-md group-hover:opacity-85 transition-opacity"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-amber-400 rounded-full animate-pulse h-2.5" />
                  <span className="w-1 bg-amber-400 rounded-full animate-pulse h-3.5 delay-75" />
                  <span className="w-1 bg-amber-400 rounded-full animate-pulse h-2 delay-150" />
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 
                onClick={onOpenTrackSelect}
                className="text-xs sm:text-sm font-medium text-stone-100 truncate cursor-pointer hover:text-amber-300 transition-colors"
              >
                {currentTrack.title}
              </h4>
              {currentTrack.isProcedural && (
                <span className="hidden md:inline-block text-[10px] text-amber-400/90 font-mono tracking-wide">
                  [PROSEDURAL]
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 truncate">
              <span>{currentTrack.artist}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400/80">{currentTrack.moodLabel}</span>
            </div>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onPrevTrack}
              className="p-1.5 text-stone-400 hover:text-stone-100 transition-colors"
              title="Lagu Sebelumnya"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
              title={isPlaying ? "Jeda Musik" : "Putar Musik"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNextTrack}
              className="p-1.5 text-stone-400 hover:text-stone-100 transition-colors"
              title="Lagu Berikutnya"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Ambient Mixer Button, Volume, & Zen Mode */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 sm:w-1/3">
          {/* Soundscape Mixer quick button */}
          <button
            onClick={onOpenMixer}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              playingLayerCount > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:text-stone-100'
            }`}
            title="Buka Soundscape & Ambient Mixer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ambience</span>
            {playingLayerCount > 0 && (
              <span className="text-[10px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded-full font-bold">
                {playingLayerCount}
              </span>
            )}
          </button>

          {/* Master Volume (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 w-28">
            <button
              onClick={onToggleMute}
              className="p-1 text-stone-400 hover:text-stone-200 transition-colors"
              title={isMuted ? "Buka Suara" : "Senyap"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => onUpdateMasterVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Mode Membaca (Zen Reader) */}
          <button
            onClick={onOpenReaderMode}
            className={`p-2 rounded-lg border transition-colors ${
              isReaderModeOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:text-stone-100'
            }`}
            title="Buka Mode Membaca Syahdu (Zen Mode)"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
