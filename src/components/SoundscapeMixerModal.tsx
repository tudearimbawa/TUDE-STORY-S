import React from 'react';
import { 
  X, Volume2, VolumeX, CloudRain, Flame, Disc3, 
  Moon, Coffee, Timer, Keyboard, RefreshCw, Sparkles 
} from 'lucide-react';
import { SoundLayerState } from '../types.ts';
import { soundEngine, AmbientSoundId } from '../utils/audioEngine.ts';

interface SoundscapeMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layers: SoundLayerState[];
  onUpdateLayer: (id: string, volume: number, enabled: boolean) => void;
  masterVolume: number;
  onUpdateMasterVolume: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  typewriterSound: boolean;
  onToggleTypewriterSound: () => void;
  sleepTimerMinutes: number;
  onSetSleepTimer: (minutes: number) => void;
  remainingSleepSeconds: number;
}

export const SoundscapeMixerModal: React.FC<SoundscapeMixerModalProps> = ({
  isOpen,
  onClose,
  layers,
  onUpdateLayer,
  masterVolume,
  onUpdateMasterVolume,
  isMuted,
  onToggleMute,
  typewriterSound,
  onToggleTypewriterSound,
  sleepTimerMinutes,
  onSetSleepTimer,
  remainingSleepSeconds,
}) => {
  if (!isOpen) return null;

  const renderIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'CloudRain': return <CloudRain className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Disc3': return <Disc3 className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'Coffee': return <Coffee className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResetLayers = () => {
    layers.forEach(l => {
      onUpdateLayer(l.id, 0, false);
      soundEngine.setAmbientVolume(l.id as AmbientSoundId, 0);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#181b20] border border-stone-800 rounded-2xl shadow-2xl p-6 text-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Soundscape & Ambient Mixer
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Campur suara alam dan suasana untuk menemani bacaanmu
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 rounded-lg transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master & Keystroke ASMR Section */}
        <div className="grid grid-cols-2 gap-3 py-4 border-b border-stone-800/80">
          {/* Master Volume */}
          <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-stone-300 font-medium mb-2">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                Volume Master
              </span>
              <button 
                onClick={onToggleMute} 
                className="text-stone-400 hover:text-amber-400 transition-colors p-1"
                title={isMuted ? "Buka Suara" : "Senyap"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => onUpdateMasterVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Typewriter ASMR Keystrokes */}
          <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-stone-300 font-medium mb-2">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-stone-400" />
                Suara Mesin Tik (ASMR)
              </span>
              <button
                onClick={onToggleTypewriterSound}
                className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                  typewriterSound 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {typewriterSound ? 'Aktif' : 'Mati'}
              </button>
            </div>
            <p className="text-[11px] text-stone-400 line-clamp-1">
              Denting mekanik lembut saat mengetik
            </p>
          </div>
        </div>

        {/* Ambient Layers List */}
        <div className="py-4 space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
            <span>Lapisan Suara Ambience</span>
            <button
              onClick={handleResetLayers}
              className="flex items-center gap-1 hover:text-stone-200 transition-colors text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Semua
            </button>
          </div>

          {layers.map((layer) => {
            const isPlaying = layer.enabled && layer.volume > 0;
            return (
              <div 
                key={layer.id}
                className={`p-3 rounded-xl border transition-all ${
                  isPlaying 
                    ? 'bg-amber-950/20 border-amber-800/40' 
                    : 'bg-stone-900/40 border-stone-800/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        const newEnabled = !layer.enabled;
                        const newVol = newEnabled && layer.volume === 0 ? 0.3 : layer.volume;
                        onUpdateLayer(layer.id, newVol, newEnabled);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPlaying 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {renderIcon(layer.icon, "w-4 h-4")}
                    </button>
                    <div>
                      <div className="text-sm font-medium text-stone-200">
                        {layer.name}
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {isPlaying ? `${Math.round(layer.volume * 100)}% Volume` : 'Nonaktif'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const newEnabled = !layer.enabled;
                      const newVol = newEnabled && layer.volume === 0 ? 0.3 : layer.volume;
                      onUpdateLayer(layer.id, newVol, newEnabled);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                      layer.enabled && layer.volume > 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-stone-800 text-stone-400 hover:bg-stone-750'
                    }`}
                  >
                    {layer.enabled && layer.volume > 0 ? 'Menyala' : 'Matikan'}
                  </button>
                </div>

                {/* Volume slider */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={layer.volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateLayer(layer.id, val, val > 0);
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            );
          })}
        </div>

        {/* Sleep Timer Bar */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <Timer className="w-4 h-4 text-stone-400" />
            <span>Pengatur Waktu Tidur:</span>
            {remainingSleepSeconds > 0 && (
              <span className="font-mono text-amber-400 font-medium">
                ({formatTimer(remainingSleepSeconds)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {[0, 15, 30, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => onSetSleepTimer(mins)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  sleepTimerMinutes === mins
                    ? 'bg-amber-500 text-stone-950 font-medium'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {mins === 0 ? 'Mati' : `${mins}m`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
