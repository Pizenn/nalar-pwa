import React, { useState } from 'react';
import Home from './components/Home';
import SkriningKesehatan from './components/SkriningKesehatan';
import PengukuranObat from './components/PengukuranObat';
import DeteksiAPD from './components/DeteksiAPD';
import MonitoringLingkungan from './components/MonitoringLingkungan';

function App() {
  // State untuk melacak halaman mana yang sedang aktif
  const [currentScreen, setCurrentScreen] = useState('home');

  // Fungsi untuk me-render komponen berdasarkan state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home setScreen={setCurrentScreen} />;
      case 'skrining':
        return <SkriningKesehatan goHome={() => setCurrentScreen('home')} />;
      case 'obat':
        return <PengukuranObat goHome={() => setCurrentScreen('home')} />;
      case 'apd':
        return <DeteksiAPD goHome={() => setCurrentScreen('home')} />;
      case 'lingkungan':
        return <MonitoringLingkungan goHome={() => setCurrentScreen('home')} />;
      default:
        return <Home setScreen={setCurrentScreen} />;
    }
  };

  return (
    // Background utama sekarang menggunakan abu-abu sangat muda (modern clean look)
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 md:p-10 font-sans selection:bg-blue-200">
      {renderScreen()}
      
      {/* Footer Utama yang muncul di semua halaman */}
      <footer className="mt-16 text-center text-gray-400 text-xs font-medium">
        &copy; {new Date().getFullYear()} SMART Station - Universitas Andalas
      </footer>
    </div>
  );
}

export default App;