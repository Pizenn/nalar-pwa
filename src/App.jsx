import React, { useEffect, useState, useRef } from 'react';
import { db } from './config/firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';

function App() {
  const [anomalies, setAnomalies] = useState([]);
  const [isSystemActive, setIsSystemActive] = useState(true);
  
  const isInitialLoad = useRef(true); 
  const lastAnomalyId = useRef(null);

  // 1. Meminta Izin Notifikasi Sistem
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // 2. Listener Firebase
  useEffect(() => {
    const anomalyRef = ref(db, 'anomali');
    const latestAnomaliesQuery = query(anomalyRef, limitToLast(10));

    const unsubscribe = onValue(latestAnomaliesQuery, (snapshot) => {
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

        // LOGIKA NOTIFIKASI ANTI-SPAM & PWA COMPATIBLE
        if (!isInitialLoad.current) {
          if (dataTerbaru && dataTerbaru.id !== lastAnomalyId.current) {
            
            lastAnomalyId.current = dataTerbaru.id; 

            // Membunyikan Suara (Mungkin diblokir HP jika layar mati, tapi kita coba)
            const audio = new Audio('https://actions.google.com/google_terminal/beep.mp3');
            audio.play().catch(e => console.log("Menunggu interaksi user untuk suara"));

            // Memunculkan Pop-up Notifikasi via SERVICE WORKER (Cara PWA Asli)
            if ("Notification" in window && Notification.permission === "granted") {
              if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then((registration) => {
                  registration.showNotification("⚠️ ANOMALI SUHU TERDETEKSI!", {
                    body: `Peringatan: Suhu ${dataTerbaru.suhu}°C terdeteksi pada ${dataTerbaru.waktu}. Segera cek Station 01!`,
                    icon: "/pwa-192x192.png", 
                    vibrate: [200, 100, 200, 100, 200], // Pola getar SOS
                    tag: "anomali-alert", // Mencegah notifikasi menumpuk panjang
                    requireInteraction: true // Notifikasi tidak akan hilang sampai diklik
                  });
                }).catch((err) => {
                  console.error("Service Worker tidak siap: ", err);
                  // Fallback jika Service worker gagal
                  new Notification("⚠️ ANOMALI SUHU!", { body: `Suhu ${dataTerbaru.suhu}°C` });
                });
              } else {
                // Fallback untuk browser laptop biasa
                new Notification("⚠️ ANOMALI SUHU TERDETEKSI!", {
                  body: `Peringatan: Suhu ${dataTerbaru.suhu}°C terdeteksi pada ${dataTerbaru.waktu}. Segera cek Station 01!`,
                  icon: "/pwa-192x192.png"
                });
              }
            }
          }
        } else {
          isInitialLoad.current = false;
          if (list.length > 0) {
            lastAnomalyId.current = dataTerbaru.id;
          }
        }
      } else {
        setAnomalies([]); 
      }
    });

    return () => unsubscribe();
  }, []);

  // FUNGSI UNTUK MEMASTIKAN IZIN NOTIFIKASI SECARA MANUAL
  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          alert("Notifikasi berhasil diaktifkan! Sistem siap menerima peringatan.");
        } else {
          alert("Izin notifikasi ditolak. Mohon izinkan melalui pengaturan browser.");
        }
      });
    } else {
      alert("Browser/Perangkat ini tidak mendukung notifikasi web.");
    }
  };

  return (
    <div className="min-h-screen bg-navy-medis text-white p-4 font-sans flex flex-col items-center">
      <header className="w-full max-w-4xl mb-8 border-b border-gray-700 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-cyan-400 tracking-wider">NALAR Dashboard</h1>
          <p className="text-gray-400 text-sm">Dashboard Asisten Lab - Pemantauan Praktikan</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={requestNotificationPermission}
            className="text-xs bg-cyan-700 hover:bg-cyan-600 px-3 py-1 rounded transition-colors shadow-lg"
          >
            🔔 Izinkan Notifikasi
          </button>
          
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-600 shadow-lg">
            <span className={`h-3 w-3 rounded-full ${isSystemActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-mono">{isSystemActive ? 'CONNECTED' : 'OFFLINE'}</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          ⚠️ Daftar Anomali Terdeteksi
        </h2>

        {anomalies.length === 0 ? (
          <div className="bg-gray-800/30 border-2 border-dashed border-gray-700 p-12 rounded-2xl text-center">
            <p className="text-gray-500 italic">Belum ada anomali terdeteksi saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((item) => (
              <div key={item.id} className="bg-white border-l-8 border-merah-medis p-5 rounded-xl shadow-lg transform transition-all hover:scale-[1.02]">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-navy-medis font-bold text-lg">Suhu: {item.suhu}°C</span>
                  <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded tracking-tighter">
                    ID: {item.id.substring(1, 8)}
                  </span>
                </div>
                <div className="text-gray-500 text-sm flex flex-col gap-1">
                  <p>📅 Waktu: {item.waktu || 'Baru saja'}</p>
                  <p>📍 Lokasi: Station 01 (Lab)</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-auto pt-8 pb-4 text-gray-600 text-xs text-center">
        &copy; 2026 NALAR Project
      </footer>
    </div>
  );
}

export default App;