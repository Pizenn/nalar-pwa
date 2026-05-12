import { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../config/firebase"; 
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ApdDashboard() {
  const [historyHariIni, setHistoryHariIni] = useState([]);
  const [semuaRiwayat, setSemuaRiwayat] = useState([]);

  useEffect(() => {
    const historyRef = ref(db, "history");

    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const converted = Object.keys(data)
        .map((key) => {
          const item = data[key];
          const isAman =
            item.masker === true &&
            item.jas_lab === true &&
            item.sarung_tangan === true;

          if (isAman) return null;

          const pelanggaran = [];
          if (item.pelanggaran_masker) pelanggaran.push("Masker");
          if (item.pelanggaran_jas_lab) pelanggaran.push("Jas Lab");
          if (item.pelanggaran_sarung_tangan) pelanggaran.push("Sarung Tangan");

          const dateObj = item.timestamp ? new Date(item.timestamp) : null;
          const waktu = dateObj ? dateObj.toLocaleDateString("id-ID") : "-";
          const jam = dateObj
            ? dateObj.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-";

          return {
            id: key,
            ...item,
            pelanggaran,
            waktu,
            jam,
            rawDate: dateObj, // Digunakan untuk filter grafik
          };
        })
        .filter(Boolean);

      const listSorted = [...converted].reverse();
      setSemuaRiwayat(listSorted);

      const today = new Date().toISOString().split("T")[0];
      const filteredToday = listSorted.filter((item) => {
        const itemDate = item.timestamp
          ? new Date(item.timestamp).toISOString().split("T")[0]
          : null;
        return itemDate === today;
      });
      setHistoryHariIni(filteredToday);
    });

    return () => unsubscribe();
  }, []);

  // --- LOGIKA DATA GRAFIK: 30 HARI TERAKHIR ---
  const dataGrafikSebulan = useMemo(() => {
    const dataMap = {};
    const hariIni = new Date();

    // 1. Inisialisasi 30 hari terakhir dengan nilai 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(hariIni.getDate() - i);
      const label = d.toLocaleDateString("id-ID", { day: '2-digit', month: 'short' });
      const keyFull = d.toLocaleDateString("id-ID");
      dataMap[keyFull] = { label, jumlah: 0 };
    }

    // 2. Isi data dari riwayat jika masuk dalam rentang
    semuaRiwayat.forEach((item) => {
      if (dataMap[item.waktu]) {
        dataMap[item.waktu].jumlah += 1;
      }
    });

    // 3. Ubah objek ke array untuk Recharts
    return Object.values(dataMap);
  }, [semuaRiwayat]);

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER & STATS CARD (Sama seperti sebelumnya) */}
        <div className="mb-10">
          <h1 className="text-5xl font-black text-slate-800">NALAR Record</h1>
          <p className="text-slate-500 text-xl mt-3">Statistik Pelanggaran 30 Hari Terakhir</p>
        </div>

        {/* STATS CARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-3xl p-7 flex items-center gap-6 shadow-sm border border-white">
                <div className="w-20 h-20 bg-red-50 flex items-center justify-center text-4xl rounded-3xl">⚠️</div>
                <div>
                    <p className="text-slate-400 font-bold text-sm uppercase">Hari Ini</p>
                    <h2 className="text-6xl font-black text-slate-800">{historyHariIni.length}</h2>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-7 flex items-center gap-6 shadow-sm border border-white">
                <div className="w-20 h-20 bg-blue-50 flex items-center justify-center text-4xl rounded-3xl">📁</div>
                <div>
                    <p className="text-slate-400 font-bold text-sm uppercase">Total Riwayat</p>
                    <h2 className="text-6xl font-black text-slate-800">{semuaRiwayat.length}</h2>
                </div>
            </div>
        </div>

        {/* GRAFIK SEBULAN TERAKHIR */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-3xl font-black">Tren 30 Hari Terakhir</h2>
            <span className="text-slate-400 font-medium">Statistik kumulatif</span>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataGrafikSebulan}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10}}
                  minTickGap={20} // Menghindari teks tumpang tindih
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '15px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="jumlah" 
                  name="Jumlah Pelanggaran"
                  stroke="#ef4444" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorTrend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIWAYAT (Tetap tampil di bawah grafik) */}
        <div className="grid lg:grid-cols-3 gap-10">
            {/* Kolom Kiri: Pelanggaran Hari Ini */}
            <div className="lg:col-span-1">
                <h2 className="text-2xl font-black mb-6">Hari Ini</h2>
                <div className="space-y-4">
                    {historyHariIni.length > 0 ? (
                        historyHariIni.map((item) => (
                            <div key={item.id} className="bg-white rounded-3xl p-6 border shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.jam}</span>
                                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold">PELANGGARAN</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {item.pelanggaran.map((p, i) => (
                                        <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-xs font-bold">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-emerald-50 text-emerald-600 p-6 rounded-3xl border border-emerald-100 font-bold text-center">
                            ✅ Semua APD Lengkap
                        </div>
                    )}
                </div>
            </div>

            {/* Kolom Kanan: Tabel Riwayat Lengkap */}
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-black mb-6">Log Riwayat</h2>
                <div className="bg-white rounded-[2rem] overflow-hidden border shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="p-6 text-slate-500 font-bold text-sm uppercase tracking-widest">Waktu</th>
                                <th className="p-6 text-slate-500 font-bold text-sm uppercase tracking-widest">Detail Pelanggaran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {semuaRiwayat.map((item) => (
                                <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-all">
                                    <td className="p-6">
                                        <p className="font-bold text-slate-700">{item.waktu}</p>
                                        <p className="text-xs text-slate-400">{item.jam}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-wrap gap-1">
                                            {item.pelanggaran.map((p, i) => (
                                                <span key={i} className="text-red-500 font-medium text-sm">
                                                    #{p}{i !== item.pelanggaran.length - 1 ? ',' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}