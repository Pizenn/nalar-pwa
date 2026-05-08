import React, { useEffect, useState, useRef } from 'react';
import { db } from '../config/firebase'; 
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';

// --- FUNGSI EKSTRAKSI WAKTU DARI FIREBASE ID ---
const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

const getTimestampFromId = (firebaseId) => {
  if (!firebaseId || firebaseId.length < 8) return 0;
  let time = 0;
  for (let i = 0; i < 8; i++) {
    time = time * 64 + PUSH_CHARS.indexOf(firebaseId.charAt(i));
  }
  return time;
};

const checkIsToday = (firebaseId) => {
  const time = getTimestampFromId(firebaseId);
  if (!time) return false;
  const itemDate = new Date(time);
  const today = new Date();
  
  return itemDate.getDate() === today.getDate() &&
         itemDate.getMonth() === today.getMonth() &&
         itemDate.getFullYear() === today.getFullYear();
};

const formatTanggalLengkap = (firebaseId) => {
  const time = getTimestampFromId(firebaseId);
  if (!time) return 'Tanggal tidak diketahui';
  const date = new Date(time);
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  return `${hari[date.getDay()]}, ${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
};

function SkriningKesehatan({ goHome }) {
  const [anomalies, setAnomalies] = useState([]);
  const [isSystemActive, setIsSystemActive] = useState(false); 
  const [filterMode, setFilterMode] = useState('hari-ini'); 
  
  const isInitialLoad = useRef(true);
  const lastAnomalyId = useRef(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // --- 1. LISTENER KONEKSI REAL-TIME ---
  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        setIsSystemActive(true);
      } else {
        setIsSystemActive(false);
      }
    });

    return () => unsubscribeConnected();
  }, []);

  // --- 2. LISTENER DATA ANOMALI ---
  useEffect(() => {
    const anomalyRef = ref(db, 'anomali');
    const latestAnomaliesQuery = query(anomalyRef, limitToLast(50));

    const unsubscribeData = onValue(latestAnomaliesQuery, (snapshot) => {
      if (snapshot.exists()) {
        const list = [];
        snapshot.forEach((childSnapshot) => {
          list.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        list.reverse();
        setAnomalies(list);
        const dataTerbaru = list[0];

        if (!isInitialLoad.current) {
          if (dataTerbaru && dataTerbaru.id !== lastAnomalyId.current) {
            lastAnomalyId.current = dataTerbaru.id; 

            if ("Notification" in window && Notification.permission === "granted" && navigator.serviceWorker) {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification("⚠️ ANOMALI SUHU TERDETEKSI!", {
                  // PERUBAHAN 1: Format suhu di pop-up notifikasi
                  body: `Peringatan: Suhu ${Number(dataTerbaru.suhu).toFixed(1)}°C terdeteksi pada ${dataTerbaru.waktu}.`,
                  icon: "/pwa-192x192.png", 
                  vibrate: [200, 100, 200], 
                  tag: "anomali-alert"
                });
              });
            }
          let iconJenis = dataTerbaru.status === 'HIPOTERMIA' ? 'info' : 'warning';
            let warnaTombol = dataTerbaru.status === 'HIPOTERMIA' ? '#3085d6' : '#d33';
            let statusText = dataTerbaru.status || 'TIDAK NORMAL';

            Swal.fire({
              title: '⚠️ Peringatan Anomali!',
              html: `
                <div style="font-size: 1.1em; text-align: left; margin-top: 5px;">
                  Status: <b style="color: ${warnaTombol};">${statusText}</b><br>
                  Suhu Terbaca: <b>${Number(dataTerbaru.suhu).toFixed(1)} °C</b><br>
                  Waktu: ${dataTerbaru.waktu}
                </div>
              `,
              icon: iconJenis,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 8000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });
            // --- AKHIR TAMBAHAN SWEETALERT2 ---
          }
        } else {
          isInitialLoad.current = false;
          if (list.length > 0) lastAnomalyId.current = dataTerbaru.id;
        }
      } else {
        setAnomalies([]); 
      }
    });

    return () => unsubscribeData();
  }, []);

  const anomaliesTodayCount = anomalies.filter(item => checkIsToday(item.id)).length;
  const filteredAnomalies = filterMode === 'hari-ini' 
    ? anomalies.filter(item => checkIsToday(item.id)) 
    : anomalies;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <button onClick={goHome} className="text-gray-500 hover:text-blue-600 flex items-center gap-2 font-medium transition-colors">
          <Icon icon="lucide:arrow-left" width="20" height="20" /> Kembali
        </button>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-colors ${isSystemActive ? 'bg-white border-gray-100' : 'bg-red-50 border-red-200'}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${isSystemActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className={`text-xs font-bold tracking-wide ${isSystemActive ? 'text-gray-600' : 'text-red-600'}`}>
            {isSystemActive ? 'ONLINE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">NALAR Record</h1>
        <p className="text-gray-500 mt-1">Pemantauan suhu tubuh otomatis dari Station 01</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-rose-50 rounded-xl text-rose-500">
            {/* Mengganti Emoji Kalender */}
            <Icon icon="lucide:calendar-days" width="32" height="32" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Anomali Hari Ini</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-gray-800">{anomaliesTodayCount}</p>
              <p className="text-sm font-medium text-gray-400">kasus</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 rounded-xl text-blue-500">
            {/* Mengganti Emoji Laci */}
            <Icon icon="lucide:archive" width="32" height="32" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Riwayat Tersimpan</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-gray-800">{anomalies.length}</p>
              <p className="text-sm font-medium text-gray-400">data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b pb-4">
        <h2 className="text-lg font-bold text-gray-700">Riwayat Peringatan</h2>
        
        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
          <button 
            onClick={() => setFilterMode('hari-ini')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${filterMode === 'hari-ini' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Hari Ini
          </button>
          <button 
            onClick={() => setFilterMode('semua')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${filterMode === 'semua' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Semua Riwayat
          </button>
        </div>
      </div>

      {filteredAnomalies.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 p-12 rounded-2xl text-center">
          <p className="text-gray-500 font-medium">Tidak ada data anomali untuk filter yang dipilih.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAnomalies.map((item) => {
            const isToday = checkIsToday(item.id);
            return (
              <div key={item.id} className={`bg-white border-l-4 p-5 rounded-xl shadow-sm transition-all hover:-translate-y-1 ${isToday ? 'border-rose-500' : 'border-gray-300'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className={`font-bold text-xl ${isToday ? 'text-gray-800' : 'text-gray-400'}`}>
                    {Number(item.suhu).toFixed(1)}°C
                  </span>
                  {isToday && <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-full">HARI INI</span>}
                </div>
                
                <div className="text-sm space-y-2">
                  <p className="flex items-center gap-2">
                    {/* Mengganti Emoji Kalender kecil */}
                    <Icon icon="lucide:calendar" className="text-blue-500" width="16" height="16" />
                    <span className="font-medium text-gray-400">
                      {formatTanggalLengkap(item.id)}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    {/* Mengganti Emoji Jam */}
                    <Icon icon="lucide:clock" className="text-amber-500" width="16" height="16" />
                    <span className="font-medium text-gray-400">
                      {item.waktu || 'Waktu tidak tersedia'}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-400">
                    {/* Mengganti Emoji Lokasi */}
                    <Icon icon="lucide:map-pin" className="text-emerald-500" width="16" height="16" />
                    Station 01 (Pintu Masuk)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SkriningKesehatan;