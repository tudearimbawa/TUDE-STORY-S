import { MusicTrack, SoundLayerState } from '../types.ts';

// High-fidelity generated imagery for album art
export const IMAGES = {
  rain: '/src/assets/images/ambient_rainy_window_1791551403749.jpg',
  midnight: '/src/assets/images/ambient_midnight_desk_1791551427549.jpg',
  cafe: '/src/assets/images/ambient_cozy_cafe_1791551447126.jpg',
};

export const DEFAULT_TRACKS: MusicTrack[] = [
  {
    id: 'track-procedural-lofi',
    title: 'Hening & Akord Rhodes Malam',
    artist: 'Soundscape Studio',
    mood: 'calm',
    moodLabel: 'Tenang & Damai',
    coverImage: IMAGES.midnight,
    isProcedural: true,
    description: 'Generasi akord piano listrik Rhodes tanpa henti. Dirancang khusus untuk konsentrasi membaca dan meredam kebisingan luar.',
  },
  {
    id: 'track-rainy-cafe',
    title: 'Rintik di Kaca Kafe',
    artist: 'Syahdu Acoustic',
    mood: 'rainy',
    moodLabel: 'Hujan Lembut',
    coverImage: IMAGES.rain,
    // Reliable CC0 / public domain audio archive link with automatic seamless procedural fallback
    sourceUrl: 'https://cdn.freesound.org/previews/531/531510_5121236-lq.mp3',
    description: 'Petikan akustik melankolis bersanding dengan ketukan drum lo-fi pelan untuk menemani lembar-lembar cerita.',
  },
  {
    id: 'track-cozy-sunlight',
    title: 'Aroma Kopi & Kertas Tua',
    artist: 'Morning Solitude',
    mood: 'cafe',
    moodLabel: 'Kafe Hangat',
    coverImage: IMAGES.cafe,
    sourceUrl: 'https://cdn.freesound.org/previews/416/416632_5121236-lq.mp3',
    description: 'Alunan melodi santai dengan getaran hangat sore hari, cocok untuk merangkai ide dan refleksi diri.',
  },
  {
    id: 'track-midnight-nocturne',
    title: 'Catatan di Sudut Malam',
    artist: 'Nocturne Piano',
    mood: 'night',
    moodLabel: 'Malam Syahdu',
    coverImage: IMAGES.midnight,
    sourceUrl: 'https://cdn.freesound.org/previews/512/512435_11270220-lq.mp3',
    description: 'Dentang tuts piano tunggal yang lembut dan mengalun syahdu di keheningan larut malam.',
  },
  {
    id: 'track-nostalgia-breeze',
    title: 'Kenangan yang Singgah',
    artist: 'Dreamer Ambient',
    mood: 'nostalgic',
    moodLabel: 'Nostalgia',
    coverImage: IMAGES.rain,
    isProcedural: true,
    description: 'Dengungan harmoni ambient yang membangkitkan memori hangat masa lalu dan ketenangan batin.',
  },
];

export const INITIAL_SOUND_LAYERS: SoundLayerState[] = [
  {
    id: 'rain',
    name: 'Hujan Rintik',
    nameId: 'rain',
    volume: 0.35,
    enabled: true,
    icon: 'CloudRain',
  },
  {
    id: 'fireplace',
    name: 'Gemerisik Lilin / Api',
    nameId: 'fireplace',
    volume: 0.2,
    enabled: false,
    icon: 'Flame',
  },
  {
    id: 'vinyl',
    name: 'Piringan Hitam (Vinyl)',
    nameId: 'vinyl',
    volume: 0.15,
    enabled: true,
    icon: 'Disc3',
  },
  {
    id: 'night',
    name: 'Angin & Jangkrik Malam',
    nameId: 'night',
    volume: 0.25,
    enabled: false,
    icon: 'Moon',
  },
  {
    id: 'cafe',
    name: 'Suasana Kafe Tenang',
    nameId: 'cafe',
    volume: 0.2,
    enabled: false,
    icon: 'Coffee',
  },
];
