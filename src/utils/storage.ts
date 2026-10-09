import { Note, ReaderSettings } from '../types.ts';

const STORAGE_KEY_NOTES = 'catatan_syahdu_notes_v1';
const STORAGE_KEY_SETTINGS = 'catatan_syahdu_settings_v1';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Tentang Rintik Hujan di Luar Jendela',
    content: `Sore ini hujan turun lagi tanpa aba-aba. Butir-butir air menabrak kaca jendela dengan irama yang tak menuntut apa pun—hanya mengalir, meluncur perlahan, lalu menyatu di bingkai bawah.

Ada secangkir teh melati hangat di samping buku catatan ini. Asapnya mengepul tipis ke udara yang dingin, membawa aroma manis yang familiar. Di saat-saat seperti inilah, dunia yang biasanya bising terasa melambat. Tidak ada pesan yang harus segera dibalas, tidak ada pertemuan yang mendesak.

Hanya ada suara hujan, denting tuts piano di latar belakang, dan kejujuran yang pelan-pelan merayap ke atas kertas.

"Mungkin kita tidak selalu butuh jawaban cepat. Kadang yang kita perlukan hanyalah ruang untuk mendengarkan diri sendiri berbicara tanpa diinterupsi oleh keramaian."

Aku membiarkan jemariku menulis tanpa rencana. Kata demi kata lahir seperti tetesan air di luar sana: bebas, sunyi, dan menenangkan.`,
    tags: ['Refleksi', 'Hujan', 'Ketenangan'],
    mood: 'rainy',
    pinned: true,
    isFavorite: true,
    createdAt: Date.now() - 3600000 * 24 * 2,
    updatedAt: Date.now() - 3600000 * 5,
    wordCount: 142,
    readingTimeMinutes: 1,
    linkedTrackId: 'track-rainy-cafe',
  },
  {
    id: 'note-2',
    title: 'Catatan Tengah Malam & Kota yang Terlelap',
    content: `Pukul 00:45. Lampu jalan di seberang rumah memancarkan pendar kuning temaram di atas aspal yang sepi. 

Semua orang tampaknya sudah menemukan mimpinya masing-masing, sementara aku masih betah duduk di sini, ditemani lampu meja kuningan dan buku harian bersampul kulit ini.

Tengah malam memiliki gravitasi tersendiri. Pada jam-jam ini, topeng-topeng yang kita kenakan sepanjang siang hari luruh dengan sendirinya. Kita tidak lagi menjadi pegawai yang cekatan, teman yang selalu ceria, atau orang yang selalu tahu arah. Kita kembali menjadi manusia sederhana yang punya rasa lelah, punya rindu, dan punya rasa penasaran akan masa depan.

Aku menyalakan pemutar musik dengan volume rendah. Akord-akord lembut memenuhi sudut kamar. Rasanya seperti dibalut selimut hangat di tengah malam yang dingin.

Besok matahari akan terbit lagi dengan rutinitasnya. Namun malam ini, menit-menit ini adalah milikku sepenuhnya.`,
    tags: ['Malam', 'Jurnal', 'Kontemplasi'],
    mood: 'night',
    pinned: true,
    isFavorite: false,
    createdAt: Date.now() - 3600000 * 24 * 5,
    updatedAt: Date.now() - 3600000 * 12,
    wordCount: 153,
    readingTimeMinutes: 1,
    linkedTrackId: 'track-procedural-lofi',
  },
  {
    id: 'note-3',
    title: 'Secangkir Kopi dan Rencana-Rencana Kecil',
    content: `Duduk di meja kayu sudut favoritku. Udara pagi terasa sejuk, aroma biji kopi yang baru digiling berbaur dengan angin yang masuk dari celah pintu depan.

Banyak orang sibuk membuat resolusi-resolusi raksasa yang menakutkan. Hari ini aku memilih jalan yang berbeda. Aku ingin mencatat hal-hal kecil yang sering luput disyukuri:

1. Rasa hangat di telapak tangan saat memegang cangkir keramik.
2. Kesempatan untuk membaca tiga bab novel tanpa tergesa-gesa.
3. Mendengarkan lagu favorit berulang kali tanpa merasa bosan.
4. Memberi senyum pada orang asing yang membukakan pintu.
5. Menghirup udara dalam-dalam dan menyadari: aku sudah bertahan sejauh ini.

Hidup tidak melulu tentang garis finis. Terkadang, keindahan terbesarnya justru bersembunyi di jeda antara satu tujuan ke tujuan berikutnya.`,
    tags: ['Kopi', 'Pagi', 'Rasa Syukur'],
    mood: 'cafe',
    pinned: false,
    isFavorite: true,
    createdAt: Date.now() - 3600000 * 24 * 7,
    updatedAt: Date.now() - 3600000 * 36,
    wordCount: 136,
    readingTimeMinutes: 1,
    linkedTrackId: 'track-cozy-sunlight',
  },
];

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 'lg',
  fontFamily: 'serif',
  theme: 'sepia',
  lineHeight: 'relaxed',
  showBackgroundArt: true,
  particlesEnabled: true,
  typewriterSound: true,
};

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      saveNotes(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTES;
  } catch (e) {
    console.error('Failed to load notes from localStorage', e);
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage', e);
  }
}

export function loadReaderSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_READER_SETTINGS;
    return { ...DEFAULT_READER_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_READER_SETTINGS;
  }
}

export function saveReaderSettings(settings: ReaderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save reader settings', e);
  }
}

export function calculateReadingTime(text: string): { words: number; minutes: number } {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Average reading speed ~ 200 words per minute
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, minutes };
}
