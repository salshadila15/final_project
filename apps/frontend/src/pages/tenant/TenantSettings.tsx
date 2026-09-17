import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Pengaturan berhasil disimpan!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-pink-50/25">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-6 md:px-12 shadow-xs">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
          </Button>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-6">
          
          {successMessage && (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 font-medium">
              {successMessage}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Pengaturan Akun & Keamanan</h2>
                <p className="text-sm text-muted-foreground">Ubah kata sandi atau preferensi keamanan akun tenant Anda.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
                <input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Kata Sandi Baru</Label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-700">Simpan Pengaturan</Button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}