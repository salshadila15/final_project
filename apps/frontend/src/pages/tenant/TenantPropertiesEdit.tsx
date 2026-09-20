import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ImagePlus,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import api from '@/services/api';

type SpecialPrice = {
  date: string;
  price: number;
};

type Room = {
  id: number;
  name: string;
  description?: string | null;
  quantity: number;
  maxGuests: number;
  price: number;
  prices?: SpecialPrice[];
};

type EditingSpecialPrice = {
  roomId: number;
  originalDate: string;
};

type EditingRoom = {
  id: number;
  name: string;
  description: string;
  quantity: string;
  maxGuests: string;
  price: string;
};

export default function TenantPropertiesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('12:00');

  // =========================
  // EXISTING ROOMS
  // =========================
  const [rooms, setRooms] = useState<Room[]>([]);

  // Room pertama masih bisa diedit menggunakan endpoint property lama
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomQuantity, setRoomQuantity] = useState('');
  const [roomPrice, setRoomPrice] = useState('');

  // Edit room per tipe
  const [editingRoom, setEditingRoom] =
    useState<EditingRoom | null>(null);

  const [updatingRoomId, setUpdatingRoomId] =
    useState<number | null>(null);

  // =========================
  // NEW ROOM
  // =========================
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomQuantity, setNewRoomQuantity] = useState('');
  const [newRoomMaxGuests, setNewRoomMaxGuests] = useState('2');
  const [newRoomPrice, setNewRoomPrice] = useState('');
  const [addingRoom, setAddingRoom] = useState(false);

  // =========================
  // SPECIAL PRICE PER ROOM
  // =========================
  const [specialDateByRoom, setSpecialDateByRoom] = useState<
    Record<number, string>
  >({});

  const [specialPriceByRoom, setSpecialPriceByRoom] = useState<
    Record<number, string>
  >({});

  const [specialPriceLoadingRoomId, setSpecialPriceLoadingRoomId] =
    useState<number | null>(null);

  const [editingSpecialPrice, setEditingSpecialPrice] =
    useState<EditingSpecialPrice | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // =========================
  // FETCH PROPERTY
  // =========================
  const fetchProperty = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await api.get(`/properties/${id}`);
      const data = response.data.data;

      const propertyRooms: Room[] = Array.isArray(data.rooms)
        ? data.rooms.map((room: any) => ({
            id: Number(room.id),
            name: room.name || '',
            description: room.description || '',
            quantity: Number(room.quantity),
            maxGuests: Number(room.maxGuests ?? 2),
            price: Number(room.price),
            prices: Array.isArray(room.prices)
              ? room.prices.map((item: any) => ({
                  date: String(item.date).split('T')[0],
                  price: Number(item.price),
                }))
              : [],
          }))
        : [];

      setRooms(propertyRooms);

      const firstRoom = propertyRooms[0];

      setTitle(data.title || '');
      setCategory(data.category || '');
      setDescription(data.description || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setCheckInTime(data.checkInTime || '14:00');
      setCheckOutTime(data.checkOutTime || '12:00');

      if (firstRoom) {
        setRoomName(firstRoom.name);
        setRoomDescription(firstRoom.description || '');
        setRoomQuantity(String(firstRoom.quantity));
        setRoomPrice(String(firstRoom.price));
      } else {
        setRoomName('');
        setRoomDescription('');
        setRoomQuantity('');
        setRoomPrice('');
      }

      if (data.imageUrl) {
        setPreviewImage(data.imageUrl);
      } else {
        setPreviewImage('');
      }
    } catch (error) {
      console.error('Gagal memuat properti:', error);

      setErrorMessage(
        'Gagal memuat data properti. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  // =========================
  // IMAGE CHANGE
  // =========================
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // =========================
  // EDIT ROOM
  // =========================
  const handleEditRoom = (room: Room) => {
    setErrorMessage('');
    setSuccessMessage('');

    setEditingRoom({
      id: room.id,
      name: room.name,
      description: room.description || '',
      quantity: String(room.quantity),
      maxGuests: String(room.maxGuests),
      price: String(room.price),
    });
  };

  // =========================
  // CANCEL EDIT ROOM
  // =========================
  const handleCancelEditRoom = () => {
    setEditingRoom(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // =========================
  // UPDATE ROOM
  // =========================
  const handleUpdateRoom = async () => {
    if (!editingRoom) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    if (
      !editingRoom.name.trim() ||
      !editingRoom.quantity ||
      !editingRoom.maxGuests ||
      editingRoom.price === ''
    ) {
      setErrorMessage(
        'Nama tipe kamar, jumlah kamar, maksimal tamu, dan harga wajib diisi.'
      );
      return;
    }

    const quantity = Number(editingRoom.quantity);
    const maxGuests = Number(editingRoom.maxGuests);
    const price = Number(editingRoom.price);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setErrorMessage(
        'Jumlah kamar harus berupa angka minimal 1.'
      );
      return;
    }

    if (!Number.isInteger(maxGuests) || maxGuests < 1) {
      setErrorMessage(
        'Maksimal tamu harus berupa angka minimal 1.'
      );
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setErrorMessage('Harga kamar tidak valid.');
      return;
    }

    try {
      setUpdatingRoomId(editingRoom.id);

      await api.put(`/rooms/${editingRoom.id}`, {
        name: editingRoom.name.trim(),
        description: editingRoom.description.trim(),
        quantity,
        maxGuests,
        price,
      });

      setEditingRoom(null);

      setSuccessMessage(
        'Tipe kamar berhasil diperbarui.'
      );

      await fetchProperty();
    } catch (error: any) {
      console.error(
        'Gagal memperbarui tipe kamar:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          'Gagal memperbarui tipe kamar. Silakan coba lagi.'
      );
    } finally {
      setUpdatingRoomId(null);
    }
  };

  // =========================
  // EDIT SPECIAL PRICE
  // =========================
  const handleEditSpecialPrice = (
    roomId: number,
    item: SpecialPrice
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    setSpecialDateByRoom((prev) => ({
      ...prev,
      [roomId]: item.date,
    }));

    setSpecialPriceByRoom((prev) => ({
      ...prev,
      [roomId]: String(item.price),
    }));

    setEditingSpecialPrice({
      roomId,
      originalDate: item.date,
    });
  };

  // =========================
  // CANCEL EDIT SPECIAL PRICE
  // =========================
  const handleCancelEditSpecialPrice = (roomId: number) => {
    setSpecialDateByRoom((prev) => ({
      ...prev,
      [roomId]: '',
    }));

    setSpecialPriceByRoom((prev) => ({
      ...prev,
      [roomId]: '',
    }));

    if (editingSpecialPrice?.roomId === roomId) {
      setEditingSpecialPrice(null);
    }

    setErrorMessage('');
    setSuccessMessage('');
  };

  // =========================
  // ADD / UPDATE SPECIAL PRICE
  // =========================
  const handleAddSpecialPrice = async (roomId: number) => {
    const date = specialDateByRoom[roomId] || '';
    const priceValue = specialPriceByRoom[roomId] || '';

    setErrorMessage('');
    setSuccessMessage('');

    if (!date) {
      setErrorMessage('Pilih tanggal terlebih dahulu.');
      return;
    }

    if (priceValue === '') {
      setErrorMessage('Masukkan harga khusus terlebih dahulu.');
      return;
    }

    const price = Number(priceValue);

    if (Number.isNaN(price) || price < 0) {
      setErrorMessage('Harga khusus tidak valid.');
      return;
    }

    try {
      setSpecialPriceLoadingRoomId(roomId);

      const isEditing =
        editingSpecialPrice?.roomId === roomId;

      const originalDate =
        editingSpecialPrice?.originalDate || '';

      if (
        isEditing &&
        originalDate &&
        originalDate !== date
      ) {
        await api.delete(
          `/rooms/${roomId}/special-prices/${originalDate}`
        );
      }

      await api.post(`/rooms/${roomId}/special-prices`, {
        date,
        price,
      });

      setSpecialDateByRoom((prev) => ({
        ...prev,
        [roomId]: '',
      }));

      setSpecialPriceByRoom((prev) => ({
        ...prev,
        [roomId]: '',
      }));

      setEditingSpecialPrice(null);

      setSuccessMessage(
        isEditing
          ? 'Harga khusus berhasil diperbarui.'
          : 'Harga khusus berhasil disimpan.'
      );

      await fetchProperty();
    } catch (error: any) {
      console.error(
        'Gagal menyimpan harga khusus:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          'Gagal menyimpan harga khusus. Silakan coba lagi.'
      );
    } finally {
      setSpecialPriceLoadingRoomId(null);
    }
  };

  // =========================
  // DELETE SPECIAL PRICE
  // =========================
  const handleDeleteSpecialPrice = async (
    roomId: number,
    date: string
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setSpecialPriceLoadingRoomId(roomId);

      await api.delete(
        `/rooms/${roomId}/special-prices/${date}`
      );

      if (
        editingSpecialPrice?.roomId === roomId &&
        editingSpecialPrice.originalDate === date
      ) {
        setSpecialDateByRoom((prev) => ({
          ...prev,
          [roomId]: '',
        }));

        setSpecialPriceByRoom((prev) => ({
          ...prev,
          [roomId]: '',
        }));

        setEditingSpecialPrice(null);
      }

      setSuccessMessage(
        'Harga khusus berhasil dihapus.'
      );

      await fetchProperty();
    } catch (error: any) {
      console.error(
        'Gagal menghapus harga khusus:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          'Gagal menghapus harga khusus. Silakan coba lagi.'
      );
    } finally {
      setSpecialPriceLoadingRoomId(null);
    }
  };

  // =========================
  // ADD NEW ROOM
  // =========================
  const handleAddRoom = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!id) {
      setErrorMessage('ID properti tidak ditemukan.');
      return;
    }

    if (
      !newRoomName ||
      !newRoomQuantity ||
      !newRoomMaxGuests ||
      newRoomPrice === ''
    ) {
      setErrorMessage(
        'Nama tipe kamar, jumlah kamar, maksimal tamu, dan harga wajib diisi.'
      );
      return;
    }

    const quantity = Number(newRoomQuantity);
    const maxGuests = Number(newRoomMaxGuests);
    const price = Number(newRoomPrice);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setErrorMessage(
        'Jumlah kamar harus berupa angka minimal 1.'
      );
      return;
    }

    if (!Number.isInteger(maxGuests) || maxGuests < 1) {
      setErrorMessage(
        'Maksimal tamu harus berupa angka minimal 1.'
      );
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setErrorMessage('Harga kamar tidak valid.');
      return;
    }

    try {
      setAddingRoom(true);

      await api.post('/rooms', {
        propertyId: Number(id),
        name: newRoomName.trim(),
        description: newRoomDescription.trim(),
        quantity,
        maxGuests,
        price,
      });

      setNewRoomName('');
      setNewRoomDescription('');
      setNewRoomQuantity('');
      setNewRoomMaxGuests('2');
      setNewRoomPrice('');

      setSuccessMessage(
        'Tipe kamar berhasil ditambahkan.'
      );

      await fetchProperty();
    } catch (error: any) {
      console.error(
        'Gagal menambahkan tipe kamar:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          'Gagal menambahkan tipe kamar. Silakan coba lagi.'
      );
    } finally {
      setAddingRoom(false);
    }
  };

  // =========================
  // SAVE PROPERTY
  // =========================
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!id) {
      setErrorMessage('ID properti tidak ditemukan.');
      return;
    }

    if (!title || !category || !city || !address) {
      setErrorMessage(
        'Judul, kategori, kota, dan alamat wajib diisi.'
      );
      return;
    }

    if (!roomName || !roomQuantity || roomPrice === '') {
      setErrorMessage(
        'Nama room, jumlah kamar, dan harga wajib diisi.'
      );
      return;
    }

    const quantity = Number(roomQuantity);
    const price = Number(roomPrice);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setErrorMessage(
        'Jumlah kamar harus berupa angka minimal 1.'
      );
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setErrorMessage('Harga sewa tidak valid.');
      return;
    }

    if (!checkInTime || !checkOutTime) {
      setErrorMessage(
        'Jam check-in dan check-out wajib diisi.'
      );
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('city', city);
      formData.append('address', address);
      formData.append('checkInTime', checkInTime);
      formData.append('checkOutTime', checkOutTime);

      formData.append('roomName', roomName);
      formData.append('roomDescription', roomDescription);
      formData.append('roomQuantity', String(quantity));
      formData.append('roomPrice', String(price));

      if (image) {
        formData.append('image', image);
      }

      await api.put(`/properties/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate(`/tenant/properties/${id}`);
    } catch (error: any) {
      console.error(
        'Gagal memperbarui properti:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          'Gagal memperbarui properti. Silakan coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return '';
    }

    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50/25">
        <p className="text-muted-foreground">
          Memuat data properti...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50/25">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-6 md:px-12 shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate(`/tenant/properties/${id}`)
          }
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <h1 className="font-semibold text-foreground">
          Edit Properti
        </h1>

        <div className="w-20" />
      </header>

      {/* CONTENT */}
      <main className="max-w-3xl mx-auto w-full p-6 md:p-10">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* ERROR */}
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* SUCCESS */}
          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* =========================
              PROPERTY INFORMATION
          ========================= */}
          <section className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold">
                Informasi Properti
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Perbarui informasi utama properti Anda.
              </p>
            </div>

            {/* TITLE */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama Properti
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Contoh: Kost Melati"
              />
            </div>

            {/* CATEGORY */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Kategori
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">
                  Pilih kategori
                </option>
                <option value="Kost">Kost</option>
                <option value="Villa">Villa</option>
                <option value="Apartemen">
                  Apartemen
                </option>
                <option value="Guest House">
                  Guest House
                </option>
                <option value="Hotel">Hotel</option>
                <option value="Homestay">
                  Homestay
                </option>
              </select>
            </div>

            {/* CITY */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Kota
              </label>

              <input
                type="text"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Contoh: Jakarta Barat"
              />

              <p className="text-xs text-muted-foreground">
                Kota digunakan sebagai informasi lokasi utama
                yang lebih mudah dicari oleh penyewa.
              </p>
            </div>

            {/* ADDRESS */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Alamat Lengkap
              </label>

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Masukkan alamat lengkap properti"
              />
            </div>

            {/* CHECK-IN / CHECK-OUT */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">
                  Waktu Check-in & Check-out
                </h3>

                <p className="text-xs text-muted-foreground mt-1">
                  Tentukan waktu kedatangan dan keberangkatan
                  tamu di properti ini.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CHECK-IN */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Jam Check-in
                  </label>

                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="time"
                      value={checkInTime}
                      onChange={(e) =>
                        setCheckInTime(e.target.value)
                      }
                      className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* CHECK-OUT */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Jam Check-out
                  </label>

                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) =>
                        setCheckOutTime(e.target.value)
                      }
                      className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Deskripsi
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={5}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Jelaskan fasilitas dan informasi properti..."
              />
            </div>

            {/* IMAGE */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Foto Properti
              </label>

              {previewImage ? (
                <div className="relative overflow-hidden rounded-lg border">
                  <img
                    src={
                      previewImage.startsWith('http')
                        ? previewImage
                        : `http://localhost:8000${previewImage}`
                    }
                    alt={title}
                    className="h-56 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                  Belum ada foto
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                <ImagePlus className="h-4 w-4" />
                Ganti Foto

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* =========================
              EXISTING ROOMS
          ========================= */}
          <section className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold">
                Tipe Kamar
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Properti ini dapat memiliki beberapa tipe
                kamar.
              </p>
            </div>

            {/* ROOM LIST */}
            {rooms.length > 0 && (
              <div className="space-y-3">
                {rooms.map((room, index) => {
                  const isEditing =
                    editingRoom?.id === room.id;

                  const isUpdating =
                    updatingRoomId === room.id;

                  return (
                    <div
                      key={room.id}
                      className={`rounded-lg border p-4 ${
                        index === 0
                          ? 'border-rose-200 bg-rose-50/40'
                          : 'bg-background'
                      }`}
                    >
                      {/* ROOM SUMMARY */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold">
                            {room.name}
                          </p>

                          {room.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {room.description}
                            </p>
                          )}

                          <p className="mt-3 text-sm font-semibold text-rose-600">
                            Rp{' '}
                            {room.price.toLocaleString(
                              'id-ID'
                            )}
                            <span className="font-normal text-muted-foreground">
                              {' '}
                              / malam
                            </span>
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            {room.quantity} kamar
                          </span>

                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            Maks. {room.maxGuests} tamu
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleEditRoom(room)
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center rounded-md border p-2 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            title="Edit tipe kamar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* EDIT ROOM */}
                      {isEditing && editingRoom && (
                        <div className="mt-5 border-t pt-5 space-y-5">
                          <div>
                            <h3 className="font-semibold">
                              Edit Tipe Kamar
                            </h3>

                            <p className="text-sm text-muted-foreground mt-1">
                              Perbarui nama, deskripsi, jumlah
                              kamar, maksimal tamu, atau harga
                              dasar tipe kamar ini.
                            </p>
                          </div>

                          {/* ROOM NAME */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Nama / Tipe Kamar
                            </label>

                            <input
                              type="text"
                              value={editingRoom.name}
                              onChange={(e) =>
                                setEditingRoom((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        name: e.target.value,
                                      }
                                    : prev
                                )
                              }
                              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                              placeholder="Contoh: Deluxe Room"
                            />
                          </div>

                          {/* ROOM DESCRIPTION */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Deskripsi Kamar
                            </label>

                            <textarea
                              value={
                                editingRoom.description
                              }
                              onChange={(e) =>
                                setEditingRoom((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        description:
                                          e.target.value,
                                      }
                                    : prev
                                )
                              }
                              rows={3}
                              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                              placeholder="Contoh: AC, balkon, kamar mandi dalam..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* QUANTITY */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Jumlah Kamar
                              </label>

                              <input
                                type="number"
                                min="1"
                                value={
                                  editingRoom.quantity
                                }
                                onChange={(e) =>
                                  setEditingRoom((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          quantity:
                                            e.target.value,
                                        }
                                      : prev
                                  )
                                }
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                              />
                            </div>

                            {/* MAX GUESTS */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Maksimal Tamu
                              </label>

                              <input
                                type="number"
                                min="1"
                                value={
                                  editingRoom.maxGuests
                                }
                                onChange={(e) =>
                                  setEditingRoom((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          maxGuests:
                                            e.target.value,
                                        }
                                      : prev
                                  )
                                }
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                                placeholder="Contoh: 2"
                              />
                            </div>

                            {/* BASE PRICE */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Harga Dasar / Malam
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  editingRoom.price
                                }
                                onChange={(e) =>
                                  setEditingRoom((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          price:
                                            e.target.value,
                                        }
                                      : prev
                                  )
                                }
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                              />
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              type="button"
                              onClick={handleUpdateRoom}
                              disabled={isUpdating}
                              className="bg-rose-600 text-white hover:bg-rose-700 w-full sm:w-auto"
                            >
                              {isUpdating
                                ? 'Menyimpan...'
                                : 'Simpan Tipe Kamar'}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={
                                handleCancelEditRoom
                              }
                              disabled={isUpdating}
                              className="w-full sm:w-auto"
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* EDIT FIRST ROOM */}
            {rooms.length > 0 && (
              <div className="border-t pt-5 space-y-5">
                <div>
                  <h3 className="font-semibold">
                    Edit Tipe Kamar Utama
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    Perubahan di bagian ini akan memperbarui
                    tipe kamar pertama.
                  </p>
                </div>

                {/* ROOM NAME */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nama / Tipe Kamar
                  </label>

                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) =>
                      setRoomName(e.target.value)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Contoh: Standard Room"
                  />
                </div>

                {/* ROOM DESCRIPTION */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Deskripsi Kamar
                  </label>

                  <textarea
                    value={roomDescription}
                    onChange={(e) =>
                      setRoomDescription(e.target.value)
                    }
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Contoh: AC, kamar mandi dalam, WiFi..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* QUANTITY */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Jumlah Kamar
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={roomQuantity}
                      onChange={(e) =>
                        setRoomQuantity(e.target.value)
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* BASE PRICE */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Harga Dasar / Malam
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={roomPrice}
                      onChange={(e) =>
                        setRoomPrice(e.target.value)
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ADD NEW ROOM */}
            <div className="border-t pt-5 space-y-5">
              <div>
                <h3 className="font-semibold">
                  Tambah Tipe Kamar
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Tambahkan tipe kamar lain tanpa membuat
                  properti baru.
                </p>
              </div>

              {/* NEW ROOM NAME */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nama / Tipe Kamar
                </label>

                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) =>
                    setNewRoomName(e.target.value)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Contoh: Deluxe Room"
                />
              </div>

              {/* NEW ROOM DESCRIPTION */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Deskripsi Kamar
                </label>

                <textarea
                  value={newRoomDescription}
                  onChange={(e) =>
                    setNewRoomDescription(e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Contoh: AC, balkon, kamar mandi dalam..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* NEW ROOM QUANTITY */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Jumlah Kamar
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={newRoomQuantity}
                    onChange={(e) =>
                      setNewRoomQuantity(e.target.value)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Contoh: 5"
                  />
                </div>

                {/* NEW ROOM MAX GUESTS */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Maksimal Tamu
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={newRoomMaxGuests}
                    onChange={(e) =>
                      setNewRoomMaxGuests(e.target.value)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Contoh: 2"
                  />
                </div>

                {/* NEW ROOM PRICE */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Harga Dasar / Malam
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={newRoomPrice}
                    onChange={(e) =>
                      setNewRoomPrice(e.target.value)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Contoh: 350000"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddRoom}
                disabled={addingRoom}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />

                {addingRoom
                  ? 'Menambahkan...'
                  : 'Tambah Tipe Kamar'}
              </Button>
            </div>
          </section>

          {/* =========================
              SPECIAL PRICE PER ROOM
          ========================= */}
          <section className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold">
                Harga Khusus
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Atur harga khusus secara terpisah untuk setiap
                tipe kamar dan tanggal tertentu.
              </p>
            </div>

            {rooms.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                Belum ada tipe kamar.
              </div>
            ) : (
              <div className="space-y-5">
                {rooms.map((room) => {
                  const roomPrices = room.prices || [];
                  const isSaving =
                    specialPriceLoadingRoomId === room.id;

                  const isEditing =
                    editingSpecialPrice?.roomId === room.id;

                  return (
                    <div
                      key={room.id}
                      className="rounded-xl border bg-background p-5 space-y-4"
                    >
                      {/* ROOM HEADER */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {room.name}
                          </h3>

                          <p className="text-sm text-muted-foreground mt-1">
                            Harga dasar: Rp{' '}
                            {room.price.toLocaleString('id-ID')}{' '}
                            / malam
                          </p>
                        </div>

                        <span className="self-start rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                          {room.quantity} kamar · Maks.{' '}
                          {room.maxGuests} tamu
                        </span>
                      </div>

                      {/* EXISTING SPECIAL PRICES */}
                      {roomPrices.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Harga khusus tersimpan
                          </p>

                          <div className="space-y-2">
                            {roomPrices.map((item) => (
                              <div
                                key={`${room.id}-${item.date}`}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border bg-pink-50/50 px-3 py-2.5"
                              >
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 shrink-0 text-rose-600" />

                                  <span className="text-sm">
                                    {formatDate(item.date)}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-2">
                                  <span className="text-sm font-semibold text-rose-600">
                                    Rp{' '}
                                    {item.price.toLocaleString(
                                      'id-ID'
                                    )}
                                  </span>

                                  {/* EDIT */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditSpecialPrice(
                                        room.id,
                                        item
                                      )
                                    }
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                    title="Edit harga khusus"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>

                                  {/* DELETE */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteSpecialPrice(
                                        room.id,
                                        item.date
                                      )
                                    }
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    title="Hapus harga khusus"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                          Belum ada harga khusus untuk tipe kamar
                          ini.
                        </div>
                      )}

                      {/* ADD / EDIT SPECIAL PRICE */}
                      <div className="border-t pt-4 space-y-3">
                        <div>
                          <p className="text-sm font-medium">
                            {isEditing
                              ? 'Edit harga khusus'
                              : 'Tambah / ubah harga khusus'}
                          </p>

                          {isEditing && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Kamu sedang mengubah harga khusus
                              untuk tanggal{' '}
                              {formatDate(
                                editingSpecialPrice.originalDate
                              )}
                              .
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                              Tanggal
                            </label>

                            <input
                              type="date"
                              value={
                                specialDateByRoom[room.id] || ''
                              }
                              onChange={(e) =>
                                setSpecialDateByRoom(
                                  (prev) => ({
                                    ...prev,
                                    [room.id]: e.target.value,
                                  })
                                )
                              }
                              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                              Harga khusus / malam
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={
                                specialPriceByRoom[room.id] ||
                                ''
                              }
                              onChange={(e) =>
                                setSpecialPriceByRoom(
                                  (prev) => ({
                                    ...prev,
                                    [room.id]: e.target.value,
                                  })
                                )
                              }
                              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                              placeholder="Contoh: 450000"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              handleAddSpecialPrice(room.id)
                            }
                            disabled={isSaving}
                            className="w-full sm:w-auto"
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />

                            {isSaving
                              ? 'Menyimpan...'
                              : isEditing
                                ? 'Perbarui Harga'
                                : 'Simpan Harga Khusus'}
                          </Button>

                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                handleCancelEditSpecialPrice(
                                  room.id
                                )
                              }
                              disabled={isSaving}
                              className="w-full sm:w-auto"
                            >
                              Batal Edit
                            </Button>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {isEditing
                            ? 'Perubahan hanya berlaku untuk harga khusus kamar ini.'
                            : 'Jika tanggal tersebut sudah memiliki harga khusus, harga lama akan diperbarui.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* =========================
              ACTIONS
          ========================= */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(`/tenant/properties/${id}`)
              }
              disabled={submitting || addingRoom}
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={submitting || addingRoom}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {submitting
                ? 'Menyimpan...'
                : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}