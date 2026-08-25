import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2>Dashboard Utama</h2>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>

      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3>Selamat Datang! 🎉</h3>
        <p>Kamu telah berhasil masuk ke dalam sistem dan terautentikasi dengan aman.</p>
      </div>
    </div>
  );
}