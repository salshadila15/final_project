import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Mengambil token dari URL
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage('Token verifikasi tidak ditemukan di URL.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Sesuaikan URL endpoint backend untuk set password/verifikasi
      const response = await fetch('http://localhost:8000/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan password');
      }

      setMessage('Password berhasil dibuat! Mengarahkan ke halaman login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Buat Password Baru</h2>
      <form onSubmit={handleSetPassword}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password Baru:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="Masukkan password rahasia"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Menyimpan...' : 'Simpan Password & Selesaikan Registrasi'}
        </button>
      </form>

      {message && <p style={{ marginTop: '15px', color: message.includes('berhasil') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}