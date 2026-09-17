import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Search, LayoutDashboard, Users, Calendar, Settings, LogOut, Sparkles, Home, MapPin } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  console.log("STATUS USER SAAT INI:", user)
  
  const [properties] = useState([
    {
      id: 1,
      title: "Apartemen Rose Garden Tower A",
      location: "Jakarta Selatan",
      type: "Apartemen",
      price: "Rp 4.500.000",
      period: "bulan",
      rating: "4.9",
      status: "Tersedia",
      imageBg: "from-rose-500/10 to-pink-500/10"
    },
    {
      id: 2,
      title: "Ruko Niaga Sentra Blok B",
      location: "Tangerang",
      type: "Ruko",
      price: "Rp 35.000.000",
      period: "tahun",
      rating: "4.8",
      status: "Tersewa",
      imageBg: "from-blue-500/10 to-indigo-500/10"
    },
    {
      id: 3,
      title: "Kost Eksklusif Melati Residence",
      location: "Bandung",
      type: "Kost",
      price: "Rp 1.800.000",
      period: "bulan",
      rating: "5.0",
      status: "Tersedia",
      imageBg: "from-emerald-500/10 to-teal-500/10"
    },
    {
      id: 4,
      title: "Rumah Minimalis Cluster Dahlia",
      location: "Depok",
      price: "Rp 6.000.000",
      type: "Rumah",
      period: "bulan",
      rating: "4.7",
      status: "Perbaikan",
      imageBg: "from-amber-500/10 to-orange-500/10"
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HEADER / NAVBAR DINAMIS */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Sparkles className="h-6 w-6 text-rose-500" />
          <span className="text-xl font-bold tracking-tight text-rose-500">YukDiSewa</span>
        </div>

        <div className="hidden md:flex items-center border border-slate-300 rounded-full shadow-sm hover:shadow-md transition py-2 px-4 gap-3 text-sm font-medium cursor-pointer">
          <span className="px-2">Search</span>
          <span className="border-l border-slate-300 h-4"></span>
          <span className="px-2 text-slate-500 font-normal">Cari rumah, kost, atau apartemen...</span>
          <button className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition">
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Bagian Kanan Navbar: Berubah tergantung status login */}
        <div className="flex items-center gap-3">
          {user ? (
            // JIKA SUDAH LOGIN (Tampilkan profil/email dan tombol keluar)
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                {user.name || user.email} {user.role ? `(${user.role})` : ''}
              </span>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 border border-slate-300 rounded-full py-1.5 px-3 hover:bg-slate-50 transition text-sm font-medium text-red-600"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            // JIKA BELUM LOGIN (Tampilkan tombol Masuk / Daftar)
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-slate-700 hover:text-rose-500"
              >
                Masuk
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-full text-sm font-semibold px-4"
              >
                Daftar
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* 2. LAYOUT UTAMA */}
      <div className="flex">
        <aside className="w-64 hidden lg:block border-r border-slate-200 min-h-[calc(100vh-73px)] p-6 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 font-medium transition">
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition">
            <Home className="h-5 w-5" />
            Kelola Properti
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition">
            <Users className="h-5 w-5" />
            Tenant / Penyewa
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition">
            <Calendar className="h-5 w-5" />
            Jadwal Booking
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition">
            <Settings className="h-5 w-5" />
            Settings
          </a>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-slate-50/50 min-h-[calc(100vh-73px)]">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              </div>

            </div>

            <div className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Daftar Properti & Kamar Tersedia</h3>
                <span className="text-sm font-medium text-rose-600 cursor-pointer hover:underline">Lihat Semua ({properties.length})</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((item) => (
                  <ItemCard key={item.id} item={item} user={user} />
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

// Komponen Kartu Properti Terpisah
function ItemCard({ item, user }: { item: any; user: any }) {
  const navigate = useNavigate();

  const handleSewaClick = () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menyewa properti ini.');
      navigate('/login');
      return;
    }
    navigate(`/sewa/${item.id}`);
  };

  return (
    <div className="group space-y-3 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-md transition">
      <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-tr ${item.imageBg} flex items-center justify-center text-slate-500 font-medium`}>
          <Home className="h-12 w-12 text-rose-400/60" />
        </div>
        
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs ${
          item.status === 'Tersedia' 
            ? 'bg-emerald-500 text-white' 
            : item.status === 'Tersewa' 
            ? 'bg-rose-500 text-white' 
            : 'bg-amber-500 text-white'
        }`}>
          {item.status}
        </span>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-slate-900 truncate">{item.title}</h4>
          <span className="text-sm font-medium text-slate-600">★ {item.rating}</span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
          <MapPin className="h-3.5 w-3.5 text-rose-500" />
          <span>{item.location} • <span className="capitalize">{item.type}</span></span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-slate-900">{item.price}</span>
            <span className="text-xs text-slate-500"> / {item.period}</span>
          </div>

          <Button 
            onClick={handleSewaClick} 
            size="sm" 
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg"
          >
            Sewa
          </Button>
        </div>
      </div>
    </div>
  );
}