import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Search,
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Sparkles,
  Home,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { api } from '@/lib/axios';

interface Property {
  id: number;
  title: string;
  category: string;
  imageUrl: string | null;
  address: string;
  rooms: {
    id: number;
    name: string;
    quantity: number;
    price: string | number;
  }[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyLoading, setPropertyLoading] = useState(true);

  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guestCount, setGuestCount] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    async function fetchProperties() {
      try {
        setPropertyLoading(true);

        const response = await api.get('/properties');

        setProperties(response.data.data || []);
      } catch (error) {
        console.error('Get properties error:', error);
      } finally {
        setPropertyLoading(false);
      }
    }

    fetchProperties();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-medium text-slate-500">
        Memuat sesi...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDateParam = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (location.trim()) {
      params.append('location', location.trim());
    }

    if (dateRange?.from) {
      params.append('checkIn', formatDateParam(dateRange.from));
    }

    if (dateRange?.to) {
      params.append('checkOut', formatDateParam(dateRange.to));
    }

    params.append('guests', String(guestCount));

    setShowCalendar(false);

    navigate(`/explore?${params.toString()}`);
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleBookingClick = (propertyId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    navigate(`/properties/${propertyId}`);
  };

  const visibleProperties = properties.slice(0, 8);

  function formatPrice(price: number | string) {
    return new Intl.NumberFormat('id-ID').format(Number(price));
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate('/dashboard')}
        >
          <Sparkles className="h-6 w-6 text-rose-500" />

          <span className="text-xl font-bold tracking-tight text-rose-500">
            YukDiSewa
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                {user.name || user.email}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-slate-50"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-slate-700 hover:text-rose-500"
              >
                Masuk
              </Button>

              <Button
                onClick={() => navigate('/register')}
                className="rounded-full bg-rose-500 px-4 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Daftar
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* LAYOUT */}
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="hidden min-h-[calc(100vh-73px)] w-64 space-y-2 border-r border-slate-200 p-6 lg:block">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex w-full items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 font-medium text-rose-600 transition"
          >
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Home className="h-5 w-5" />
            Jelajahi Properti
          </button>

          {user?.role === 'USER' && (
            <button
              onClick={() => navigate('/transactions')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Calendar className="h-5 w-5" />
              Transaksi Saya
            </button>
          )}

          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Users className="h-5 w-5" />
              Masuk untuk Booking
            </button>
          )}

          <button
            onClick={() => {
              if (user) {
                navigate('/settings');
              } else {
                navigate('/login');
              }
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-h-[calc(100vh-73px)] flex-1 bg-slate-50/50 p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* WELCOME */}
            <div>
              <p className="text-sm font-semibold text-rose-500">YukDiSewa</p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                {user
                  ? `Selamat datang, ${user.name || 'User'}!`
                  : 'Temukan tempat tinggal yang cocok untukmu'}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Cari rumah, kost, apartemen, dan properti lainnya dengan mudah.
              </p>
            </div>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="relative flex flex-col gap-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-md md:flex-row md:items-center"
            >
              {/* LOKASI */}
              <div className="flex w-full items-center gap-3 border-b border-slate-200 px-3 py-2 md:w-[30%] md:border-r md:border-b-0">
                <MapPin className="h-5 w-5 shrink-0 text-rose-500" />

                <div className="w-full">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Lokasi
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Jakarta Selatan"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* TANGGAL */}
              <div className="relative w-full md:flex-1">
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left"
                >
                  <CalendarDays className="h-5 w-5 shrink-0 text-rose-500" />

                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      Check-in & Check-out
                    </span>

                    <span
                      className={`block truncate text-sm ${
                        dateRange?.from ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {dateRange?.from
                        ? dateRange.to
                          ? `${format(dateRange.from, 'dd MMM yyyy', {
                              locale: id,
                            })} - ${format(dateRange.to, 'dd MMM yyyy', {
                              locale: id,
                            })}`
                          : `${format(dateRange.from, 'dd MMM yyyy', {
                              locale: id,
                            })} - Pilih check-out`
                        : 'Pilih tanggal menginap'}
                    </span>
                  </div>
                </button>

                {showCalendar && (
                  <div className="absolute top-full left-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      locale={id}
                      numberOfMonths={1}
                      disabled={{ before: new Date() }}
                    />

                    <div className="mt-2 flex justify-end border-t border-slate-100 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowCalendar(false)}
                        className="bg-rose-600 text-white hover:bg-rose-700"
                      >
                        Selesai
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* JUMLAH TAMU */}
              <div className="flex w-full items-center gap-3 border-b border-slate-200 px-3 py-2 md:w-[20%] md:border-l md:border-b-0">
                <Users className="h-5 w-5 shrink-0 text-rose-500" />

                <div className="w-full">
                  <label
                    htmlFor="guestCount"
                    className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase"
                  >
                    Jumlah Tamu
                  </label>

                  <select
                    id="guestCount"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-transparent text-sm text-slate-800 outline-none"
                  >
                    {Array.from({ length: 10 }, (_, index) => index + 1).map(
                      (guest) => (
                        <option key={guest} value={guest}>
                          {guest} {guest === 1 ? 'tamu' : 'tamu'}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* SEARCH BUTTON */}
              <Button
                type="submit"
                className="w-full bg-rose-500 text-white hover:bg-rose-600 md:w-auto"
              >
                <Search className="mr-2 h-4 w-4" />
                Cari
              </Button>
            </form>

            {/* PROPERTY LIST */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Rekomendasi Penginapan
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Temukan properti yang tersedia di YukDiSewa.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate('/explore')}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Lihat Semua
                </Button>
              </div>

              {propertyLoading ? (
                <div className="rounded-2xl border border-pink-100 bg-white p-10 text-center shadow-sm">
                  Memuat properti...
                </div>
              ) : visibleProperties.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-10 text-center shadow-sm">
                  <Home className="mx-auto h-10 w-10 text-rose-300" />

                  <p className="mt-3 text-sm text-slate-500">
                    Belum ada properti yang tersedia.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {visibleProperties.map((property) => (
                    <div
                      key={property.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* IMAGE */}
                      <div
                        onClick={() => handlePropertyClick(property.id)}
                        className="relative aspect-square cursor-pointer overflow-hidden bg-rose-50"
                      >
                        {property.imageUrl ? (
                          <img
                            src={property.imageUrl}
                            alt={property.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Home className="h-12 w-12 text-rose-300" />
                          </div>
                        )}

                        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-sm">
                          {property.category}
                        </span>
                      </div>

                      {/* INFO */}
                      <div className="space-y-3 p-4">
                        <div>
                          <h3
                            onClick={() => handlePropertyClick(property.id)}
                            className="cursor-pointer truncate font-semibold text-slate-900 hover:text-rose-600"
                          >
                            {property.title}
                          </h3>

                          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-rose-500" />

                            <span className="truncate">{property.address}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                          <p className="text-xs text-slate-500">Mulai dari</p>

                          <div className="mt-1 flex items-end justify-between gap-2">
                            <div>
                              <span className="text-lg font-bold text-rose-600">
                                Rp{' '}
                                {property.rooms.length > 0
                                  ? formatPrice(property.rooms[0].price)
                                  : '-'}
                              </span>

                              {property.rooms.length > 0 && (
                                <span className="ml-1 text-xs text-slate-500">
                                  / malam
                                </span>
                              )}
                            </div>

                            <Button
                              size="sm"
                              onClick={() => handleBookingClick(property.id)}
                              className="bg-rose-500 text-white hover:bg-rose-600"
                            >
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}