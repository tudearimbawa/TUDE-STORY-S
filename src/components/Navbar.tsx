import React from 'react';
import { PenLine, Feather } from 'lucide-react';

interface NavbarProps {
  onNewNote: () => void;
  onOpenReaderMode: () => void;
  onOpenMixer: () => void;
  onOpenAbout: () => void;
  onShowAllNotes: () => void;
  activeView: 'editor' | 'reader' | 'all';
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewNote,
  onOpenReaderMode,
  onOpenMixer,
  onOpenAbout,
  onShowAllNotes,
  activeView,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#121417]/90 backdrop-blur-md border-b border-stone-800">
      {/* Zone 1: Single text element Brand wordmark */}
      <button 
        onClick={onShowAllNotes}
        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-stone-100 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
      >
        <Feather className="w-5 h-5 text-amber-400" />
        <span>Catatan Syahdu</span>
      </button>

      {/* Zone 2: 4-5 concise single-line text links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
        <button
          onClick={onShowAllNotes}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'all' ? 'text-amber-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          Semua Catatan
        </button>
        <button
          onClick={onOpenReaderMode}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'reader' ? 'text-amber-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          Mode Membaca
        </button>
        <button
          onClick={onOpenMixer}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
        >
          Soundscape Mixer
        </button>
        <button
          onClick={onOpenAbout}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
        >
          Tentang & Vibes
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onNewNote}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>Tulis Baru</span>
        </button>
      </div>
    </header>
  );
};
