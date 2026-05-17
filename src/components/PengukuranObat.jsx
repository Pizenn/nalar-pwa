import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db_obat } from '../config/firebase_obat';
import { Icon } from '@iconify/react';

export default function Dashboard({goHome}) {
  // ================= ONLINE STATUS =================
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ================= HISTORY =================
  const [history, setHistory] = useState([]);

  // ================= CALIBRATION =================
  const [calibration, setCalibration] = useState({
    ketebalan_pixel_to_mm: '',
    diameter_pixel_to_mm: ''
  });

  const [activeTab, setActiveTab] = useState('today');
  const [showCalibration, setShowCalibration] = useState(false);

  // =====================================================
  // REALTIME HISTORY
  // =====================================================
  useEffect(() => {
    const historyRef = ref(db_obat, 'history');

    const unsubscribe = onValue(historyRef, snapshot => {
      const data = snapshot.val();

      if (!data) {
        setHistory([]);
        return;
      }

      const list = Object.values(data).map(item => {
        const dateObj = new Date(item.timestamp * 1000);

        return {
          date: dateObj.toISOString().split('T')[0],
          time: dateObj.toTimeString().split(' ')[0],
          ketebalan: item.ketebalan,
          diameter: item.diameter,
          timestamp: item.timestamp
        };
      });

      setHistory(list.reverse());
    });

    return () => unsubscribe();
  }, []);

  // =====================================================
  // REALTIME CALIBRATION
  // =====================================================
  useEffect(() => {
    const calibRef = ref(db_obat, 'calibration');

    const unsubscribe = onValue(calibRef, snapshot => {
      const data = snapshot.val();

      if (data) {
        setCalibration({
          ketebalan_pixel_to_mm: data.ketebalan_pixel_to_mm ?? '',
          diameter_pixel_to_mm: data.diameter_pixel_to_mm ?? ''
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // =====================================================
  // SAVE CALIBRATION
  // =====================================================
  const saveCalibration = async () => {
    if (!calibration.ketebalan_pixel_to_mm || !calibration.diameter_pixel_to_mm) {
      alert('⚠️ Harap isi semua field kalibrasi');
      return;
    }

    const calibRef = ref(db_obat, 'calibration');

    await set(calibRef, {
      ketebalan_pixel_to_mm: Number(calibration.ketebalan_pixel_to_mm),
      diameter_pixel_to_mm: Number(calibration.diameter_pixel_to_mm)
    });

    alert('✅ Kalibrasi Berhasil Diperbarui');
    setShowCalibration(false);
  };

  // =====================================================
  // ONLINE OFFLINE
  // =====================================================
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener('online', online);
    window.addEventListener('offline', offline);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  // =====================================================
  // SUMMARY
  // =====================================================
  const today = new Date().toISOString().split('T')[0];
  const todayHistory = history.filter(h => h.date === today);
  const displayHistory = activeTab === 'today' ? todayHistory : history;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-slate-200">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button onClick={goHome} className="p-2 hover:bg-slate-100 rounded-lg transition flex-shrink-0">
                <Icon icon="mdi:arrow-left" width="20" height="20" className="text-slate-600 sm:w-6 sm:h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">Tablet Measurement</h1>
                <p className="text-xs sm:text-sm text-slate-500 truncate">Dashboard Pengukuran Obat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* Pengukuran Hari Ini */}
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide truncate">Pengukuran Hari Ini</p>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1 sm:mt-2">{todayHistory.length}</p>
                <p className="text-xs text-slate-500 mt-1">data pengukuran</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl flex-shrink-0">
                <Icon icon="mdi:calendar" width="24" height="24" className="text-blue-600 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          {/* Total Data */}
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide truncate">Total Data</p>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1 sm:mt-2">{history.length}</p>
                <p className="text-xs text-slate-500 mt-1">semua pengukuran</p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl flex-shrink-0">
                <Icon icon="mdi:database" width="24" height="24" className="text-purple-600 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= CALIBRATION BUTTON ================= */}
        {!showCalibration && (
          <button
            onClick={() => setShowCalibration(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all hover:shadow-lg mb-4 sm:mb-6 md:mb-8"
          >
            <Icon icon="mdi:cog" width="18" height="18" className="sm:w-5 sm:h-5" />
            Atur Kalibrasi
          </button>
        )}

        {/* ================= CALIBRATION SECTION ================= */}
        {showCalibration && (
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-slate-200 mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="mdi:cog" width="20" height="20" className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
                <span className="truncate">Kalibrasi Sistem</span>
              </h2>
              <button onClick={() => setShowCalibration(false)} className="text-slate-500 hover:text-slate-700 p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition flex-shrink-0">
                <Icon icon="mdi:close" width="20" height="20" className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Ketebalan (Pixel → mm)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Masukkan nilai konversi"
                  value={calibration.ketebalan_pixel_to_mm}
                  onChange={e =>
                    setCalibration({
                      ...calibration,
                      ketebalan_pixel_to_mm: e.target.value
                    })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Diameter (Pixel → mm)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Masukkan nilai konversi"
                  value={calibration.diameter_pixel_to_mm}
                  onChange={e =>
                    setCalibration({
                      ...calibration,
                      diameter_pixel_to_mm: e.target.value
                    })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 text-sm transition"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={saveCalibration}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-colors order-2 sm:order-1"
              >
                <Icon icon="mdi:content-save" width="18" height="18" className="sm:w-5 sm:h-5" />
                Simpan
              </button>
              <button
                onClick={() => setShowCalibration(false)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-slate-300 text-slate-700 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-slate-50 transition-colors order-1 sm:order-2"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* ================= HISTORY SECTION ================= */}
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Riwayat Pengukuran</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Total: <span className="font-semibold">{displayHistory.length}</span> data
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('today')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                    activeTab === 'today' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                    activeTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua Data
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {displayHistory.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Icon icon="mdi:inbox-multiple" width="48" height="48" className="text-slate-300 mx-auto mb-3 sm:mb-4 sm:w-16 sm:h-16" />
                <p className="text-sm sm:text-base text-slate-500 font-medium">Tidak ada data pengukuran</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Waktu</th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Ketebalan</th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Diameter</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayHistory.map((item, i) => (
                        <tr key={i} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:calendar" width="18" height="18" className="text-slate-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-slate-900">{item.date}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:clock" width="18" height="18" className="text-slate-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-slate-900">{item.time}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">{item.ketebalan} mm</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 whitespace-nowrap">{item.diameter} mm</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {displayHistory.map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Icon icon="mdi:calendar" width="16" height="16" className="text-slate-400" />
                            <p className="text-xs font-semibold text-slate-500">Tanggal</p>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{item.date}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Icon icon="mdi:clock" width="16" height="16" className="text-slate-400" />
                            <p className="text-xs font-semibold text-slate-500">Waktu</p>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{item.time}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2">Ketebalan</p>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{item.ketebalan} mm</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2">Diameter</p>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">{item.diameter} mm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
