import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    Building2,
    Image as ImageIcon,
    MapPin,
    DollarSign,
    Home,
} from 'lucide-react';

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
        address: '',

        // Room pertama
        roomName: '',
        roomDescription: '',
        roomQuantity: '',
        roomPrice: '',
    });

    const [pictureFile, setPictureFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<MessageState | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setMessage(null);

        try {
            const formDataToSend = new FormData();

            // Property
            formDataToSend.append('title', formData.title);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('address', formData.address);

            // Room pertama
            formDataToSend.append('roomName', formData.roomName);
            formDataToSend.append(
                'roomDescription',
                formData.roomDescription
            );
            formDataToSend.append(
                'roomQuantity',
                formData.roomQuantity
            );
            formDataToSend.append(
                'roomPrice',
                formData.roomPrice
            );

            if (pictureFile) {
                formDataToSend.append('picture', pictureFile);
            }

            await api.post('/properties', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage({
                type: 'success',
                text: 'Properti berhasil ditambahkan! Mengalihkan...',
            });

            setTimeout(() => {
                navigate('/tenant/dashboard');
            }, 1500);
        } catch (error: unknown) {
            const err = error as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            };

            setMessage({
                type: 'error',
                text:
                    err.response?.data?.message ||
                    'Terjadi kesalahan saat menambahkan properti',
            });

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50/20 p-6 md:p-8 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-6">

                {/* HEADER */}
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
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Tambah Properti Baru
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                Isi informasi properti dan tipe kamar pertama
                                yang ingin disewakan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* NOTIFICATION */}
                {message && (
                    <div
                        className={`p-4 rounded-xl border text-sm font-medium ${
                            message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-pink-100 bg-card p-6 sm:p-8 space-y-6 shadow-sm"
                >

                    {/* ========================= */}
                    {/* BAGIAN 1: INFORMASI UTAMA */}
                    {/* ========================= */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-rose-600" />
                            Informasi Utama
                        </h3>

                        <div className="grid grid-cols-1 gap-5">

                            {/* TITLE */}
                            <div>
                                <Label
                                    htmlFor="title"
                                    className="text-foreground"
                                >
                                    Judul Properti
                                </Label>

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

                            {/* CATEGORY + IMAGE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                <div>
                                    <Label
                                        htmlFor="category"
                                        className="text-foreground"
                                    >
                                        Kategori
                                    </Label>

                                    <Input
                                        id="category"
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="Contoh: Kost"
                                        required
                                        className="mt-1.5 focus-visible:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="picture"
                                        className="text-foreground"
                                    >
                                        Gambar Utama
                                    </Label>

                                    <div className="relative mt-1.5">
                                        <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />

                                        <Input
                                            id="picture"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0] || null;

                                                setPictureFile(file);
                                            }}
                                            className="pl-9 focus-visible:ring-rose-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <Label
                                    htmlFor="description"
                                    className="text-foreground"
                                >
                                    Deskripsi Properti
                                </Label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Jelaskan fasilitas umum, lokasi, peraturan, dan informasi lainnya..."
                                    className="w-full mt-1.5 p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 text-foreground"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* ========================= */}
                    {/* BAGIAN 2: ROOM PERTAMA */}
                    {/* ========================= */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <Home className="w-4 h-4 text-rose-600" />
                            Room Pertama
                        </h3>

                        <p className="text-sm text-muted-foreground mb-5">
                            Tambahkan tipe kamar pertama untuk properti ini.
                            Room lain dapat ditambahkan setelah properti dibuat.
                        </p>

                        <div className="grid grid-cols-1 gap-5">

                            {/* ROOM NAME */}
                            <div>
                                <Label
                                    htmlFor="roomName"
                                    className="text-foreground"
                                >
                                    Nama / Tipe Room
                                </Label>

                                <Input
                                    id="roomName"
                                    type="text"
                                    name="roomName"
                                    value={formData.roomName}
                                    onChange={handleChange}
                                    placeholder="Contoh: Standard Room"
                                    required
                                    className="mt-1.5 focus-visible:ring-rose-500"
                                />
                            </div>

                            {/* ROOM DESCRIPTION */}
                            <div>
                                <Label
                                    htmlFor="roomDescription"
                                    className="text-foreground"
                                >
                                    Deskripsi Room
                                </Label>

                                <textarea
                                    id="roomDescription"
                                    name="roomDescription"
                                    value={formData.roomDescription}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Contoh: AC, WiFi, kamar mandi dalam..."
                                    className="w-full mt-1.5 p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 text-foreground"
                                />
                            </div>

                            {/* QUANTITY + PRICE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                <div>
                                    <Label
                                        htmlFor="roomQuantity"
                                        className="text-foreground flex items-center gap-1.5"
                                    >
                                        <Home className="w-3.5 h-3.5 text-muted-foreground" />
                                        Jumlah Unit
                                    </Label>

                                    <Input
                                        id="roomQuantity"
                                        type="number"
                                        name="roomQuantity"
                                        value={formData.roomQuantity}
                                        onChange={handleChange}
                                        placeholder="10"
                                        min="1"
                                        required
                                        className="mt-1.5 focus-visible:ring-rose-500"
                                    />

                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Contoh: tersedia 10 kamar Standard.
                                    </p>
                                </div>

                                <div>
                                    <Label
                                        htmlFor="roomPrice"
                                        className="text-foreground flex items-center gap-1.5"
                                    >
                                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                                        Harga per Malam
                                    </Label>

                                    <Input
                                        id="roomPrice"
                                        type="number"
                                        name="roomPrice"
                                        value={formData.roomPrice}
                                        onChange={handleChange}
                                        placeholder="150000"
                                        min="0"
                                        required
                                        className="mt-1.5 focus-visible:ring-rose-500"
                                    />

                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Harga dasar per unit untuk satu malam.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* ========================= */}
                    {/* BAGIAN 3: ALAMAT */}
                    {/* ========================= */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-rose-600" />
                            Alamat Lokasi
                        </h3>

                        <div>
                            <Label
                                htmlFor="address"
                                className="text-foreground"
                            >
                                Alamat Lengkap
                            </Label>

                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Masukkan nama jalan, nomor, kecamatan, dan kota..."
                                required
                                className="w-full mt-1.5 p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 text-foreground"
                            />
                        </div>
                    </div>

                    {/* ACTION */}
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
                            {loading
                                ? 'Menyimpan Data...'
                                : 'Simpan Properti'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}