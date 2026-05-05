import React from 'react';
// 1. Import komponen Icon dari Iconify
import { Icon } from '@iconify/react';

function Home({ setScreen }) {
  const menus = [
    // 2. Ganti emoji dengan nama ikon dari Iconify
    { id: 'skrining', title: 'Skrining Kesehatan', desc: 'Pemantauan suhu tubuh & deteksi anomali', icon: 'fluent:temperature-24-regular', color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'obat', title: 'Pengukuran Obat', desc: 'Sistem Pengukuran Dimensi Obat Otomatis', icon: 'healthicons:medicines-outline', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'apd', title: 'Deteksi APD', desc: 'Pengecekan kelengkapan atribut lab', icon: 'mdi:safety-goggles', color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'lingkungan', title: 'Monitoring Lingkungan', desc: 'Suhu, kelembapan, dan gas ruangan', icon: 'carbon:smoke', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">SMART <span className="text-blue-600">Station</span></h1>
        <p className="text-gray-500 mt-2">Pusat Kendali Asisten Laboratorium</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setScreen(menu.id)}
            className="group flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all text-left"
          >
            <div className={`p-4 rounded-xl ${menu.bg} ${menu.color} group-hover:scale-110 transition-transform`}>
              {/* 3. Panggil komponen Icon di sini, sesuaikan ukurannya */}
              <Icon icon={menu.icon} width="32" height="32" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{menu.title}</h2>
              <p className="text-gray-500 text-sm">{menu.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;