export type MoodType = 'calm' | 'rainy' | 'night' | 'cafe' | 'nostalgic' | 'dreamy';

export type FontChoice = 'serif' | 'sans' | 'mono' | 'handwriting';

export type ThemeChoice = 'sepia' | 'midnight' | 'rain' | 'amber' | 'oled' | 'ivory';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood: MoodType;
  pinned: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  readingTimeMinutes: number;
  linkedTrackId?: string;
}

export interface SoundLayerState {
  id: string;
  name: string;
  nameId: string;
  volume: number; // 0 to 1
  enabled: boolean;
  icon: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  mood: MoodType;
  moodLabel: string;
  coverImage: string;
  sourceUrl?: string; // audio source if external
  isProcedural?: boolean; // synthesized Web Audio chord progression
  durationSeconds?: number;
  description: string;
}

export interface ReaderSettings {
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  fontFamily: FontChoice;
  theme: ThemeChoice;
  lineHeight: 'relaxed' | 'loose' | 'extra-loose';
  showBackgroundArt: boolean;
  particlesEnabled: boolean;
  typewriterSound: boolean;
}
