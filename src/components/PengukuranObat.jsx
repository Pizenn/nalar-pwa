// Contoh isi untuk PengukuranObat.jsx
import { Icon } from '@iconify/react';
import React from 'react';

function PengukuranObat({ goHome }) {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <button onClick={goHome} className="text-gray-500 hover:text-blue-600 mb-8 flex items-center gap-2 font-medium">
        <span>&larr;</span> Kembali
      </button>
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="text-5xl mb-4 flex justify-center">
            <Icon icon="healthicons:medicines-outline" width="48" height="48" className="text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pengukuran Obat</h1>
        <p className="text-gray-500">Modul ini sedang dalam tahap pengembangan (Under Construction).</p>
      </div>
    </div>
  );
}
export default PengukuranObat;