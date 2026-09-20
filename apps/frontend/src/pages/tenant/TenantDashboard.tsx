import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  LayoutDashboard,
  Building2,
  PlusCircle,
  LogOut,
  User as UserIcon,
  Home,
  Pencil,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Eye,
  BarChart3,
  MapPin,
} from 'lucide-react';
import api from '@/services/api';

interface PropertyRoom {
  id: number;
  name: string;
  description?: string | null;
  quantity: number;
  price: string | number;
}

interface Property {
  id: number;
  title: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  address: string;
  rooms?: PropertyRoom[];

  // Fallback untuk response lama jika backend masih mengirim field ini
  price?: string | number;
  period?: string;
  room?: number;
}

interface BookingNight {
  id: number;
  date: string;
  price: string | number;
}

interface BookingUser {
  id: number;
  name: string;
  email: string;
}

interface BookingProperty {
  id: number;
  title: string;
  imageUrl?: string | null;
  address: string;
}

interface BookingRoom {
  id: number;
  name: string;
}

interface TenantBooking {
  id: number;
  bookingCode: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: string | number;
  status: string;
  paymentProof?: string | null;
  paymentDeadline?: string | null;
  createdAt: string;
  user: BookingUser;
  property: BookingProperty;
  room: BookingRoom;
  nights?: BookingNight[];
}

type ActiveTab = 'overview' | 'profile' | 'report';

export default function TenantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  const [bookings, setBookings] = useState<TenantBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [processingBookingId, setProcessingBookingId] = useState<number | null>(
    null
  );

  const [selectedBooking, setSelectedBooking] = useState<TenantBooking | null>(
    null
  );

  // =========================================================
  // HELPERS
  // =========================================================

  const formatPrice = (price: string | number) => {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return 'Rp -';
    }

    return `Rp ${numericPrice.toLocaleString('id-ID')}`;
  };

  const formatDate = (date: string) => {
    if (!date) {
      return '-';
    }

    const dateOnly = date.split('T')[0];

    const [year, month, day] = dateOnly.split('-');

    if (!year || !month || !day) {
      return '-';
    }

    return `${day}/${month}/${year}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'MENUNGGU_PEMBAYARAN':
        return 'Menunggu Pembayaran';

      case 'MENUNGGU_KONFIRMASI':
        return 'Menunggu Konfirmasi';

      case 'DIPROSES':
        return 'Diproses';

      case 'SELESAI':
        return 'Selesai';

      case 'DIBATALKAN':
        return 'Dibatalkan';

      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'MENUNGGU_PEMBAYARAN':
        return 'bg-amber-100 text-amber-700 border-amber-200';

      case 'MENUNGGU_KONFIRMASI':
        return 'bg-blue-100 text-blue-700 border-blue-200';

      case 'DIPROSES':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';

      case 'SELESAI':
        return 'bg-purple-100 text-purple-700 border-purple-200';

      case 'DIBATALKAN':
        return 'bg-red-100 text-red-700 border-red-200';

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPropertyRoom = (property: Property) => {
    return property.rooms?.[0] || null;
  };

  const getPropertyPrice = (property: Property) => {
    const room = getPropertyRoom(property);

    if (room) {
      return room.price;
    }

    return property.price;
  };

  const getPropertyQuantity = (property: Property) => {
    const room = getPropertyRoom(property);

    if (room) {
      return room.quantity;
    }

    return property.room || 0;
  };

  // =========================================================
  // FETCH PROPERTIES
  // =========================================================

  const fetchMyProperties = async () => {
    try {
      setLoadingProperties(true);

      const response = await api.get('/properties/my-properties');

      const propertyData = response.data?.data || [];

      setProperties(propertyData);
    } catch (error) {
      console.error('Gagal memuat properti saya:', error);
      setProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  // =========================================================
  // FETCH TENANT BOOKINGS
  // =========================================================

  const fetchTenantBookings = async () => {
    try {
      setLoadingBookings(true);

      const response = await api.get('/bookings/tenant-bookings');

      setBookings(response.data?.data || []);
    } catch (error) {
      console.error('Gagal memuat booking tenant:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchMyProperties();
    fetchTenantBookings();
  }, []);

  // =========================================================
  // REFRESH DATA WHEN RETURNING TO OVERVIEW
  // =========================================================

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchMyProperties();
      fetchTenantBookings();
    }
  }, [activeTab]);

  // =========================================================
  // PROFILE
  // =========================================================

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage('Profil berhasil diperbarui!');

    setIsEditing(false);

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordMessage('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Semua field password wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak sama.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        'Password baru harus berbeda dari password lama.'
      );
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setPasswordMessage(
        response.data?.message || 'Password berhasil diubah.'
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setPasswordMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Change password error:', error);

      setPasswordError(
        error.response?.data?.message ||
          'Gagal mengubah password. Silakan coba lagi.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // =========================================================
  // APPROVE BOOKING
  // =========================================================

  const handleApproveBooking = async (bookingId: number) => {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menyetujui pembayaran booking ini?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingBookingId(bookingId);

      await api.post(`/bookings/${bookingId}/approve`);

      alert('Pembayaran berhasil disetujui.');

      setSelectedBooking(null);

      await fetchTenantBookings();
    } catch (error: any) {
      console.error('Approve booking error:', error);

      alert(
        error.response?.data?.message || 'Gagal menyetujui pembayaran booking.'
      );
    } finally {
      setProcessingBookingId(null);
    }
  };

  // =========================================================
  // REJECT BOOKING
  // =========================================================

  const handleRejectBooking = async (bookingId: number) => {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menolak pembayaran booking ini? Booking akan dibatalkan.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingBookingId(bookingId);

      await api.post(`/bookings/${bookingId}/reject`);

      alert('Pembayaran ditolak dan booking dibatalkan.');

      setSelectedBooking(null);

      await fetchTenantBookings();
    } catch (error: any) {
      console.error('Reject booking error:', error);

      alert(
        error.response?.data?.message || 'Gagal menolak pembayaran booking.'
      );
    } finally {
      setProcessingBookingId(null);
    }
  };

  // =========================================================
  // COMPLETE BOOKING
  // =========================================================

  const handleCompleteBooking = async (bookingId: number) => {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menandai booking ini sebagai selesai?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingBookingId(bookingId);

      await api.post(`/bookings/${bookingId}/complete`);

      alert('Booking berhasil ditandai sebagai selesai.');

      setSelectedBooking(null);

      await fetchTenantBookings();
    } catch (error: any) {
      console.error('Complete booking error:', error);

      alert(error.response?.data?.message || 'Gagal menyelesaikan booking.');
    } finally {
      setProcessingBookingId(null);
    }
  };

  // =========================================================
  // SALES REPORT DATA
  // =========================================================

  const completedBookings = bookings.filter(
    (booking) => booking.status === 'SELESAI'
  );

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status === 'MENUNGGU_PEMBAYARAN' ||
      booking.status === 'MENUNGGU_KONFIRMASI' ||
      booking.status === 'DIPROSES'
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === 'DIBATALKAN'
  );

  const totalRevenue = completedBookings.reduce(
    (total, booking) => total + Number(booking.totalAmount),
    0
  );

  // =========================================================
  // NAVIGATION HELPERS
  // =========================================================

  const goToOverview = () => {
    setActiveTab('overview');
  };

  const goToProperties = () => {
    setActiveTab('overview');

    window.setTimeout(() => {
      document
        .getElementById('tenant-properties')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const goToBookings = () => {
    setActiveTab('overview');

    window.setTimeout(() => {
      document
        .getElementById('tenant-bookings')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* =====================================================
          HEADER / NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 flex h-[73px] items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm md:px-8">
        <button
          type="button"
          onClick={goToOverview}
          className="flex cursor-pointer items-center gap-2"
        >
          <Sparkles className="h-6 w-6 text-rose-500" />

          <span className="text-xl font-bold tracking-tight text-rose-500">
            YukDiSewa
          </span>
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 sm:inline">
            Pengelola
          </span>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'T'}
            </div>

            <span className="hidden text-sm font-medium text-slate-700 md:inline">
              {user?.name || 'Tenant'}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-slate-50"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          LAYOUT
      ====================================================== */}

      <div className="flex">
        {/* ===================================================
            SIDEBAR
        ==================================================== */}

        <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-64 space-y-2 border-r border-slate-200 p-6 lg:block">
          <button
            type="button"
            onClick={goToOverview}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
              activeTab === 'overview'
                ? 'bg-rose-50 text-rose-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </button>

          <button
            type="button"
            onClick={goToProperties}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Building2 className="h-5 w-5" />
            Properti Saya
          </button>

          <button
            type="button"
            onClick={goToBookings}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <CalendarDays className="h-5 w-5" />
            Booking Masuk
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
              activeTab === 'report'
                ? 'bg-rose-50 text-rose-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Laporan Penjualan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
              activeTab === 'profile'
                ? 'bg-rose-50 text-rose-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserIcon className="h-5 w-5" />
            Profil Saya
          </button>

          <div className="my-4 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Home className="h-5 w-5" />
            Lihat sebagai User
          </button>
        </aside>

        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}

        <main className="min-h-[calc(100vh-73px)] flex-1 bg-slate-50/50 p-6 pb-24 md:p-8 md:pb-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* =================================================
                WELCOME
            ================================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold text-rose-500">
                  YukDiSewa · Pengelola
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Halo, {user?.name || 'Tenant'}! 👋
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Kelola properti dan pantau booking penyewa Anda dengan mudah.
                </p>
              </div>

              <Button
                onClick={() => navigate('/tenant/properties/add')}
                className="w-full bg-rose-500 text-white hover:bg-rose-600 md:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Properti
              </Button>
            </div>

            {/* SUCCESS MESSAGE */}

            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                {successMessage}
              </div>
            )}

            {/* =================================================
                OVERVIEW
            ================================================== */}

            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* =================================================
                    STATISTICS
                ================================================== */}

                <section>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Ringkasan
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Pantau aktivitas properti dan booking Anda.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Total Unit Properti
                          </p>

                          <h3 className="mt-1 text-2xl font-bold text-slate-900">
                            {properties.length}
                          </h3>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                          <Building2 className="h-5 w-5 text-rose-500" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Total Booking
                          </p>

                          <h3 className="mt-1 text-2xl font-bold text-slate-900">
                            {bookings.length}
                          </h3>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                          <CalendarDays className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Menunggu Konfirmasi
                          </p>

                          <h3 className="mt-1 text-2xl font-bold text-blue-600">
                            {
                              bookings.filter(
                                (booking) =>
                                  booking.status === 'MENUNGGU_KONFIRMASI'
                              ).length
                            }
                          </h3>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    PROPERTIES
                ================================================== */}

                <section id="tenant-properties">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Properti Saya
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Kelola properti yang Anda sewakan di YukDiSewa.
                      </p>
                    </div>

                    <Button
                      onClick={() => navigate('/tenant/properties/add')}
                      variant="outline"
                      className="hidden border-rose-200 text-rose-600 hover:bg-rose-50 sm:flex"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah
                    </Button>
                  </div>

                  {loadingProperties ? (
                    <div className="rounded-2xl border border-pink-100 bg-white p-10 text-center shadow-sm">
                      <p className="text-sm text-slate-500">
                        Memuat data unit properti...
                      </p>
                    </div>
                  ) : properties.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-12 text-center shadow-sm">
                      <Building2 className="mx-auto h-10 w-10 text-rose-300" />

                      <h3 className="mt-3 text-base font-semibold text-slate-900">
                        Belum ada unit terdaftar
                      </h3>

                      <p className="mx-auto mt-1 mb-4 max-w-sm text-sm text-slate-500">
                        Mulai tambahkan unit properti pertama Anda agar bisa
                        dikelola dan dilihat penyewa.
                      </p>

                      <Button
                        onClick={() => navigate('/tenant/properties/add')}
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        Tambah Properti Sekarang
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {properties.map((property) => {
                        const room = getPropertyRoom(property);
                        const propertyPrice = getPropertyPrice(property);
                        const propertyQuantity = getPropertyQuantity(property);

                        return (
                          <div
                            key={property.id}
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                          >
                            {/* IMAGE */}

                            <div
                              onClick={() =>
                                navigate(`/tenant/properties/${property.id}`)
                              }
                              className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-rose-50"
                            >
                              {property.imageUrl ? (
                                <img
                                  src={property.imageUrl}
                                  alt={property.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Building2 className="h-12 w-12 text-rose-300" />
                                </div>
                              )}

                              <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-sm">
                                {property.category}
                              </span>

                              <Button
                                onClick={(event) => {
                                  event.stopPropagation();

                                  navigate(
                                    `/tenant/properties/edit/${property.id}`
                                  );
                                }}
                                size="sm"
                                className="absolute top-3 right-3 bg-white/90 text-rose-700 shadow-sm hover:bg-white"
                              >
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Button>
                            </div>

                            {/* INFO */}

                            <div className="space-y-3 p-4">
                              <div>
                                <h3
                                  onClick={() =>
                                    navigate(
                                      `/tenant/properties/${property.id}`
                                    )
                                  }
                                  className="cursor-pointer truncate font-semibold text-slate-900 hover:text-rose-600"
                                >
                                  {property.title}
                                </h3>

                                <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                  <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />

                                  <span className="truncate">
                                    {property.address}
                                  </span>
                                </div>

                                {room?.name && (
                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    Tipe kamar: {room.name}
                                  </p>
                                )}
                              </div>

                              <div className="border-t border-slate-100 pt-3">
                                <div className="flex items-end justify-between gap-3">
                                  <div>
                                    <p className="text-xs text-slate-500">
                                      Harga sewa
                                    </p>

                                    <span className="text-lg font-bold text-rose-600">
                                      {propertyPrice !== undefined
                                        ? formatPrice(propertyPrice)
                                        : 'Rp -'}
                                    </span>

                                    <span className="ml-1 text-xs text-slate-500">
                                      / malam
                                    </span>
                                  </div>

                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                    {propertyQuantity} Unit
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* =================================================
                    BOOKING MASUK
                ================================================== */}

                <section id="tenant-bookings">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Booking Masuk
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Pantau dan konfirmasi booking dari penyewa.
                    </p>
                  </div>

                  {loadingBookings ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                      <p className="text-sm text-slate-500">
                        Memuat data booking...
                      </p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-10 text-center shadow-sm">
                      <CalendarDays className="mx-auto h-10 w-10 text-rose-300" />

                      <h3 className="mt-3 text-base font-semibold text-slate-900">
                        Belum ada booking
                      </h3>

                      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                        Booking dari penyewa akan muncul di sini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-rose-200 hover:shadow-md"
                        >
                          <div className="p-5">
                            {/* BOOKING HEADER */}

                            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start">
                              <div>
                                <p className="text-xs font-medium text-slate-500">
                                  Kode Booking
                                </p>

                                <h3 className="font-bold text-slate-900">
                                  {booking.bookingCode}
                                </h3>
                              </div>

                              <span
                                className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  booking.status
                                )}`}
                              >
                                {getStatusLabel(booking.status)}
                              </span>
                            </div>

                            {/* BOOKING INFORMATION */}

                            <div className="grid grid-cols-1 gap-5 py-5 md:grid-cols-2">
                              {/* PROPERTY */}

                              <div>
                                <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                  Properti
                                </p>

                                <div className="flex gap-3">
                                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-rose-50">
                                    {booking.property.imageUrl ? (
                                      <img
                                        src={booking.property.imageUrl}
                                        alt={booking.property.title}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full items-center justify-center">
                                        <Home className="h-6 w-6 text-rose-300" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-900">
                                      {booking.property.title}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-slate-500">
                                      {booking.room.name}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-slate-500">
                                      {booking.property.address}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* GUEST */}

                              <div>
                                <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                  Penyewa
                                </p>

                                <p className="font-semibold text-slate-900">
                                  {booking.user.name}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {booking.user.email}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {booking.guests} tamu
                                </p>
                              </div>

                              {/* DATE */}

                              <div>
                                <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                  Periode Sewa
                                </p>

                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium text-slate-800">
                                    {formatDate(booking.checkIn)}
                                  </span>

                                  <span className="text-slate-400">→</span>

                                  <span className="font-medium text-slate-800">
                                    {formatDate(booking.checkOut)}
                                  </span>
                                </div>
                              </div>

                              {/* TOTAL */}

                              <div>
                                <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                  Total Pembayaran
                                </p>

                                <p className="text-lg font-bold text-rose-600">
                                  {formatPrice(booking.totalAmount)}
                                </p>
                              </div>
                            </div>

                            {/* ACTION AREA */}

                            {booking.status === 'MENUNGGU_KONFIRMASI' && (
                              <div
                                className="border-t border-slate-100 pt-4"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="font-semibold text-blue-700">
                                      Pembayaran Menunggu Konfirmasi
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                      Periksa bukti pembayaran sebelum
                                      menyetujui booking.
                                    </p>
                                  </div>

                                  {booking.paymentProof && (
                                    <a
                                      href={booking.paymentProof}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(event) =>
                                        event.stopPropagation()
                                      }
                                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                                    >
                                      <Eye className="h-4 w-4" />
                                      Lihat Bukti Pembayaran
                                    </a>
                                  )}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                  <Button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleApproveBooking(booking.id);
                                    }}
                                    disabled={
                                      processingBookingId === booking.id
                                    }
                                    className="bg-emerald-600 text-white hover:bg-emerald-700 sm:flex-1"
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />

                                    {processingBookingId === booking.id
                                      ? 'Memproses...'
                                      : 'Setujui Pembayaran'}
                                  </Button>

                                  <Button
                                    variant="outline"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleRejectBooking(booking.id);
                                    }}
                                    disabled={
                                      processingBookingId === booking.id
                                    }
                                    className="border-red-200 text-red-600 hover:bg-red-50 sm:flex-1"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Tolak Pembayaran
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* DIPROSES */}

                            {booking.status === 'DIPROSES' && (
                              <div
                                className="border-t border-slate-100 pt-4"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                  <p className="text-sm font-medium text-emerald-700">
                                    Pembayaran telah disetujui.
                                  </p>

                                  <p className="mt-1 text-xs text-emerald-600">
                                    Booking sedang diproses.
                                  </p>
                                </div>

                                <Button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleCompleteBooking(booking.id);
                                  }}
                                  disabled={processingBookingId === booking.id}
                                  className="mt-3 w-full bg-purple-600 text-white hover:bg-purple-700"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />

                                  {processingBookingId === booking.id
                                    ? 'Memproses...'
                                    : 'Tandai Selesai'}
                                </Button>
                              </div>
                            )}

                            {/* SELESAI */}

                            {booking.status === 'SELESAI' && (
                              <div
                                className="border-t border-slate-100 pt-4"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
                                  <p className="text-sm font-medium text-purple-700">
                                    Booking telah selesai.
                                  </p>

                                  <p className="mt-1 text-xs text-purple-600">
                                    Transaksi ini sudah selesai diproses.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* DIBATALKAN */}

                            {booking.status === 'DIBATALKAN' && (
                              <div
                                className="border-t border-slate-100 pt-4"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                                  <p className="text-sm font-medium text-red-700">
                                    Booking dibatalkan.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* =================================================
                PROFILE
            ================================================== */}

            {activeTab === 'profile' && (
              <div className="max-w-2xl space-y-6">
                {/* PROFILE INFORMATION */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-sm font-semibold text-rose-500">
                        Akun Pengelola
                      </p>

                      <h2 className="mt-1 text-lg font-semibold text-slate-900">
                        Profil Tenant
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Kelola informasi identitas akun pengelola Anda.
                      </p>
                    </div>

                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        Edit Profil
                      </Button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-500">
                            Nama Lengkap
                          </span>

                          <p className="text-sm font-semibold text-slate-900">
                            {name}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-500">
                            Email Akun
                          </span>

                          <p className="text-sm font-semibold text-slate-900">
                            {email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleUpdateProfile}
                      className="mt-6 space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>

                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          type="submit"
                          className="bg-rose-500 text-white hover:bg-rose-600"
                        >
                          Simpan Perubahan
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* CHANGE PASSWORD */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-sm font-semibold text-rose-500">
                      Keamanan Akun
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      Ubah Password
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Gunakan password baru yang kuat untuk menjaga keamanan
                      akun Anda.
                    </p>
                  </div>

                  {passwordMessage && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                      {passwordMessage}
                    </div>
                  )}

                  {passwordError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                      {passwordError}
                    </div>
                  )}

                  <form
                    onSubmit={handleChangePassword}
                    className="mt-6 space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        Password Lama
                      </Label>

                      <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        placeholder="Masukkan password lama"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">
                        Password Baru
                      </Label>

                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        placeholder="Minimal 6 karakter"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Konfirmasi Password Baru
                      </Label>

                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        placeholder="Ulangi password baru"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isChangingPassword}
                        className="bg-rose-500 text-white hover:bg-rose-600"
                      >
                        {isChangingPassword
                          ? 'Menyimpan...'
                          : 'Ubah Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* =================================================
                SALES REPORT
            ================================================== */}

            {activeTab === 'report' && (
              <div className="space-y-8">
                {/* REPORT HEADER */}

                <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50">
                      <BarChart3 className="h-5 w-5 text-rose-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-rose-500">
                        YukDiSewa · Pengelola
                      </p>

                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Laporan Penjualan
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Pantau pendapatan dan transaksi properti Anda.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUMMARY */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                      Total Pendapatan
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-rose-600">
                      {formatPrice(totalRevenue)}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Dari booking selesai
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                      Transaksi Selesai
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                      {completedBookings.length}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Booking berhasil diselesaikan
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                      Booking Aktif
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-blue-600">
                      {activeBookings.length}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Masih dalam proses
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                      Dibatalkan
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-red-600">
                      {cancelledBookings.length}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Booking yang dibatalkan
                    </p>
                  </div>
                </div>

                {/* TRANSACTION LIST */}

                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Riwayat Penjualan
                    </h3>

                    <p className="text-sm text-slate-500">
                      Daftar transaksi yang telah selesai.
                    </p>
                  </div>

                  {completedBookings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-10 text-center shadow-sm">
                      <BarChart3 className="mx-auto mb-3 h-10 w-10 text-rose-300" />

                      <p className="text-sm font-medium text-slate-900">
                        Belum ada transaksi yang selesai.
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Transaksi akan muncul di laporan setelah booking selesai
                        diproses.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start">
                            <div>
                              <p className="text-xs text-slate-500">
                                Kode Booking
                              </p>

                              <p className="font-bold text-slate-900">
                                {booking.bookingCode}
                              </p>
                            </div>

                            <span className="w-fit rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                              Selesai
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-xs text-slate-500">Penyewa</p>

                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {booking.user.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {booking.user.email}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-500">Properti</p>

                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {booking.property.title}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {booking.room.name}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-500">
                                Periode Sewa
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {formatDate(booking.checkIn)} →{' '}
                                {formatDate(booking.checkOut)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-500">
                                Pendapatan
                              </p>

                              <p className="mt-1 text-sm font-bold text-rose-600">
                                {formatPrice(booking.totalAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <p className="text-xs text-slate-500">
                              Transaksi dibuat
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {formatDate(booking.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          <button
            type="button"
            onClick={goToOverview}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
              activeTab === 'overview'
                ? 'bg-rose-50 text-rose-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={goToProperties}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium text-slate-500 transition hover:bg-slate-50"
          >
            <Building2 className="h-5 w-5" />
            <span>Properti</span>
          </button>

          <button
            type="button"
            onClick={goToBookings}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium text-slate-500 transition hover:bg-slate-50"
          >
            <CalendarDays className="h-5 w-5" />
            <span>Booking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
              activeTab === 'report'
                ? 'bg-rose-50 text-rose-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Laporan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
              activeTab === 'profile'
                ? 'bg-rose-50 text-rose-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <UserIcon className="h-5 w-5" />
            <span>Profil</span>
          </button>
        </div>
      </nav>

      {/* =====================================================
          BOOKING DETAIL MODAL
      ====================================================== */}

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Detail Booking
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {selectedBooking.bookingCode}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Tutup detail booking"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-5">
              {/* STATUS */}

              <div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                    selectedBooking.status
                  )}`}
                >
                  {getStatusLabel(selectedBooking.status)}
                </span>
              </div>

              {/* PROPERTY */}

              <section>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Informasi Properti
                </h3>

                <div className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-rose-50">
                    {selectedBooking.property.imageUrl ? (
                      <img
                        src={selectedBooking.property.imageUrl}
                        alt={selectedBooking.property.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Home className="h-7 w-7 text-rose-300" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {selectedBooking.property.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {selectedBooking.room.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedBooking.property.address}
                    </p>
                  </div>
                </div>
              </section>

              {/* GUEST */}

              <section>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Informasi Penyewa
                </h3>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Nama</p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedBooking.user.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Email</p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedBooking.user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Jumlah Tamu</p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedBooking.guests} tamu
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Tanggal Booking</p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(selectedBooking.createdAt)}
                    </p>
                  </div>
                </div>
              </section>

              {/* RENTAL PERIOD */}

              <section>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Periode Sewa
                </h3>

                <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="text-xs text-slate-500">Check-in</p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDate(selectedBooking.checkIn)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Check-out</p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDate(selectedBooking.checkOut)}
                    </p>
                  </div>
                </div>
              </section>

              {/* NIGHTLY PRICES */}

              <section>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Rincian Harga
                </h3>

                <div className="divide-y rounded-xl border border-slate-200">
                  {(selectedBooking.nights ?? []).length > 0 ? (
                    (selectedBooking.nights ?? []).map((night) => (
                      <div
                        key={night.id}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <span className="text-slate-600">
                          {formatDate(night.date)}
                        </span>

                        <span className="font-medium text-slate-900">
                          {formatPrice(night.price)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-slate-500">
                      Tidak ada rincian harga tersedia.
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4">
                    <span className="font-semibold text-slate-900">Total</span>

                    <span className="text-lg font-bold text-rose-600">
                      {formatPrice(selectedBooking.totalAmount)}
                    </span>
                  </div>
                </div>
              </section>

              {/* PAYMENT DEADLINE */}

              {selectedBooking.paymentDeadline && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Batas Pembayaran
                  </h3>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-700">
                      {new Date(selectedBooking.paymentDeadline).toLocaleString(
                        'id-ID',
                        {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }
                      )}
                    </p>
                  </div>
                </section>
              )}

              {/* PAYMENT PROOF */}

              {selectedBooking.paymentProof && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Bukti Pembayaran
                  </h3>

                  <a
                    href={selectedBooking.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4" />
                    Lihat Bukti Pembayaran
                  </a>
                </section>
              )}

              {/* ACTIONS */}

              {selectedBooking.status === 'MENUNGGU_KONFIRMASI' && (
                <section className="border-t border-slate-100 pt-5">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={() => handleApproveBooking(selectedBooking.id)}
                      disabled={processingBookingId === selectedBooking.id}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 sm:flex-1"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />

                      {processingBookingId === selectedBooking.id
                        ? 'Memproses...'
                        : 'Setujui Pembayaran'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleRejectBooking(selectedBooking.id)}
                      disabled={processingBookingId === selectedBooking.id}
                      className="border-red-200 text-red-600 hover:bg-red-50 sm:flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Tolak Pembayaran
                    </Button>
                  </div>
                </section>
              )}

              {/* DIPROSES */}

              {selectedBooking.status === 'DIPROSES' && (
                <section className="border-t border-slate-100 pt-5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-medium text-emerald-700">
                      Pembayaran telah disetujui.
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                      Booking sedang diproses.
                    </p>
                  </div>

                  <Button
                    onClick={() => handleCompleteBooking(selectedBooking.id)}
                    disabled={processingBookingId === selectedBooking.id}
                    className="mt-3 w-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />

                    {processingBookingId === selectedBooking.id
                      ? 'Memproses...'
                      : 'Tandai Selesai'}
                  </Button>
                </section>
              )}

              {/* SELESAI */}

              {selectedBooking.status === 'SELESAI' && (
                <section className="border-t border-slate-100 pt-5">
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <p className="text-sm font-medium text-purple-700">
                      Booking telah selesai.
                    </p>

                    <p className="mt-1 text-xs text-purple-600">
                      Transaksi ini sudah selesai diproses.
                    </p>
                  </div>
                </section>
              )}

              {/* DIBATALKAN */}

              {selectedBooking.status === 'DIBATALKAN' && (
                <section>
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">
                      Booking dibatalkan.
                    </p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}