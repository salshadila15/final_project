import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, Search, LogOut } from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Simulasi riwayat pesanan user (kosong jika belum ada)
  const bookings: any[] = [];

  return (
    <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header Dashboard User */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-pink-100 bg-card p-6 shadow-sm">
          <div>
            <span className="inline-block rounded-md bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 mb-2">
              Dashboard Pencari Properti
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Selamat datang, {user?.name || 'User'}! ✨
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Temukan tempat tinggal impian dan kelola riwayat pemesanan Anda.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/explore')} 
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              <Search className="mr-2 h-4 w-4" /> Cari Properti
            </Button>
            <Button 
              onClick={logout} 
              variant="outline" 
              className="border-input text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Konten Utama: Riwayat Pesanan / Empty State */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Riwayat Pemesanan Saya</h2>

          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-pink-200 bg-card p-12 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Belum ada riwayat pemesanan</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                Sepertinya Anda belum pernah memesan penginapan. Yuk, cari properti yang nyaman untuk hunian Anda!
              </p>
              <Button 
                onClick={() => navigate('/explore')} 
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                Jelajahi Penginapan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((book) => (
                <div key={book.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="font-semibold">{book.propertyName}</h3>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}