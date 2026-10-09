/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  loadNotes, saveNotes, loadReaderSettings, saveReaderSettings, 
  calculateReadingTime 
} from './utils/storage.ts';
import { Note, SoundLayerState, MusicTrack, ReaderSettings, MoodType } from './types.ts';
import { DEFAULT_TRACKS, INITIAL_SOUND_LAYERS } from './utils/musicTracks.ts';
import { soundEngine, AmbientSoundId } from './utils/audioEngine.ts';

import { Navbar } from './components/Navbar.tsx';
import { NoteListSidebar } from './components/NoteListSidebar.tsx';
import { NoteEditor } from './components/NoteEditor.tsx';
import { AudioPlayerBar } from './components/AudioPlayerBar.tsx';
import { SoundscapeMixerModal } from './components/SoundscapeMixerModal.tsx';
import { TrackSelectModal } from './components/TrackSelectModal.tsx';
import { ReadingModeView } from './components/ReadingModeView.tsx';
import { AboutModal } from './components/AboutModal.tsx';

export default function App() {
  // ----------------------------------------------------
  // Notes State
  // ----------------------------------------------------
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => {
    const loaded = loadNotes();
    return loaded.length > 0 ? loaded[0].id : '';
  });

  // ----------------------------------------------------
  // Reader Settings State
  // ----------------------------------------------------
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => loadReaderSettings());

  // ----------------------------------------------------
  // Audio & Music State
  // ----------------------------------------------------
  const [tracks, setTracks] = useState<MusicTrack[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Soundscape layers (Rain, Fireplace, Vinyl, Night, Cafe)
  const [soundLayers, setSoundLayers] = useState<SoundLayerState[]>(INITIAL_SOUND_LAYERS);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [remainingSleepSeconds, setRemainingSleepSeconds] = useState<number>(0);

  // ----------------------------------------------------
  // Modals & Navigation Views
  // ----------------------------------------------------
  const [isReaderModeOpen, setIsReaderModeOpen] = useState<boolean>(false);
  const [isMixerOpen, setIsMixerOpen] = useState<boolean>(false);
  const [isTrackSelectOpen, setIsTrackSelectOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'editor' | 'reader' | 'all'>('editor');

  const currentTrack = tracks[currentTrackIndex] || DEFAULT_TRACKS[0];
  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  // Save notes to storage on change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Save reader settings to storage on change
  useEffect(() => {
    saveReaderSettings(readerSettings);
  }, [readerSettings]);

  // ----------------------------------------------------
  // Playback Control Handlers
  // ----------------------------------------------------
  const playTrack = (track: MusicTrack) => {
    soundEngine.resume();
    setIsPlaying(true);
    if (track.isProcedural) {
      soundEngine.startProceduralMusic();
    } else if (track.sourceUrl) {
      soundEngine.playAudioStream(track.sourceUrl, () => {
        // Track ended, go to next track
        handleNextTrack();
      });
    } else {
      soundEngine.startProceduralMusic();
    }
  };

  const handleTogglePlay = () => {
    soundEngine.resume();
    if (isPlaying) {
      soundEngine.pauseMusic();
      setIsPlaying(false);
    } else {
      playTrack(currentTrack);
    }
  };

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
    playTrack(tracks[nextIdx]);
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    playTrack(tracks[prevIdx]);
  };

  const handleSelectTrack = (track: MusicTrack) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    } else {
      setTracks((prev) => [track, ...prev]);
      setCurrentTrackIndex(0);
    }
    playTrack(track);
  };

  const handleUpdateMasterVolume = (vol: number) => {
    setMasterVolume(vol);
    soundEngine.setMusicVolume(vol);
    if (isMuted && vol > 0) {
      setIsMuted(false);
      soundEngine.setMasterMute(false);
    }
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundEngine.setMasterMute(newMuted);
  };

  // ----------------------------------------------------
  // Ambient Sound Layers Handlers
  // ----------------------------------------------------
  const handleUpdateLayer = (id: string, volume: number, enabled: boolean) => {
    soundEngine.resume();
    setSoundLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, volume, enabled } : l))
    );
    soundEngine.setAmbientVolume(id as AmbientSoundId, enabled ? volume : 0);
  };

  // ----------------------------------------------------
  // Sleep Timer
  // ----------------------------------------------------
  const handleSetSleepTimer = (minutes: number) => {
    setSleepTimerMinutes(minutes);
    if (minutes === 0) {
      soundEngine.clearSleepTimer();
      setRemainingSleepSeconds(0);
    } else {
      soundEngine.setSleepTimer(minutes, (remainingSec) => {
        setRemainingSleepSeconds(remainingSec);
        if (remainingSec === 0) {
          setIsPlaying(false);
          setSleepTimerMinutes(0);
        }
      });
    }
  };

  // ----------------------------------------------------
  // Note CRUD Operations
  // ----------------------------------------------------
  const handleNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      tags: ['Baru'],
      mood: 'calm',
      pinned: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: 0,
      readingTimeMinutes: 1,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setActiveView('editor');
  };

  const handleUpdateSelectedNote = (updatedFields: Partial<Note>) => {
    if (!selectedNoteId) return;

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNoteId) return n;

        const content = updatedFields.content !== undefined ? updatedFields.content : n.content;
        const counts = calculateReadingTime(content);

        return {
          ...n,
          ...updatedFields,
          updatedAt: Date.now(),
          wordCount: counts.words,
          readingTimeMinutes: counts.minutes,
        };
      })
    );
  };

  const handleDeleteNote = (id: string) => {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (selectedNoteId === id) {
      if (remaining.length > 0) {
        setSelectedNoteId(remaining[0].id);
      } else {
        handleNewNote();
      }
    }
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleToggleFavorite = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  };

  // Atmosphere / Mood preset change
  const handleSetMood = (mood: MoodType) => {
    handleUpdateSelectedNote({ mood });

    // Sync ambient layers to match chosen mood
    if (mood === 'rainy') {
      handleUpdateLayer('rain', 0.4, true);
      handleUpdateLayer('vinyl', 0.15, true);
    } else if (mood === 'night') {
      handleUpdateLayer('night', 0.25, true);
      handleUpdateLayer('fireplace', 0.2, true);
      handleUpdateLayer('rain', 0, false);
    } else if (mood === 'cafe') {
      handleUpdateLayer('cafe', 0.25, true);
      handleUpdateLayer('rain', 0, false);
    } else if (mood === 'calm') {
      handleUpdateLayer('vinyl', 0.15, true);
      handleUpdateLayer('rain', 0.1, true);
    }
  };

  return (
    <div className="min-h-screen bg-[#121417] text-[#e2e8f0] flex flex-col antialiased">
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        onNewNote={handleNewNote}
        onOpenReaderMode={() => {
          setIsReaderModeOpen(true);
          setActiveView('reader');
        }}
        onOpenMixer={() => setIsMixerOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onShowAllNotes={() => setActiveView('editor')}
        activeView={isReaderModeOpen ? 'reader' : activeView}
      />

      {/* Main App Workspace */}
      <main className="flex-1 flex overflow-hidden pb-16">
        {/* Left: Notes Sidebar */}
        <NoteListSidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={(note) => {
            setSelectedNoteId(note.id);
            setActiveView('editor');
            // If note has linked track, switch to it
            if (note.linkedTrackId) {
              const matched = tracks.find((t) => t.id === note.linkedTrackId);
              if (matched) {
                const idx = tracks.indexOf(matched);
                if (idx !== -1 && idx !== currentTrackIndex) {
                  setCurrentTrackIndex(idx);
                  if (isPlaying) {
                    playTrack(matched);
                  }
                }
              }
            }
          }}
          onNewNote={handleNewNote}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePin}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Right: Note Writing Canvas */}
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onUpdateNote={handleUpdateSelectedNote}
            onOpenReaderMode={() => {
              setIsReaderModeOpen(true);
              setActiveView('reader');
            }}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            typewriterSound={readerSettings.typewriterSound}
            onSetMood={handleSetMood}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-stone-500">
            <p className="text-sm">Tidak ada catatan yang dipilih</p>
          </div>
        )}
      </main>

      {/* Bottom Floating Atmospheric Audio Player */}
      <AudioPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        masterVolume={masterVolume}
        onUpdateMasterVolume={handleUpdateMasterVolume}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeLayers={soundLayers}
        onOpenMixer={() => setIsMixerOpen(true)}
        onOpenTrackSelect={() => setIsTrackSelectOpen(true)}
        onOpenReaderMode={() => {
          setIsReaderModeOpen(true);
          setActiveView('reader');
        }}
        isReaderModeOpen={isReaderModeOpen}
      />

      {/* Fullscreen Reading Mode (Zen Atmosphere) */}
      {isReaderModeOpen && selectedNote && (
        <ReadingModeView
          note={selectedNote}
          onClose={() => {
            setIsReaderModeOpen(false);
            setActiveView('editor');
          }}
          settings={readerSettings}
          onUpdateSettings={(newSettings) =>
            setReaderSettings((prev) => ({ ...prev, ...newSettings }))
          }
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          masterVolume={masterVolume}
          onUpdateMasterVolume={handleUpdateMasterVolume}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenMixer={() => setIsMixerOpen(true)}
        />
      )}

      {/* Soundscape & Ambience Mixer Modal */}
      <SoundscapeMixerModal
        isOpen={isMixerOpen}
        onClose={() => setIsMixerOpen(false)}
        layers={soundLayers}
        onUpdateLayer={handleUpdateLayer}
        masterVolume={masterVolume}
        onUpdateMasterVolume={handleUpdateMasterVolume}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        typewriterSound={readerSettings.typewriterSound}
        onToggleTypewriterSound={() =>
          setReaderSettings((prev) => ({
            ...prev,
            typewriterSound: !prev.typewriterSound,
          }))
        }
        sleepTimerMinutes={sleepTimerMinutes}
        onSetSleepTimer={handleSetSleepTimer}
        remainingSleepSeconds={remainingSleepSeconds}
      />

      {/* Track Selection & Custom Audio Modal */}
      <TrackSelectModal
        isOpen={isTrackSelectOpen}
        onClose={() => setIsTrackSelectOpen(false)}
        tracks={tracks}
        currentTrackId={currentTrack.id}
        isPlaying={isPlaying}
        onSelectTrack={handleSelectTrack}
        onTogglePlay={handleTogglePlay}
        onAddCustomTrack={(newTrack) => {
          setTracks((prev) => [newTrack, ...prev]);
        }}
      />

      {/* About & Guide Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
