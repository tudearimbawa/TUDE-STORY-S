import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Sliders, 
  Settings2, ChevronLeft, ChevronRight, Sparkles, BookOpen, 
  Image as ImageIcon, Type, Sparkle
} from 'lucide-react';
import { Note, ReaderSettings, MusicTrack, SoundLayerState, ThemeChoice, FontChoice } from '../types.ts';
import { IMAGES } from '../utils/musicTracks.ts';

interface ReadingModeViewProps {
  note: Note;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (settings: Partial<ReaderSettings>) => void;
  currentTrack: MusicTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  masterVolume: number;
  onUpdateMasterVolume: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenMixer: () => void;
}

export const ReadingModeView: React.FC<ReadingModeViewProps> = ({
  note,
  onClose,
  settings,
  onUpdateSettings,
  currentTrack,
  isPlaying,
  onTogglePlay,
  masterVolume,
  onUpdateMasterVolume,
  isMuted,
  onToggleMute,
  onOpenMixer,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('reading-container');
      if (!el) return;
      const total = el.scrollHeight - el.clientHeight;
      if (total <= 0) {
        setScrollProgress(100);
      } else {
        setScrollProgress(Math.min(100, Math.round((el.scrollTop / total) * 100)));
      }
    };

    const el = document.getElementById('reading-container');
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Theme styling map
  const themeStyles: Record<ThemeChoice, {
    bg: string;
    text: string;
    titleColor: string;
    containerBg: string;
    border: string;
    muted: string;
    accent: string;
    defaultBgImage?: string;
  }> = {
    sepia: {
      bg: 'bg-[#181411]',
      text: 'text-[#e5dcd3]',
      titleColor: 'text-[#f5ede4]',
      containerBg: 'bg-[#221c17]/85',
      border: 'border-[#382e25]',
      muted: 'text-[#a89b8f]',
      accent: 'text-amber-400',
      defaultBgImage: IMAGES.midnight,
    },
    midnight: {
      bg: 'bg-[#0b0e14]',
      text: 'text-[#cbd5e1]',
      titleColor: 'text-[#f1f5f9]',
      containerBg: 'bg-[#111722]/85',
      border: 'border-[#1e293b]',
      muted: 'text-[#64748b]',
      accent: 'text-sky-400',
      defaultBgImage: IMAGES.midnight,
    },
    rain: {
      bg: 'bg-[#0f1418]',
      text: 'text-[#d1d5db]',
      titleColor: 'text-[#f3f4f6]',
      containerBg: 'bg-[#151c22]/85',
      border: 'border-[#24303a]',
      muted: 'text-[#6b7280]',
      accent: 'text-cyan-400',
      defaultBgImage: IMAGES.rain,
    },
    amber: {
      bg: 'bg-[#191410]',
      text: 'text-[#e8ded5]',
      titleColor: 'text-[#faebe0]',
      containerBg: 'bg-[#241c16]/85',
      border: 'border-[#3d2e24]',
      muted: 'text-[#a39284]',
      accent: 'text-amber-500',
      defaultBgImage: IMAGES.cafe,
    },
    oled: {
      bg: 'bg-black',
      text: 'text-stone-300',
      titleColor: 'text-stone-100',
      containerBg: 'bg-[#0c0c0d]/90',
      border: 'border-stone-850',
      muted: 'text-stone-500',
      accent: 'text-amber-400',
    },
    ivory: {
      bg: 'bg-[#141415]',
      text: 'text-stone-200',
      titleColor: 'text-white',
      containerBg: 'bg-[#1b1c1e]/85',
      border: 'border-stone-800',
      muted: 'text-stone-400',
      accent: 'text-amber-400',
    },
  };

  const activeTheme = themeStyles[settings.theme] || themeStyles.sepia;

  // Font class resolver
  const getFontClass = (font: FontChoice) => {
    switch (font) {
      case 'serif': return 'font-serif-reading';
      case 'sans': return 'font-sans-reading';
      case 'mono': return 'font-mono-reading';
      case 'handwriting': return 'font-handwriting';
      default: return 'font-serif-reading';
    }
  };

  // Font size resolver
  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'sm': return 'text-base leading-relaxed';
      case 'base': return 'text-lg leading-relaxed';
      case 'lg': return 'text-xl leading-loose';
      case 'xl': return 'text-2xl leading-loose';
      case '2xl': return 'text-3xl leading-loose';
      default: return 'text-xl leading-loose';
    }
  };

  // Render paragraphs with quote / heading formatting
  const renderFormattedParagraphs = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-5" />;
      }

      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className={`text-2xl font-display-reading font-semibold mt-6 mb-3 ${activeTheme.titleColor}`}>
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      if (trimmed.startsWith('> ')) {
        return (
          <blockquote 
            key={idx} 
            className={`my-6 pl-5 py-1 border-l-2 border-amber-500/50 italic text-amber-200/90 text-lg`}
          >
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }

      if (trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="ml-5 list-disc my-1">
            {trimmed.replace('- ', '')}
          </li>
        );
      }

      if (trimmed === '---') {
        return <hr key={idx} className={`my-8 border-t ${activeTheme.border}`} />;
      }

      return (
        <p key={idx} className="my-3.5 tracking-normal">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${activeTheme.bg} animate-fade-in overflow-hidden select-text`}>
      {/* Background Visual Backdrop (Atmospheric photo blend) */}
      {settings.showBackgroundArt && activeTheme.defaultBgImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-20 filter blur-md scale-105 transition-opacity duration-1000"
          style={{ backgroundImage: `url(${activeTheme.defaultBgImage})` }}
        />
      )}

      {/* Reading Progress Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 h-1 bg-stone-800/40">
        <div 
          className="h-full bg-amber-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Header Controls (Minimal, distraction-free) */}
      <header className="relative z-30 flex items-center justify-between px-6 py-4 bg-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white bg-black/40 hover:bg-black/60 border border-white/10 transition-colors backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Editor</span>
          </button>

          <span className={`text-xs ${activeTheme.muted} hidden sm:inline`}>
            {note.readingTimeMinutes} min baca · {note.wordCount} kata
          </span>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          {/* Reader settings toggle button */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white bg-black/40 hover:bg-black/60 border border-white/10 transition-colors backdrop-blur-md"
            title="Pengaturan Tampilan Baca"
          >
            <Settings2 className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Pengaturan Suasana</span>
          </button>
        </div>
      </header>

      {/* Settings Drawer (Flyout) */}
      {showSettingsDrawer && (
        <div className="absolute top-16 right-6 z-40 w-80 bg-[#16181e]/95 backdrop-blur-xl border border-stone-800 rounded-2xl p-5 shadow-2xl text-stone-200 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h3 className="text-xs font-semibold text-stone-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Kustomisasi Vibes Membaca
            </h3>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-stone-400 hover:text-stone-100 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Theme Palette */}
          <div className="py-3 border-b border-stone-800">
            <label className="text-[11px] font-medium text-stone-400 block mb-2">
              Tema Warna Kertas
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'sepia', label: 'Sepia Antik' },
                { id: 'midnight', label: 'Malam Biru' },
                { id: 'rain', label: 'Hujan Kabut' },
                { id: 'amber', label: 'Kafe Senja' },
                { id: 'oled', label: 'Hitam OLED' },
                { id: 'ivory', label: 'Gading Bersih' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ theme: t.id as ThemeChoice })}
                  className={`px-2 py-1.5 text-[11px] rounded-lg transition-colors truncate ${
                    settings.theme === t.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                      : 'bg-stone-900/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Typeface */}
          <div className="py-3 border-b border-stone-800">
            <label className="text-[11px] font-medium text-stone-400 block mb-2">
              Gaya Tulisan (Tipografi)
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'serif', label: 'Serif Klasik (Novel)' },
                { id: 'sans', label: 'Modern Bersih' },
                { id: 'mono', label: 'Mesin Tik Retro' },
                { id: 'handwriting', label: 'Tulisan Tangan' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ fontFamily: f.id as FontChoice })}
                  className={`p-2 text-left rounded-lg transition-colors truncate ${
                    settings.fontFamily === f.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                      : 'bg-stone-900/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="py-3 border-b border-stone-800">
            <label className="text-[11px] font-medium text-stone-400 block mb-2">
              Ukuran Teks
            </label>
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg">
              {['sm', 'base', 'lg', 'xl', '2xl'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => onUpdateSettings({ fontSize: sz as any })}
                  className={`flex-1 py-1 text-xs rounded transition-colors ${
                    settings.fontSize === sz
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Background visual artwork toggle */}
          <div className="pt-3 flex items-center justify-between">
            <span className="text-xs text-stone-300">Latar Belakang Visual</span>
            <button
              onClick={() => onUpdateSettings({ showBackgroundArt: !settings.showBackgroundArt })}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                settings.showBackgroundArt
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {settings.showBackgroundArt ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>
        </div>
      )}

      {/* Main Reading Flow */}
      <div 
        id="reading-container"
        className="relative z-10 flex-1 overflow-y-auto px-6 py-12 scroll-smooth"
      >
        <div className={`max-w-2xl mx-auto p-8 sm:p-12 rounded-2xl ${activeTheme.containerBg} ${activeTheme.border} border shadow-2xl backdrop-blur-md transition-all duration-300`}>
          {/* Note Title */}
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-display-reading font-bold tracking-tight mb-4 ${activeTheme.titleColor}`}>
            {note.title.trim() || 'Catatan Tanpa Judul'}
          </h1>

          {/* Meta header (Rule 1.A: clean unboxed metadata) */}
          <div className={`flex items-center gap-2 text-xs ${activeTheme.muted} pb-6 mb-8 border-b ${activeTheme.border}`}>
            <span>{new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span aria-hidden="true">·</span>
            <span>{note.wordCount} kata</span>
            <span aria-hidden="true">·</span>
            <span>{note.readingTimeMinutes} menit baca</span>
            <span aria-hidden="true">·</span>
            <span className={activeTheme.accent}>{currentTrack.moodLabel}</span>
          </div>

          {/* Main Body */}
          <div className={`${getFontClass(settings.fontFamily)} ${getFontSizeClass(settings.fontSize)} ${activeTheme.text}`}>
            {renderFormattedParagraphs(note.content)}
          </div>

          {/* Editorial Footer mark */}
          <div className={`mt-16 pt-8 border-t ${activeTheme.border} flex items-center justify-between text-xs ${activeTheme.muted}`}>
            <span className="italic">Selesai membaca · Catatan Syahdu</span>
            <span>Dibuat dengan damai</span>
          </div>
        </div>
      </div>

      {/* Floating Quiet Audio Pill (Fixed at Bottom Center) */}
      <div className="relative z-30 pb-4 pt-2 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 bg-[#121417]/90 backdrop-blur-lg border border-stone-800/80 rounded-full shadow-2xl">
          {/* Track info */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onTogglePlay}
              className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center transition-transform active:scale-95"
              title={isPlaying ? "Jeda" : "Putar"}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
            <div className="text-left text-xs max-w-[160px] truncate">
              <span className="font-medium text-stone-100 block truncate">
                {currentTrack.title}
              </span>
              <span className="text-[10px] text-stone-400 block truncate">
                {currentTrack.artist}
              </span>
            </div>
          </div>

          <div className="w-[1px] h-4 bg-stone-700" />

          {/* Mixer shortcut */}
          <button
            onClick={onOpenMixer}
            className="p-1.5 text-stone-300 hover:text-amber-400 transition-colors"
            title="Buka Mixer Ambience"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Volume Mute */}
          <button
            onClick={onToggleMute}
            className="p-1.5 text-stone-300 hover:text-amber-400 transition-colors"
            title={isMuted ? "Buka Suara" : "Senyap"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
