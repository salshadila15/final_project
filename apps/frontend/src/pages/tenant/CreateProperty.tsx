import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2, Image as ImageIcon, MapPin, DollarSign, Home } from 'lucide-react';

interface MessageState {
    type: 'success' | 'error';
    text: string;
}

export default function CreatePropertyPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        picture: '',
        room: '',
        address: '',
        price: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<MessageState | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token'); 

            await axios.post('http://localhost:8000/api/properties', {
                ...formData,
                room: Number(formData.room),
                price: parseFloat(formData.price)
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage({ type: 'success', text: 'Properti berhasil ditambahkan! Mengalihkan...' });
            setTimeout(() => navigate('/tenant/dashboard'), 1500);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Terjadi kesalahan saat menambahkan properti' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50/20 p-6 md:p-8 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-6">
                
                {/* Header dengan Tombol Kembali */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => navigate('/tenant/dashboard')}
                            className="rounded-full border-rose-200 hover:bg-rose-50 text-rose-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Tambah Properti Baru</h1>
                            <p className="text-sm text-muted-foreground">Isi detail lengkap properti kos atau hunian yang ingin disewakan.</p>
                        </div>
                    </div>
                </div>

                {/* Notifikasi Pesan */}
                {message && (
                    <div className={`p-4 rounded-xl border text-sm font-medium ${
                        message.type === 'success' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Form Utama */}
                <form onSubmit={handleSubmit} className="rounded-xl border border-pink-100 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
                    
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-rose-600" /> Informasi Utama
                        </h3>
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <Label htmlFor="title" className="text-foreground">Judul Properti</Label>
                                <Input 
                                    id="title" 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    placeholder="Contoh: Kost Eksklusif Melati Indah" 
                                    required 
                                    className="mt-1.5 focus-visible:ring-rose-500" 
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="category" className="text-foreground">Kategori</Label>
                                    <Input 
                                        id="category" 
                                        type="text" 
                                        name="category" 
                                        value={formData.category} 
                                        onChange={handleChange} 
                                        placeholder="Kost Putra / Putri / Campur" 
                                        required 
                                        className="mt-1.5 focus-visible:ring-rose-500" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="picture" className="text-foreground">URL Gambar Utama</Label>
                                    <div className="relative mt-1.5">
                                        <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            id="picture" 
                                            type="url" 
                                            name="picture" 
                                            value={formData.picture} 
                                            onChange={handleChange} 
                                            placeholder="https://..." 
                                            className="pl-9 focus-visible:ring-rose-500" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-foreground">Deskripsi Properti</Label>
                                <textarea 
                                    id="description" 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    rows={4} 
                                    placeholder="Jelaskan fasilitas kamar, ukuran, peraturan, dll..."
                                    className="w-full mt-1.5 p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 text-foreground"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-rose-600" /> Detail Harga & Ketersediaan
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="room" className="text-foreground flex items-center gap-1.5">
                                    <Home className="w-3.5 h-3.5 text-muted-foreground" /> Jumlah Kamar Tersedia
                                </Label>
                                <Input 
                                    id="room" 
                                    type="number" 
                                    name="room" 
                                    value={formData.room} 
                                    onChange={handleChange} 
                                    placeholder="5" 
                                    min="1"
                                    required 
                                    className="mt-1.5 focus-visible:ring-rose-500" 
                                />
                            </div>
                            <div>
                                <Label htmlFor="price" className="text-foreground">Harga per Bulan (Rp)</Label>
                                <Input 
                                    id="price" 
                                    type="number" 
                                    name="price" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    placeholder="1500000" 
                                    min="0"
                                    required 
                                    className="mt-1.5 focus-visible:ring-rose-500" 
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-rose-600" /> Alamat Lokasi
                        </h3>
                        <div>
                            <Label htmlFor="address" className="text-foreground">Alamat Lengkap</Label>
                            <textarea 
                                id="address" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                rows={2} 
                                placeholder="Masukkan nama jalan, nomor, kecamatan, dan kota..."
                                required 
                                className="w-full mt-1.5 p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 text-foreground"
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => navigate('/tenant/dashboard')}
                            className="border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-rose-600 text-white hover:bg-rose-700"
                        >
                            {loading ? 'Menyimpan Data...' : 'Simpan Properti'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}