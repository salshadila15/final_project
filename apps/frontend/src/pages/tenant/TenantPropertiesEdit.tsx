import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2, Upload } from 'lucide-react';
import api from '@/services/api';

export default function TenantPropertiesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [room, setRoom] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [priceMessage, setPriceMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Ambil data properti lama berdasarkan ID saat halaman dimuat
  useEffect(() => {
    const fetchPropertyDetail = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        const data = response.data.data;

        setTitle(data.title || '');
        setCategory(data.category || '');
        setPrice(data.price || '');
        setRoom(data.room || '');
        setAddress(data.address || '');

        if (data.startDate) setStartDate(data.startDate.split('T')[0]);
        if (data.endDate) setEndDate(data.endDate.split('T')[0]);

        if (data.imageUrl) {
          setPreviewImage(`${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Gagal memuat detail properti', error);
        setErrorMessage('Gagal memuat data properti.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetail();
    }
  }, [id]);

  // Handle perubahan file gambar baru
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 2. Kirim update data ke backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('room', room);
      formData.append('address', address);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);

      if (image) {
        formData.append('image', image);
      }

      await api.put(`/properties/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/tenant/dashboard');
    } catch (error: any) {
      console.error('Gagal memperbarui properti', error);
      setErrorMessage(
        error.response?.data?.message ||
          'Terjadi kesalahan saat memperbarui properti.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCustomPrice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customDate || !customPrice) {
      setPriceMessage('Tanggal dan harga khusus wajib diisi');
      return;
    }

    try {
      await api.post(`/properties/${id}/prices`, {
        date: customDate,
        price: Number(customPrice),
      });

      setPriceMessage('Harga khusus berhasil disimpan!');
      setCustomDate('');
      setCustomPrice('');
    } catch (error: any) {
      console.error('Gagal menyimpan harga khusus', error);
      setPriceMessage(
        error.response?.data?.message || 'Gagal menyimpan harga khusus.'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pink-50/25">
        <p className="text-muted-foreground text-sm">Memuat data properti...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-pink-50/25">
      {/* Top Navbar */}
      <header className="border-border bg-card sticky top-0 z-40 flex h-16 items-center justify-between border-b px-6 shadow-xs md:px-12">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tenant/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
          </Button>
        </div>
      </header>

      {/* Konten Utama Form Edit */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="border-border bg-card space-y-6 rounded-xl border p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 font-bold text-rose-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground text-lg font-semibold">
                  Edit Unit Properti
                </h2>
                <p className="text-muted-foreground text-sm">
                  Perbarui informasi dan detail unit sewa Anda.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul / Nama Properti</Label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <input
                    id="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room">Jumlah Kamar</Label>
                  <input
                    id="room"
                    type="number"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Harga Sewa per Malam</Label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai Tersedia</Label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Selesai Tersedia</Label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
                  required
                />
              </div>

              {/* Upload & Preview Gambar */}
              <div className="space-y-2">
                <Label>Foto Properti</Label>
                <div className="border-border hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors">
                  {previewImage ? (
                    <div className="relative mb-3 h-48 w-full">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-full w-full rounded-md object-cover"
                      />
                    </div>
                  ) : (
                    <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-muted-foreground text-sm file:mr-4 file:rounded-md file:border-0 file:bg-rose-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-rose-700 hover:file:bg-rose-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 border-t pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-rose-600 text-white hover:bg-rose-700"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/tenant/dashboard')}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>

          {/* BAGIAN PENGATURAN HARGA KHUSUS HARIAN */}
          <div className="border-border mt-6 space-y-4 border-t pt-4">
            <div>
              <h3 className="text-md text-foreground font-semibold">
                Pengaturan Harga Khusus (Harian)
              </h3>
              <p className="text-muted-foreground text-xs">
                Atur harga berbeda untuk tanggal tertentu (misal: akhir pekan
                atau hari libur).
              </p>
            </div>

            {priceMessage && (
              <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm font-medium text-sky-700">
                {priceMessage}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customDate">Pilih Tanggal</Label>
                <input
                  id="customDate"
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customPrice">Harga Khusus (Rp)</Label>
                <input
                  id="customPrice"
                  type="number"
                  placeholder="Contoh: 350000"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSaveCustomPrice}
                variant="secondary"
                className="text-xs"
              >
                Set Harga Tanggal Ini
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
