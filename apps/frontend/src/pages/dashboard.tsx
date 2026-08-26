import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search, User, Menu, LayoutDashboard, Users, Calendar, Settings, LogOut, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Cek apakah token ada di localStorage saat halaman dibuka
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      // Jika tidak ada token, tendang kembali ke halaman login
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Hapus token dari localStorage lalu arahkan ke login
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 1. HEADER / NAVBAR ALA AIRBNB */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Sparkles className="h-6 w-6 text-rose-500" />
          <span className="text-xl font-bold tracking-tight text-rose-500">YukDiSewa</span>
        </div>

        {/* Search Bar Melayang (Khas Airbnb) */}
        <div className="hidden md:flex items-center border border-slate-300 rounded-full shadow-sm hover:shadow-md transition py-2 px-4 gap-3 text-sm font-medium cursor-pointer">
          <span className="px-2">Search</span>
          <span className="border-l border-slate-300 h-4"></span>
          <span className="px-2 text-slate-500 font-normal">Cari hotel atau apartemen...</span>
          <button className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition">
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-300 rounded-full py-1.5 px-3 hover:shadow-sm transition cursor-pointer">
            <Menu className="h-4 w-4 text-slate-600" />
            <div className="bg-slate-500 text-white rounded-full p-1">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. LAYOUT UTAMA (Sidebar & Content Area) */}
      <div className="flex">
        {/* Sidebar Sederhana */}
        <aside className="w-64 hidden lg:block border-r border-slate-200 min-h-[calc(100vh-73px)] p-6 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 font-medium transition">
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition">
            <Users className="h-5 w-5" />
            Users Management
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition">
            <Calendar className="h-5 w-5" />
            Records / Events
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition">
            <Settings className="h-5 w-5" />
            Settings
          </a>
          
          <div className="pt-8">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition">
              <LogOut className="h-5 w-5" />
              Keluar
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-slate-50/50 min-h-[calc(100vh-73px)]">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Heading Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Utama</h1>
                <p className="text-slate-500 text-sm">Kelola aktivitas dan pantau data aplikasi kamu dengan mudah.</p>
              </div>
              <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-sm">
                + Tambah Data Baru
              </Button>
            </div>

            {/* Quick Stats Cards menggunakan Shadcn Card Component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition">
                <CardHeader className="pb-2">
                  <CardDescription>Total Pengguna</CardDescription>
                  <CardTitle className="text-3xl font-bold text-slate-900">1,248</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-emerald-600 font-medium">↑ 12% dari bulan lalu</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition">
                <CardHeader className="pb-2">
                  <CardDescription>Aktivitas Aktif</CardDescription>
                  <CardTitle className="text-3xl font-bold text-slate-900">324</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-emerald-600 font-medium">↑ 4% minggu ini</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition">
                <CardHeader className="pb-2">
                  <CardDescription>Status Sistem</CardDescription>
                  <CardTitle className="text-3xl font-bold text-emerald-600">Normal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500 font-medium">API Backend Terhubung</p>
                </CardContent>
              </Card>
            </div>

            {/* Grid Kartu Ala Airbnb (Estetis & Grid Rapi) */}
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Modul & Proyek Tersedia</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* Kartu 1 */}
                <div className="group cursor-pointer space-y-3">
                  <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative shadow-xs group-hover:shadow-md transition border border-slate-200/60">
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-purple-500/10 flex items-center justify-center text-slate-400 font-medium">
                      Modul A
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-900">Sistem Manajemen</h4>
                      <span className="text-sm font-medium text-slate-600">★ 4.9</span>
                    </div>
                    <p className="text-sm text-slate-500">Frontend & Backend</p>
                    <p className="text-sm font-semibold text-rose-600 mt-1">Aktif</p>
                  </div>
                </div>

                {/* Kartu 2 */}
                <div className="group cursor-pointer space-y-3">
                  <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative shadow-xs group-hover:shadow-md transition border border-slate-200/60">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 flex items-center justify-center text-slate-400 font-medium">
                      Modul B
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-900">Autentikasi & Keamanan</h4>
                      <span className="text-sm font-medium text-slate-600">★ 5.0</span>
                    </div>
                    <p className="text-sm text-slate-500">JWT & Handlebars</p>
                    <p className="text-sm font-semibold text-rose-600 mt-1">Terintegrasi</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}