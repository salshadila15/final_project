import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, Building2, PlusCircle, LogOut, Settings, User as UserIcon } from 'lucide-react';

export default function TenantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'profile' | 'settings'>('overview');

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const properties: any[] = [];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Profil berhasil diperbarui!');
    setIsEditing(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="flex min-h-screen bg-pink-50/20">
      
      {/* Sidebar Kiri */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div>
            <span className="inline-block rounded-md bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 mb-1">
              Pengelola
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Tenant Portal</h2>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'overview' ? 'bg-rose-100 text-rose-700' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'properties' ? 'bg-rose-100 text-rose-700' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Building2 className="h-4 w-4" /> Properti Saya
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'profile' ? 'bg-rose-100 text-rose-700' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <UserIcon className="h-4 w-4" /> Profil
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'settings' ? 'bg-rose-100 text-rose-700' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Settings className="h-4 w-4" /> Pengaturan
            </button>
          </nav>
        </div>

        <Button 
          onClick={logout} 
          variant="outline" 
          className="w-full justify-start text-muted-foreground hover:bg-muted"
        >
          <LogOut className="mr-2 h-4 w-4" /> Keluar
        </Button>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-6">
          
          {/* Card 1: Halo Tenant */}
          <div className="rounded-xl border border-pink-100 bg-card p-6 shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Halo, {user?.name || 'Tenant'}! 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola properti sewa dan pantau unit penginapan Anda di sini.
            </p>
          </div>

          {/* Card 2: Aksi Cepat / Tambah Properti */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
            <div>
              <h2 className="text-base font-semibold text-foreground">Aksi Cepat</h2>
              <p className="text-xs text-muted-foreground">Tambahkan unit baru untuk mulai menyewakan properti.</p>
            </div>
            <Button 
              onClick={() => navigate('/properties/add')} 
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Properti
            </Button>
          </div>

          {/* Notifikasi Sukses */}
          {successMessage && (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 font-medium">
              {successMessage}
            </div>
          )}

          {/* Konten Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">Total Properti</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">0</h3>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">Kamar Disewakan</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">0</h3>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">Rp 0</h3>
                </div>
              </div>
            </div>
          )}

          {/* Konten Tab: Properti Saya */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Daftar Properti Saya</h2>
              {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-pink-200 bg-card p-12 text-center shadow-sm">
                  <Building2 className="h-10 w-10 text-rose-500 mb-3" />
                  <h3 className="text-base font-semibold text-foreground">Belum ada properti</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                    Mulai tambahkan properti pertama Anda agar bisa dilihat penyewa.
                  </p>
                  <Button onClick={() => navigate('/properties/add')} variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                    Tambah Properti Pertama
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {/* Konten Tab: Profil Tenant */}
          {activeTab === 'profile' && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 max-w-2xl">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Profil Tenant / Pengelola</h2>
                  <p className="text-sm text-muted-foreground">Kelola informasi identitas akun pengelola Anda.</p>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                    Edit Profil
                  </Button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">Nama Lengkap</span>
                      <p className="text-sm font-semibold text-foreground">{name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">Email Akun</span>
                      <p className="text-sm font-semibold text-foreground">{email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 pt-2">
                    <span className="text-xs font-medium text-muted-foreground">Hak Akses (Role)</span>
                    <div>
                      <span className="inline-block rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-100">
                        {user?.role || 'TENANT'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Tidak dapat diubah)</Label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm text-muted-foreground cursor-not-allowed opacity-80"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-700">
                      Simpan Perubahan
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Batal
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Konten Tab: Pengaturan */}
          {activeTab === 'settings' && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4 max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground">Pengaturan Akun & Keamanan</h2>
              <p className="text-sm text-muted-foreground">Ubah kata sandi atau preferensi keamanan akun tenant Anda.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}