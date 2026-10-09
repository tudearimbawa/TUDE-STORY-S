import React from 'react';
import { X, Feather, Music2, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#181b20] border border-stone-800 rounded-2xl shadow-2xl p-6 text-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-stone-100">
              Tentang Catatan Syahdu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs text-stone-300 leading-relaxed max-h-[380px] overflow-y-auto pr-1">
          <p>
            <strong>Catatan Syahdu</strong> adalah aplikasi notepad pribadi yang didesain secara khusus untuk menghadirkan ketenangan batin saat menulis dan membaca.
          </p>

          <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 space-y-2">
            <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Music2 className="w-4 h-4" /> Mengapa Musik & Ambience Penting?
            </h4>
            <p className="text-stone-400">
              Penelitian membuktikan bahwa suara latar berfrekuensi stabil (seperti rintik hujan, gemerisik lilin, dan akord piano lembut) mampu meredam distraksi sekitar dan mengaktifkan gelombang alfa otak—menciptakan suasana fokus, reflektif, dan emosional yang menyatu dengan setiap bait kata yang kamu baca.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-stone-100">Fitur Utama:</h4>
            <ul className="space-y-1.5 list-disc list-inside text-stone-400">
              <li><strong className="text-stone-200">Soundscape Mixer:</strong> Campur suara rintik hujan, piringan hitam, api unggun, atau jangkrik malam dengan slider mandiri.</li>
              <li><strong className="text-stone-200">Mode Membaca Imersif:</strong> Layar penuh tanpa distraksi dengan tema warna kertas (Sepia, Midnight, Rain Slate) dan pilihan font novel.</li>
              <li><strong className="text-stone-200">Keystroke Mesin Tik:</strong> Efek suara tuts mekanik lembut saat mengetik untuk sensasi menulis yang memuaskan.</li>
              <li><strong className="text-stone-200">Pengatur Waktu Tidur:</strong> Musik akan meredup perlahan sesuai waktu yang kamu tentukan.</li>
              <li><strong className="text-stone-200">Penyimpanan Lokal Mandiri:</strong> Seluruh tulisan tersimpan aman di browser kamu tanpa dikirim ke server luar.</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Mengerti & Mulai Menulis
          </button>
        </div>
      </div>
    </div>
  );
};
