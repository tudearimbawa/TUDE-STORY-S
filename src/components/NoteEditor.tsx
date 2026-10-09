import React, { useRef, useEffect } from 'react';
import { 
  BookOpen, Download, Share2, Pin, Heart, Trash2, 
  Sparkles, Bold, Italic, Quote, Heading2, List, Minus, 
  Check, Volume2
} from 'lucide-react';
import { Note, MoodType } from '../types.ts';
import { soundEngine } from '../utils/audioEngine.ts';

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (updated: Partial<Note>) => void;
  onOpenReaderMode: () => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  typewriterSound: boolean;
  onSetMood: (mood: MoodType) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdateNote,
  onOpenReaderMode,
  onDeleteNote,
  onTogglePin,
  onToggleFavorite,
  typewriterSound,
  onSetMood,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea according to content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(400, textareaRef.current.scrollHeight)}px`;
    }
  }, [note.content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Play typewriter click sound if enabled
    if (typewriterSound && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt') {
      soundEngine.playTypewriterKeystroke();
    }

    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newText = note.content.substring(0, start) + '    ' + note.content.substring(end);
      onUpdateNote({ content: newText });
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = note.content.substring(start, end);
    const replacement = before + (selectedText || 'teks') + after;
    
    const newContent = note.content.substring(0, start) + replacement + note.content.substring(end);
    onUpdateNote({ content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText ? selectedText.length : 4)
      );
    }, 0);
  };

  const handleExportText = (format: 'txt' | 'md') => {
    const filename = `${(note.title.trim() || 'catatan').replace(/[^a-zA-Z0-9_-]/g, '_')}.${format}`;
    const fileContent = format === 'md' 
      ? `# ${note.title}\n\n*Dibuat pada ${new Date(note.createdAt).toLocaleDateString('id-ID')}*\n\n${note.content}`
      : `${note.title}\n\n${note.content}`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const moods: { id: MoodType; label: string; desc: string }[] = [
    { id: 'rainy', label: 'Hujan', desc: 'Rintik air di jendela & akustik syahdu' },
    { id: 'night', label: 'Malam', desc: 'Keheningan tengah malam & tuts piano' },
    { id: 'cafe', label: 'Kafe', desc: 'Kopi hangat & alunan santai' },
    { id: 'calm', label: 'Tenang', desc: 'Damai & tanpa distraksi' },
    { id: 'nostalgic', label: 'Nostalgia', desc: 'Kenangan hangat & piringan hitam' },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-125px)] overflow-y-auto bg-[#131518]">
      {/* Top Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#131518]/90 backdrop-blur-md border-b border-stone-800">
        {/* Left: Mood selection tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-stone-400 font-medium mr-1 hidden sm:inline">
            Suasana:
          </span>
          {moods.map((m) => (
            <button
              key={m.id}
              onClick={() => onSetMood(m.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                note.mood === m.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          {/* Zen Reader Button */}
          <button
            onClick={onOpenReaderMode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 hover:text-white rounded-lg border border-stone-700 transition-colors shadow-sm"
            title="Masuk ke mode membaca layar penuh dengan backsound syahdu"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode Membaca Syahdu</span>
          </button>

          {/* Export Dropdown */}
          <div className="flex items-center bg-stone-800 rounded-lg border border-stone-700 overflow-hidden">
            <button
              onClick={() => handleExportText('md')}
              className="px-2.5 py-1.5 text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
              title="Unduh sebagai Markdown"
            >
              .MD
            </button>
            <div className="w-[1px] h-4 bg-stone-700" />
            <button
              onClick={() => handleExportText('txt')}
              className="px-2.5 py-1.5 text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
              title="Unduh sebagai Teks Biasa"
            >
              .TXT
            </button>
          </div>

          <button
            onClick={() => onTogglePin(note.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              note.pinned 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
            title={note.pinned ? "Lepas Sematan" : "Sematkan Catatan"}
          >
            <Pin className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleFavorite(note.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              note.isFavorite 
                ? 'bg-red-500/20 border-red-500/40 text-red-300' 
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
            title="Favoritkan"
          >
            <Heart className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (confirm('Hapus catatan ini?')) {
                onDeleteNote(note.id);
              }
            }}
            className="p-1.5 bg-stone-800 border border-stone-700 text-stone-400 hover:text-red-400 rounded-lg transition-colors"
            title="Hapus Catatan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Writing Canvas */}
      <div className="max-w-3xl w-full mx-auto px-6 py-8 flex-1 flex flex-col">
        {/* Title Input */}
        <input
          type="text"
          placeholder="Tulis judul catatan..."
          value={note.title}
          onChange={(e) => onUpdateNote({ title: e.target.value })}
          className="w-full text-2xl sm:text-3xl font-display-reading font-semibold text-stone-100 placeholder-stone-600 bg-transparent border-none outline-none mb-3"
        />

        {/* Clean unboxed metadata (Rule 1.A) */}
        <div className="flex items-center gap-2 text-xs text-stone-400 pb-4 mb-4 border-b border-stone-800/80">
          <span>{new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span aria-hidden="true">·</span>
          <span>{note.wordCount} kata</span>
          <span aria-hidden="true">·</span>
          <span>{note.readingTimeMinutes} menit baca</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400/90 flex items-center gap-1">
            <Check className="w-3 h-3" /> Tersimpan
          </span>
        </div>

        {/* Markdown mini formatting helper bar */}
        <div className="flex items-center gap-1 mb-4 p-1 bg-stone-900/60 rounded-lg border border-stone-800/80 w-fit text-stone-400">
          <button
            onClick={() => insertMarkdown('**', '**')}
            className="p-1.5 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
            title="Tebal (Bold)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className="p-1.5 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
            title="Miring (Italic)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('## ')}
            className="p-1.5 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
            title="Subjudul"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('> ')}
            className="p-1.5 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
            title="Kutipan (Quote)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('- ')}
            className="p-1.5 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
            title="Daftar (List)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('\n---\n')}
            className="p-1.5 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
            title="Garis Pemisah"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Textarea */}
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(e) => onUpdateNote({ content: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Tuliskan isi pikiran, cerita, refleksi, atau puisimu di sini... Biarkan alunan musik mengalirkan setiap katamu..."
          className="w-full flex-1 min-h-[420px] bg-transparent text-stone-200 placeholder-stone-600 border-none outline-none resize-none font-serif-reading text-base sm:text-lg leading-relaxed selection:bg-amber-500/20 selection:text-amber-200"
        />
      </div>
    </div>
  );
};
