import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Profil berhasil diperbarui!');
    setIsEditing(false);
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
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Profil Tenant / Pengelola</h2>
                  <p className="text-sm text-muted-foreground">Kelola informasi identitas akun pengelola Anda.</p>
                </div>
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
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    required
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-700">Simpan Perubahan</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
                </div>
              </form>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}