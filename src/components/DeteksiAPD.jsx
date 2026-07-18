import { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db_apd } from "../config/firebase_apd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ApdDashboard({ goHome }) {
  const [historyHariIni, setHistoryHariIni] = useState([]);
  const [semuaRiwayat, setSemuaRiwayat] = useState([]);
  const [activeTab, setActiveTab] = useState("hari_ini");

  useEffect(() => {
    const historyRef = ref(db_apd, "history");

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

          const tanggalPanjang = dateObj
            ? dateObj.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "-";

          const jam = dateObj
            ? `${String(dateObj.getHours()).padStart(2, "0")}:${String(
                dateObj.getMinutes(),
              ).padStart(2, "0")}:${String(dateObj.getSeconds()).padStart(
                2,
                "0",
              )}`
            : "-";

          return {
            id: key,
            ...item,
            pelanggaran,
            waktu,
            tanggalPanjang,
            jam,
            rawDate: dateObj,
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

  const dataGrafikSebulan = useMemo(() => {
    const dataMap = {};
    const hariIni = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(hariIni.getDate() - i);
      const label = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      const keyFull = d.toLocaleDateString("id-ID");
      dataMap[keyFull] = {
        label,
        jumlah: 0,
        masker: 0,
        jas_lab: 0,
        sarung_tangan: 0,
      };
    }

    semuaRiwayat.forEach((item) => {
      if (dataMap[item.waktu]) {
        dataMap[item.waktu].jumlah += 1;
        if (item.pelanggaran_masker) dataMap[item.waktu].masker += 1;
        if (item.pelanggaran_jas_lab) dataMap[item.waktu].jas_lab += 1;
        if (item.pelanggaran_sarung_tangan)
          dataMap[item.waktu].sarung_tangan += 1;
      }
    });

    return Object.values(dataMap);
  }, [semuaRiwayat]);

  const displayedHistory =
    activeTab === "hari_ini" ? historyHariIni : semuaRiwayat;

  const rekapApd = useMemo(() => {
    let masker = 0;
    let jasLab = 0;
    let sarungTangan = 0;

    displayedHistory.forEach((item) => {
      if (item.pelanggaran_masker) masker += 1;
      if (item.pelanggaran_jas_lab) jasLab += 1;
      if (item.pelanggaran_sarung_tangan) sarungTangan += 1;
    });

    return { masker, jasLab, sarungTangan };
  }, [displayedHistory]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100">
      {/* Navbar / Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center">
          <button
            onClick={goHome}
            className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors text-sm"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke Beranda
          </button>
        </div>
      </div>

      <div className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {/* HEADER & DESKRIPSI */}
          <div className="mb-10 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Deteksi APD
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              Sistem monitoring pelanggaran atribut pelindung diri berupa
              masker, jas laboratorium dan sarung tangan di Laboratorium Farmasi
              secara real-time.
            </p>
          </div>

          {/* TAB & STATS SECTION */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-200/60 pb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Ringkasan Pelanggaran
              </h2>
              <div className="bg-slate-200/50 p-1.5 rounded-xl flex gap-1 border border-slate-200/60 shadow-inner w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("hari_ini")}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    activeTab === "hari_ini"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setActiveTab("semua")}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    activeTab === "semua"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Semua Riwayat
                </button>
              </div>
            </div>

            {/* STATS CARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="group bg-white rounded-3xl p-8 flex items-center gap-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center text-3xl rounded-2xl shadow-inner z-10">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="z-10">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">
                    Kasus Tercatat (
                    {activeTab === "hari_ini" ? "Hari Ini" : "Total"})
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-5xl font-black text-slate-800">
                      {displayedHistory.length}
                    </h2>
                    <span className="text-slate-400 font-medium">Kasus</span>
                  </div>
                </div>
              </div>

              {/* Rincian APD Mini Cards */}
              <div className="grid grid-cols-3 gap-4 h-full">
                <div className="bg-white rounded-3xl p-4 flex flex-col items-center justify-center border border-slate-200/60 shadow-sm">
                  <span className="text-slate-400 text-xs font-bold uppercase mb-2 text-center">
                    Tanpa Masker
                  </span>
                  <span className="text-3xl font-black text-blue-500">
                    {rekapApd.masker}
                  </span>
                </div>
                <div className="bg-white rounded-3xl p-4 flex flex-col items-center justify-center border border-slate-200/60 shadow-sm">
                  <span className="text-slate-400 text-xs font-bold uppercase mb-2 text-center">
                    Tanpa Jas Lab
                  </span>
                  <span className="text-3xl font-black text-violet-500">
                    {rekapApd.jasLab}
                  </span>
                </div>
                <div className="bg-white rounded-3xl p-4 flex flex-col items-center justify-center border border-slate-200/60 shadow-sm">
                  <span className="text-slate-400 text-[11px] font-bold uppercase mb-2 text-center">
                    Tanpa Sarung Tangan
                  </span>
                  <span className="text-3xl font-black text-amber-500">
                    {rekapApd.sarungTangan}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DUA GRAFIK SEBULAN TERAKHIR */}
          <div className="mb-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Statistik & Tren (30 Hari Terakhir)
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Perbandingan antara total kasus pelanggaran dan rincian jenis
                  APD
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* GRAFIK 1: TOTAL PELANGGARAN */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>{" "}
                  Total Pelanggaran Harian
                </h3>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dataGrafikSebulan}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ef4444"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ef4444"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        minTickGap={30}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        allowDecimals={false}
                        dx={-10}
                      />
                      <Tooltip
                        cursor={{
                          stroke: "#cbd5e1",
                          strokeWidth: 2,
                          strokeDasharray: "4 4",
                        }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                          padding: "12px 20px",
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(4px)",
                        }}
                        itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="jumlah"
                        name="Total Kasus"
                        stroke="#ef4444"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        activeDot={{
                          r: 6,
                          fill: "#ef4444",
                          stroke: "#fff",
                          strokeWidth: 3,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GRAFIK 2: RINCIAN JENIS APD */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>{" "}
                  Rincian Berdasarkan Jenis APD
                </h3>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dataGrafikSebulan}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorMasker"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorJas"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorSarung"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        minTickGap={30}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        allowDecimals={false}
                        dx={-10}
                      />
                      <Tooltip
                        cursor={{
                          stroke: "#cbd5e1",
                          strokeWidth: 2,
                          strokeDasharray: "4 4",
                        }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                          padding: "12px 20px",
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(4px)",
                        }}
                        itemStyle={{ fontWeight: "bold" }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#475569",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="masker"
                        name="Masker"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMasker)"
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="jas_lab"
                        name="Jas Lab"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorJas)"
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="sarung_tangan"
                        name="Sarung Tangan"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSarung)"
                        stackId="1"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* RIWAYAT PERINGATAN */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Detail History (Berdasarkan{" "}
                {activeTab === "hari_ini" ? "Hari Ini" : "Semua Riwayat"})
              </h2>
            </div>

            {/* GRID KARTU RIWAYAT */}
            {displayedHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedHistory.map((item) => {
                  const isToday =
                    item.waktu === new Date().toLocaleDateString("id-ID");

                  return (
                    <div
                      key={item.id}
                      className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col gap-5"
                    >
                      {/* Aksen Garis Merah */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l-2xl"></div>

                      {/* Header Kartu: Judul & Badge */}
                      <div className="flex justify-between items-start pl-2">
                        <h3 className="text-lg font-bold text-slate-800 leading-snug">
                          {item.pelanggaran.join(", ")}
                        </h3>
                        {isToday && (
                          <span className="bg-red-50 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0 border border-red-100">
                            HARI INI
                          </span>
                        )}
                      </div>

                      {/* Detail Informasi */}
                      <div className="pl-2 space-y-3 mt-auto">
                        <div className="flex items-center gap-3 text-slate-500 text-sm">
                          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <svg
                              className="w-4 h-4 text-slate-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium truncate text-slate-600">
                            {item.tanggalPanjang}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-500 text-sm">
                          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <svg
                              className="w-4 h-4 text-slate-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <span className="font-mono text-slate-600 font-semibold">
                            {item.jam}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-500 text-sm">
                          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                            <svg
                              className="w-4 h-4 text-emerald-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium text-slate-600 truncate">
                            Lab Sediaan Padat
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty State UI
              <div className="bg-white p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                  <svg
                    className="w-10 h-10 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Semua APD Lengkap
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Tidak ada catatan pelanggaran APD. Sistem berjalan dengan
                  baik.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
