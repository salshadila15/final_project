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
    Users,
    Clock,
    CalendarDays,
    Plus,
    Trash2,
} from 'lucide-react';

interface MessageState {
    type: 'success' | 'error';
    text: string;
}

interface SpecialPriceInput {
    date: string;
    price: string;
}

interface RoomForm {
    id: string;
    name: string;
    description: string;
    quantity: string;
    maxGuests: string;
    price: string;
    specialPrices: SpecialPriceInput[];
}

const createRoom = (): RoomForm => ({
    id: `${Date.now()}-${Math.random()}`,
    name: '',
    description: '',
    quantity: '',
    maxGuests: '2',
    price: '',
    specialPrices: [],
});

export default function CreatePropertyPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        address: '',
        city: '',
        checkInTime: '14:00',
        checkOutTime: '12:00',
    });

    const [rooms, setRooms] = useState<RoomForm[]>([
        createRoom(),
    ]);

    const [pictureFile, setPictureFile] =
        useState<File | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState<MessageState | null>(null);

    const handlePropertyChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const updateRoom = (
        roomIndex: number,
        field: keyof Omit<
            RoomForm,
            'id' | 'specialPrices'
        >,
        value: string
    ) => {
        setRooms((prev) =>
            prev.map((room, index) =>
                index === roomIndex
                    ? {
                          ...room,
                          [field]: value,
                      }
                    : room
            )
        );
    };

    const addRoom = () => {
        setRooms((prev) => [
            ...prev,
            createRoom(),
        ]);
    };

    const removeRoom = (roomIndex: number) => {
        if (rooms.length <= 1) {
            return;
        }

        setRooms((prev) =>
            prev.filter(
                (_, index) => index !== roomIndex
            )
        );
    };

    const addSpecialPrice = (roomIndex: number) => {
        setRooms((prev) =>
            prev.map((room, index) =>
                index === roomIndex
                    ? {
                          ...room,
                          specialPrices: [
                              ...room.specialPrices,
                              {
                                  date: '',
                                  price: '',
                              },
                          ],
                      }
                    : room
            )
        );
    };

    const updateSpecialPrice = (
        roomIndex: number,
        priceIndex: number,
        field: keyof SpecialPriceInput,
        value: string
    ) => {
        setRooms((prev) =>
            prev.map((room, index) =>
                index === roomIndex
                    ? {
                          ...room,
                          specialPrices:
                              room.specialPrices.map(
                                  (specialPrice, index2) =>
                                      index2 === priceIndex
                                          ? {
                                                ...specialPrice,
                                                [field]:
                                                    value,
                                            }
                                          : specialPrice
                              ),
                      }
                    : room
            )
        );
    };

    const removeSpecialPrice = (
        roomIndex: number,
        priceIndex: number
    ) => {
        setRooms((prev) =>
            prev.map((room, index) =>
                index === roomIndex
                    ? {
                          ...room,
                          specialPrices:
                              room.specialPrices.filter(
                                  (_, index2) =>
                                      index2 !== priceIndex
                              ),
                      }
                    : room
            )
        );
    };

    const validateRooms = () => {
        for (let index = 0; index < rooms.length; index++) {
            const room = rooms[index];
            const roomNumber = index + 1;

            if (
                !room.name.trim() ||
                !room.quantity ||
                !room.maxGuests ||
                room.price === ''
            ) {
                return `Lengkapi data Tipe Kamar ${roomNumber}.`;
            }

            const quantity = Number(room.quantity);
            const maxGuests = Number(room.maxGuests);
            const price = Number(room.price);

            if (
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                return `Jumlah unit Tipe Kamar ${roomNumber} harus minimal 1.`;
            }

            if (
                !Number.isInteger(maxGuests) ||
                maxGuests < 1
            ) {
                return `Maksimal tamu Tipe Kamar ${roomNumber} harus minimal 1.`;
            }

            if (
                Number.isNaN(price) ||
                price < 0
            ) {
                return `Harga Tipe Kamar ${roomNumber} tidak valid.`;
            }

            for (
                let priceIndex = 0;
                priceIndex < room.specialPrices.length;
                priceIndex++
            ) {
                const specialPrice =
                    room.specialPrices[priceIndex];

                if (!specialPrice.date) {
                    return `Pilih tanggal harga khusus pada Tipe Kamar ${roomNumber}.`;
                }

                if (specialPrice.price === '') {
                    return `Masukkan harga khusus pada Tipe Kamar ${roomNumber}.`;
                }

                const specialPriceValue =
                    Number(specialPrice.price);

                if (
                    Number.isNaN(specialPriceValue) ||
                    specialPriceValue < 0
                ) {
                    return `Harga khusus pada Tipe Kamar ${roomNumber} tidak valid.`;
                }
            }
        }

        return null;
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setLoading(true);
        setMessage(null);

        const validationError = validateRooms();

        if (validationError) {
            setMessage({
                type: 'error',
                text: validationError,
            });

            setLoading(false);

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });

            return;
        }

        try {
            /*
             * ==========================================
             * 1. CREATE PROPERTY + ROOM PERTAMA
             * ==========================================
             *
             * Backend /properties saat ini memang masih
             * menerima satu room utama.
             *
             * Room pertama kita kirim melalui endpoint ini.
             */
            const firstRoom = rooms[0];

            const propertyFormData =
                new FormData();

            propertyFormData.append(
                'title',
                formData.title
            );

            propertyFormData.append(
                'category',
                formData.category
            );

            propertyFormData.append(
                'description',
                formData.description
            );

            propertyFormData.append(
                'address',
                formData.address
            );

            propertyFormData.append(
                'city',
                formData.city
            );

            propertyFormData.append(
                'checkInTime',
                formData.checkInTime
            );

            propertyFormData.append(
                'checkOutTime',
                formData.checkOutTime
            );

            propertyFormData.append(
                'roomName',
                firstRoom.name.trim()
            );

            propertyFormData.append(
                'roomDescription',
                firstRoom.description.trim()
            );

            propertyFormData.append(
                'roomQuantity',
                firstRoom.quantity
            );

            propertyFormData.append(
                'roomMaxGuests',
                firstRoom.maxGuests
            );

            propertyFormData.append(
                'roomPrice',
                firstRoom.price
            );

            if (pictureFile) {
                propertyFormData.append(
                    'picture',
                    pictureFile
                );
            }

            const propertyResponse =
                await api.post(
                    '/properties',
                    propertyFormData,
                    {
                        headers: {
                            'Content-Type':
                                'multipart/form-data',
                        },
                    }
                );

            const createdProperty =
                propertyResponse.data?.data
                    ?.property;

            const createdFirstRoom =
                propertyResponse.data?.data?.room;

            if (
                !createdProperty?.id ||
                !createdFirstRoom?.id
            ) {
                throw new Error(
                    'Properti berhasil dibuat tetapi data room tidak ditemukan.'
                );
            }

            const propertyId =
                Number(createdProperty.id);

            const roomIds: number[] = [
                Number(createdFirstRoom.id),
            ];

            /*
             * ==========================================
             * 2. CREATE ROOM TAMBAHAN
             * ==========================================
             */
            for (
                let index = 1;
                index < rooms.length;
                index++
            ) {
                const room = rooms[index];

                const roomResponse =
                    await api.post('/rooms', {
                        propertyId,
                        name: room.name.trim(),
                        description:
                            room.description.trim(),
                        quantity: Number(
                            room.quantity
                        ),
                        maxGuests: Number(
                            room.maxGuests
                        ),
                        price: Number(
                            room.price
                        ),
                    });

                const createdRoom =
                    roomResponse.data?.data;

                if (!createdRoom?.id) {
                    throw new Error(
                        `Tipe kamar "${room.name}" gagal dibuat.`
                    );
                }

                roomIds.push(
                    Number(createdRoom.id)
                );
            }

            /*
             * ==========================================
             * 3. CREATE SPECIAL PRICE PER ROOM
             * ==========================================
             *
             * Setiap special price dikirim menggunakan
             * roomId masing-masing.
             *
             * Jadi Standard dan Deluxe tidak mungkin
             * tertukar walaupun tanggalnya sama.
             */
            for (
                let index = 0;
                index < rooms.length;
                index++
            ) {
                const room = rooms[index];
                const roomId = roomIds[index];

                for (
                    const specialPrice of room.specialPrices
                ) {
                    await api.post(
                        `/rooms/${roomId}/special-prices`,
                        {
                            date: specialPrice.date,
                            price: Number(
                                specialPrice.price
                            ),
                        }
                    );
                }
            }

            setMessage({
                type: 'success',
                text:
                    'Properti, semua tipe kamar, dan harga khusus berhasil ditambahkan! Mengalihkan...',
            });

            setTimeout(() => {
                navigate(
                    `/tenant/properties/${propertyId}`
                );
            }, 1500);
        } catch (error: unknown) {
            console.error(
                'Gagal membuat properti:',
                error
            );

            const err = error as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
                message?: string;
            };

            setMessage({
                type: 'error',
                text:
                    err.response?.data
                        ?.message ||
                    err.message ||
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
                            onClick={() =>
                                navigate(
                                    '/tenant/dashboard'
                                )
                            }
                            disabled={loading}
                            className="rounded-full border-rose-200 hover:bg-rose-50 text-rose-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Tambah Properti Baru
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                Isi informasi properti, tipe kamar,
                                dan harga khusus yang ingin disewakan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* NOTIFICATION */}
                {message && (
                    <div
                        className={`p-4 rounded-xl border text-sm font-medium ${
                            message.type ===
                            'success'
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
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handlePropertyChange
                                    }
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
                                        value={
                                            formData.category
                                        }
                                        onChange={
                                            handlePropertyChange
                                        }
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
                                            onChange={(
                                                e
                                            ) => {
                                                const file =
                                                    e
                                                        .target
                                                        .files?.[0] ||
                                                    null;

                                                setPictureFile(
                                                    file
                                                );
                                            }}
                                            disabled={loading}
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
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handlePropertyChange
                                    }
                                    rows={4}
                                    placeholder="Jelaskan fasilitas umum, lokasi, peraturan, dan informasi lainnya..."
                                    className="w-full mt-1.5 p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 text-foreground"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* ========================= */}
                    {/* BAGIAN 2: TIPE KAMAR */}
                    {/* ========================= */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Home className="w-4 h-4 text-rose-600" />
                                    Tipe Kamar
                                </h3>

                                <p className="text-sm text-muted-foreground mt-2">
                                    Tambahkan satu atau beberapa tipe kamar
                                    untuk properti ini.
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addRoom}
                                disabled={loading}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Tipe Kamar
                            </Button>
                        </div>

                        <div className="space-y-5">
                            {rooms.map(
                                (room, roomIndex) => (
                                    <div
                                        key={room.id}
                                        className="rounded-xl border bg-background p-5 space-y-5"
                                    >
                                        {/* ROOM HEADER */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h4 className="font-semibold text-foreground">
                                                    Tipe Kamar{' '}
                                                    {roomIndex + 1}
                                                </h4>

                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {
                                                        roomIndex ===
                                                        0
                                                            ? 'Tipe kamar utama'
                                                            : 'Tipe kamar tambahan'
                                                    }
                                                </p>
                                            </div>

                                            {rooms.length >
                                                1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeRoom(
                                                            roomIndex
                                                        )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                    className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                    title="Hapus tipe kamar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* ROOM NAME */}
                                        <div>
                                            <Label
                                                htmlFor={`roomName-${room.id}`}
                                                className="text-foreground"
                                            >
                                                Nama / Tipe Room
                                            </Label>

                                            <Input
                                                id={`roomName-${room.id}`}
                                                type="text"
                                                value={
                                                    room.name
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateRoom(
                                                        roomIndex,
                                                        'name',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Contoh: Standard Room"
                                                required
                                                disabled={
                                                    loading
                                                }
                                                className="mt-1.5 focus-visible:ring-rose-500"
                                            />
                                        </div>

                                        {/* ROOM DESCRIPTION */}
                                        <div>
                                            <Label
                                                htmlFor={`roomDescription-${room.id}`}
                                                className="text-foreground"
                                            >
                                                Deskripsi Room
                                            </Label>

                                            <textarea
                                                id={`roomDescription-${room.id}`}
                                                value={
                                                    room.description
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateRoom(
                                                        roomIndex,
                                                        'description',
                                                        e.target.value
                                                    )
                                                }
                                                rows={3}
                                                placeholder="Contoh: AC, WiFi, kamar mandi dalam..."
                                                disabled={
                                                    loading
                                                }
                                                className="w-full mt-1.5 p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 text-foreground"
                                            />
                                        </div>

                                        {/* QUANTITY + MAX GUESTS */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                            <div>
                                                <Label
                                                    htmlFor={`roomQuantity-${room.id}`}
                                                    className="text-foreground flex items-center gap-1.5"
                                                >
                                                    <Home className="w-3.5 h-3.5 text-muted-foreground" />
                                                    Jumlah Unit
                                                </Label>

                                                <Input
                                                    id={`roomQuantity-${room.id}`}
                                                    type="number"
                                                    min="1"
                                                    value={
                                                        room.quantity
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateRoom(
                                                            roomIndex,
                                                            'quantity',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="10"
                                                    required
                                                    disabled={
                                                        loading
                                                    }
                                                    className="mt-1.5 focus-visible:ring-rose-500"
                                                />
                                            </div>

                                            <div>
                                                <Label
                                                    htmlFor={`roomMaxGuests-${room.id}`}
                                                    className="text-foreground flex items-center gap-1.5"
                                                >
                                                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                    Maksimal Tamu
                                                </Label>

                                                <Input
                                                    id={`roomMaxGuests-${room.id}`}
                                                    type="number"
                                                    min="1"
                                                    value={
                                                        room.maxGuests
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateRoom(
                                                            roomIndex,
                                                            'maxGuests',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="2"
                                                    required
                                                    disabled={
                                                        loading
                                                    }
                                                    className="mt-1.5 focus-visible:ring-rose-500"
                                                />
                                            </div>
                                        </div>

                                        {/* BASE PRICE */}
                                        <div>
                                            <Label
                                                htmlFor={`roomPrice-${room.id}`}
                                                className="text-foreground flex items-center gap-1.5"
                                            >
                                                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                                                Harga per Malam
                                            </Label>

                                            <Input
                                                id={`roomPrice-${room.id}`}
                                                type="number"
                                                min="0"
                                                value={
                                                    room.price
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateRoom(
                                                        roomIndex,
                                                        'price',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="300000"
                                                required
                                                disabled={
                                                    loading
                                                }
                                                className="mt-1.5 focus-visible:ring-rose-500"
                                            />

                                            <p className="text-xs text-muted-foreground mt-1.5">
                                                Harga dasar per unit untuk
                                                satu malam.
                                            </p>
                                        </div>

                                        {/* SPECIAL PRICES */}
                                        <div className="border-t pt-5">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                <div>
                                                    <h5 className="font-semibold text-sm flex items-center gap-2">
                                                        <CalendarDays className="w-4 h-4 text-rose-600" />
                                                        Harga Khusus
                                                    </h5>

                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Harga berbeda untuk
                                                        tanggal tertentu.
                                                    </p>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        addSpecialPrice(
                                                            roomIndex
                                                        )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Tambah Harga Khusus
                                                </Button>
                                            </div>

                                            {room.specialPrices
                                                .length ===
                                            0 ? (
                                                <div className="mt-4 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                                                    Belum ada harga khusus
                                                    untuk tipe kamar ini.
                                                </div>
                                            ) : (
                                                <div className="mt-4 space-y-3">
                                                    {room.specialPrices.map(
                                                        (
                                                            specialPrice,
                                                            priceIndex
                                                        ) => (
                                                            <div
                                                                key={`${room.id}-special-${priceIndex}`}
                                                                className="rounded-lg border bg-pink-50/40 p-3"
                                                            >
                                                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                                                                    <div>
                                                                        <Label className="text-xs text-muted-foreground">
                                                                            Tanggal
                                                                        </Label>

                                                                        <Input
                                                                            type="date"
                                                                            value={
                                                                                specialPrice.date
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateSpecialPrice(
                                                                                    roomIndex,
                                                                                    priceIndex,
                                                                                    'date',
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                loading
                                                                            }
                                                                            className="mt-1.5"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <Label className="text-xs text-muted-foreground">
                                                                            Harga Khusus
                                                                        </Label>

                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                specialPrice.price
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateSpecialPrice(
                                                                                    roomIndex,
                                                                                    priceIndex,
                                                                                    'price',
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder="400000"
                                                                            disabled={
                                                                                loading
                                                                            }
                                                                            className="mt-1.5"
                                                                        />
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeSpecialPrice(
                                                                                roomIndex,
                                                                                priceIndex
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loading
                                                                        }
                                                                        className="inline-flex h-10 items-center justify-center rounded-md border px-3 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                                        title="Hapus harga khusus"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
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

                        <div className="grid grid-cols-1 gap-5">

                            {/* CITY */}
                            <div>
                                <Label
                                    htmlFor="city"
                                    className="text-foreground"
                                >
                                    Kota
                                </Label>

                                <Input
                                    id="city"
                                    type="text"
                                    name="city"
                                    value={
                                        formData.city
                                    }
                                    onChange={
                                        handlePropertyChange
                                    }
                                    placeholder="Contoh: Jakarta Selatan"
                                    required
                                    disabled={loading}
                                    className="mt-1.5 focus-visible:ring-rose-500"
                                />

                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Kota digunakan sebagai informasi lokasi
                                    dan membantu pencarian properti.
                                </p>
                            </div>

                            {/* ADDRESS */}
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
                                    value={
                                        formData.address
                                    }
                                    onChange={
                                        handlePropertyChange
                                    }
                                    rows={3}
                                    placeholder="Masukkan nama jalan, nomor, kecamatan, dan detail lokasi..."
                                    required
                                    disabled={loading}
                                    className="w-full mt-1.5 p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 text-foreground"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* ========================= */}
                    {/* BAGIAN 4: WAKTU MENGINAP */}
                    {/* ========================= */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-rose-600" />
                            Waktu Check-in & Check-out
                        </h3>

                        <p className="text-sm text-muted-foreground mb-5">
                            Tentukan jam standar untuk tamu melakukan
                            check-in dan check-out di properti ini.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            {/* CHECK-IN */}
                            <div>
                                <Label
                                    htmlFor="checkInTime"
                                    className="text-foreground"
                                >
                                    Jam Check-in
                                </Label>

                                <Input
                                    id="checkInTime"
                                    type="time"
                                    name="checkInTime"
                                    value={
                                        formData.checkInTime
                                    }
                                    onChange={
                                        handlePropertyChange
                                    }
                                    required
                                    disabled={loading}
                                    className="mt-1.5 focus-visible:ring-rose-500"
                                />

                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Default: 14:00
                                </p>
                            </div>

                            {/* CHECK-OUT */}
                            <div>
                                <Label
                                    htmlFor="checkOutTime"
                                    className="text-foreground"
                                >
                                    Jam Check-out
                                </Label>

                                <Input
                                    id="checkOutTime"
                                    type="time"
                                    name="checkOutTime"
                                    value={
                                        formData.checkOutTime
                                    }
                                    onChange={
                                        handlePropertyChange
                                    }
                                    required
                                    disabled={loading}
                                    className="mt-1.5 focus-visible:ring-rose-500"
                                />

                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Default: 12:00
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SUMMARY */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-sm font-medium">
                            Ringkasan
                        </p>

                        <p className="text-sm text-muted-foreground mt-1">
                            {rooms.length} tipe kamar akan dibuat
                            {rooms.reduce(
                                (
                                    total,
                                    room
                                ) =>
                                    total +
                                    room.specialPrices
                                        .length,
                                0
                            ) > 0
                                ? ` dengan ${rooms.reduce(
                                      (
                                          total,
                                          room
                                      ) =>
                                          total +
                                          room
                                              .specialPrices
                                              .length,
                                      0
                                  )} harga khusus.`
                                : '.'}
                        </p>
                    </div>

                    {/* ACTION */}
                    <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    '/tenant/dashboard'
                                )
                            }
                            disabled={loading}
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