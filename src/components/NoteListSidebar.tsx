import React, { useState } from 'react';
import { 
  Search, Pin, Heart, Trash2, Plus, 
  CloudRain, Moon, Coffee, Sparkles, Feather
} from 'lucide-react';
import { Note, MoodType } from '../types.ts';

interface NoteListSidebarProps {
  notes: Note[];
  selectedNoteId: string;
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const NoteListSidebar: React.FC<NoteListSidebarProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  onDeleteNote,
  onTogglePin,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMood = selectedMoodFilter === 'all' || note.mood === selectedMoodFilter;
    return matchesSearch && matchesMood;
  });

  // Sort pinned first, then by updatedAt
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getMoodLabel = (mood: MoodType) => {
    switch (mood) {
      case 'rainy': return 'Hujan';
      case 'night': return 'Malam';
      case 'cafe': return 'Kafe';
      case 'calm': return 'Tenang';
      case 'nostalgic': return 'Nostalgia';
      default: return 'Suasana';
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col h-[calc(100vh-125px)] border-r border-stone-800 bg-[#14161a] shrink-0">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-stone-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari catatan atau topik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-900 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/70"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mood filter tabs (Segmented controls) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'rainy', label: 'Hujan' },
            { id: 'night', label: 'Malam' },
            { id: 'cafe', label: 'Kafe' },
            { id: 'calm', label: 'Tenang' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedMoodFilter(item.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedMoodFilter === item.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sortedNotes.length === 0 ? (
          <div className="p-8 text-center text-stone-500">
            <Feather className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
            <p className="text-xs">Belum ada catatan yang cocok</p>
            <button
              onClick={onNewNote}
              className="mt-3 text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Buat catatan baru
            </button>
          </div>
        ) : (
          sortedNotes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1e2229] border-amber-500/40 shadow-sm'
                    : 'bg-stone-900/30 border-stone-800/60 hover:bg-stone-850 hover:border-stone-700/60'
                }`}
              >
                {/* Note Title & Pin Indicator */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`text-sm font-semibold truncate ${
                    isSelected ? 'text-stone-100' : 'text-stone-200'
                  }`}>
                    {note.title.trim() || 'Catatan Tanpa Judul'}
                  </h3>
                  {note.pinned && (
                    <Pin className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Excerpt */}
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-2 font-serif-reading">
                  {note.content.trim() || 'Belum ada tulisan...'}
                </p>

                {/* Clean unboxed metadata with typographic separators (Rule 1.A) */}
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{formatDate(note.updatedAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{getMoodLabel(note.mood)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{note.readingTimeMinutes} min baca</span>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(note.id);
                      }}
                      className="p-1 hover:text-amber-400 text-stone-500 transition-colors"
                      title={note.pinned ? "Lepas Sematan" : "Sematkan di Atas"}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(note.id);
                      }}
                      className="p-1 hover:text-red-400 text-stone-500 transition-colors"
                      title={note.isFavorite ? "Hapus Favorit" : "Favoritkan"}
                    >
                      <Heart className={`w-3 h-3 ${note.isFavorite ? 'text-red-400 fill-red-400' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Hapus catatan "${note.title}"?`)) {
                          onDeleteNote(note.id);
                        }
                      }}
                      className="p-1 hover:text-red-400 text-stone-500 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
        <span>{notes.length} total catatan</span>
        <button
          onClick={onNewNote}
          className="hover:text-amber-300 text-amber-400 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Catatan Baru
        </button>
      </div>
    </aside>
  );
};
