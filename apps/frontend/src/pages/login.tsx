import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userData = await login(email, password);

            if (userData?.role === 'TENANT') {
                navigate('/tenant/dashboard', { replace: true });
            } else {
                navigate('/user/dashboard', { replace: true });
            }
        } catch (err: any) {
            console.error("Login gagal:", err);
            // Menangkap pesan error dari backend atau menampilkan pesan default
            const errorMessage = err.response?.data?.message || err.message || "Gagal masuk, periksa kembali email dan password Anda.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-pink-50/40 px-4">
            <div className="w-full max-w-md rounded-xl border border-pink-100 bg-card p-6 shadow-sm sm:p-8">
                
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Portal Sewa Properti
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Masuk untuk mengelola daftar properti & reservasi Anda
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <input
                            id="email"
                            type="email"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <a href="#" className="text-xs text-rose-600 hover:underline">
                                Lupa password?
                            </a>
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500" 
                        disabled={loading}
                    >
                        {loading ? "Sedang Memproses..." : "Masuk ke Dashboard"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-xs text-muted-foreground">
                    Belum punya akun pengelola?{" "}
                    <a href="/register" className="font-medium text-rose-600 hover:underline">
                        Daftar sekarang
                    </a>
                </div>
            </div>
        </div>
    );
}