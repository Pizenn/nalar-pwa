import React, { useEffect, useState, useRef } from 'react';
import { db } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';

function MonitoringCleanRoom({ goHome }) {

  const [data, setData] = useState({
    suhu: 0,
    humidity: 0,
    avg_pm25: 0,
    fuzzy: 0,
    fan: 'LOW'
  });

  const [currentAlert, setCurrentAlert] = useState(null);
  const [history, setHistory] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [filterMode, setFilterMode] = useState('hari-ini');

  const isInitialLoad = useRef(true);
  const lastAlertId = useRef(null);
  const hasAnomalyOccurred = useRef(false);

  // ==============================
  // REQUEST NOTIFICATION
  // ==============================
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // ==============================
  // FIREBASE REALTIME
  // ==============================
  useEffect(() => {

    // STATUS KONEKSI FIREBASE
    const connectedRef = ref(db, '.info/connected');

    const unsubscribeConnected = onValue(
      connectedRef,
      (snap) => {
        setIsOnline(snap.val() === true);
      }
    );

    // DATA CLEAN ROOM
    const monitoringRef = ref(db, 'cleanroom/data');

    const unsubscribeMonitoring = onValue(
      monitoringRef,
      (snapshot) => {

        if (snapshot.exists()) {

          const payload = snapshot.val();

          setData(payload);

          // ==============================
          // CEK ANOMALI
          // ==============================
          if (
            payload.suhu > 30 ||
            payload.avg_pm25 > 40
          ) {

            const newAlert = {
              id: `${Date.now()}`,
              waktu: new Date().toLocaleTimeString('id-ID'),
              tanggal: new Date().toLocaleDateString('id-ID'),
              suhu: payload.suhu,
              humidity: payload.humidity,
              pm25: payload.avg_pm25,
              fuzzy: payload.fuzzy,
              fan: payload.fan
            };

            // ALERT TERBARU
            setCurrentAlert(newAlert);

            // SIMPAN HISTORY SEKALI
            if (!hasAnomalyOccurred.current) {

              hasAnomalyOccurred.current = true;

              setHistory((prev) => [
                newAlert,
                ...prev
              ]);
            }

            // HINDARI DUPLIKAT ALERT
            if (
              !isInitialLoad.current &&
              newAlert.id !== lastAlertId.current
            ) {

              lastAlertId.current = newAlert.id;

              // ==============================
              // PUSH NOTIFICATION PWA
              // ==============================
              if (
                'Notification' in window &&
                Notification.permission === 'granted' &&
                navigator.serviceWorker
              ) {

                navigator.serviceWorker.ready.then(
                  (registration) => {

                    registration.showNotification(
                      '⚠️ AIR ALERT TERDETEKSI!',
                      {
                        body:
                          `Suhu ${Number(payload.suhu).toFixed(1)}°C | ` +
                          `PM2.5 ${Number(payload.avg_pm25).toFixed(0)}`,

                        icon: '/pwa-192x192.png',
                        vibrate: [200, 100, 200],
                        tag: 'cleanroom-alert'
                      }
                    );
                  }
                );
              }

              // ==============================
              // SWEET ALERT
              // ==============================
              const statusSuhu =
                payload.suhu > 30
                  ? 'PANAS'
                  : payload.suhu < 24
                  ? 'DINGIN'
                  : 'NORMAL';

              const warna =
                payload.suhu > 30
                  ? '#d33'
                  : '#3085d6';

              Swal.fire({
                title: '⚠️ Peringatan Anomali!',
                html: `
                  <div style="font-size:1.1em; text-align:left;">
                    <p>
                      Status Suhu:
                      <b style="color:${warna};">
                        ${statusSuhu}
                      </b>
                    </p>

                    <p>
                      Suhu:
                      <b>
                        ${Number(payload.suhu).toFixed(1)}°C
                      </b>
                    </p>

                    <p>
                      PM2.5:
                      <b>
                        ${Number(payload.avg_pm25).toFixed(0)}
                      </b>
                    </p>

                    <p>
                      Waktu:
                      ${newAlert.waktu}
                    </p>
                  </div>
                `,
                icon:
                  payload.suhu > 30
                    ? 'warning'
                    : 'info',

                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 6000,
                timerProgressBar: true
              });
            }

          } else {

            // RESET FLAG SAAT NORMAL
            hasAnomalyOccurred.current = false;
          }
        }

        isInitialLoad.current = false;
      }
    );

    return () => {
      unsubscribeConnected();
      unsubscribeMonitoring();
    };

  }, []);

  // ==============================
  // STATUS
  // ==============================
  const suhuStatus =
    data.suhu > 30
      ? 'PANAS'
      : data.suhu < 24
      ? 'DINGIN'
      : 'NORMAL';

  const pmStatus =
    data.avg_pm25 > 40
      ? 'KOTOR'
      : data.avg_pm25 > 20
      ? 'SEDANG'
      : 'BERSIH';

  // ==============================
  // FILTER HISTORY
  // ==============================
  const alertsToday = history.filter(
    item =>
      item.tanggal ===
      new Date().toLocaleDateString('id-ID')
  ).length;

  const filteredHistory =
    filterMode === 'hari-ini'
      ? history.filter(
          item =>
            item.tanggal ===
            new Date().toLocaleDateString('id-ID')
        )
      : history;

  // ==============================
  // CARD COMPONENT
  // ==============================
  const Card = ({
    title,
    value,
    icon,
    color,
    unit,
    status
  }) => (

    <div className="bg-white rounded-3xl p-6 shadow-sm border">

      <div className="flex justify-between mb-5">

        <div>
          <p className="text-sm text-gray-400 font-bold">
            {title}
          </p>

          <h2 className="text-5xl font-black text-slate-800 mt-2">
            {value}
            <span className="text-2xl">
              {unit}
            </span>
          </h2>
        </div>

        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon icon={icon} width="28" />
        </div>

      </div>

      {status && (
        <div className="text-sm font-bold text-gray-500">
          STATUS : {status}
        </div>
      )}

    </div>
  );

  return (

    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          <button
            onClick={goHome}
            className="flex items-center gap-2 text-gray-600 font-semibold hover:text-blue-600 transition-colors"
          >
            <Icon icon="lucide:arrow-left" width="20" />
            Kembali
          </button>

          <div
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
              isOnline
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                isOnline
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            ></span>

            {isOnline
              ? 'FIREBASE CONNECTED'
              : 'DISCONNECTED'}
          </div>
        </div>

        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800">
            SMART CLEAN ROOM
          </h1>

          <p className="text-gray-500 mt-2">
            Firebase + React Dashboard
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">

            <div className="p-4 bg-rose-50 rounded-xl text-rose-500">
              <Icon icon="lucide:alert-circle" width="32" />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Alert Hari Ini
              </p>

              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-extrabold text-gray-800">
                  {alertsToday}
                </p>

                <p className="text-sm font-medium text-gray-400">
                  kasus
                </p>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">

            <div className="p-4 bg-blue-50 rounded-xl text-blue-500">
              <Icon icon="lucide:archive" width="32" />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Riwayat Tersimpan
              </p>

              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-extrabold text-gray-800">
                  {history.length}
                </p>

                <p className="text-sm font-medium text-gray-400">
                  data
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

          <Card
            title="SUHU"
            value={Number(data.suhu).toFixed(1)}
            unit="°C"
            icon="lucide:thermometer"
            color="bg-cyan-100 text-cyan-600"
            status={suhuStatus}
          />

          <Card
            title="HUMIDITY"
            value={Number(data.humidity).toFixed(0)}
            unit="%"
            icon="lucide:droplets"
            color="bg-blue-100 text-blue-600"
          />

          <Card
            title="AVG PM2.5"
            value={Number(data.avg_pm25).toFixed(0)}
            unit=""
            icon="lucide:wind"
            color="bg-rose-100 text-rose-600"
            status={pmStatus}
          />

          <Card
            title="FAN"
            value={data.fan}
            unit=""
            icon="lucide:fan"
            color="bg-cyan-100 text-cyan-600"
          />

        </div>

      </div>
    </div>
  );
}

export default MonitoringCleanRoom;