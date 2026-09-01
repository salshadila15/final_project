import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER'); // 'USER' atau 'TENANT'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal melakukan registrasi');
      }

      setMessage('Registrasi berhasil! Silakan cek email kamu untuk tautan pembuatan password.');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-pink-50/40 px-4">
      <div className="w-full max-w-md rounded-xl border border-pink-100 bg-card p-6 shadow-sm sm:p-8">
        
        {/* Header Branding */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Daftar Akun Baru
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buat akun untuk mulai mengelola atau menyewa properti
          </p>
        </div>

        {/* Notifikasi Pesan/Error */}
        {message && (
          <div className={`mb-4 rounded-md p-3 text-sm font-medium ${
            message.includes('berhasil') 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
              : 'bg-destructive/10 text-destructive'
          }`}>
            {message}
          </div>
        )}

        {/* Form Register */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nama Anda"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@email.com"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`flex h-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  role === 'USER'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-input bg-transparent text-muted-foreground hover:bg-muted'
                }`}
              >
                User (Pencari)
              </button>
              <button
                type="button"
                onClick={() => setRole('TENANT')}
                className={`flex h-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  role === 'TENANT'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-input bg-transparent text-muted-foreground hover:bg-muted'
                }`}
              >
                Tenant (Pengelola)
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500" 
            disabled={loading}
          >
            {loading ? 'Mengirim...' : 'Daftar & Kirim Link Verifikasi'}
          </Button>
        </form>

        {/* Footer ke halaman Login */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-rose-600 hover:underline">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}