import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  Search,
  LogOut,
  MapPin,
  ReceiptText,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { api } from '@/lib/axios';

interface Booking {
  id: number;
  bookingCode: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: string | number;
  status: string;
  property: {
    id: number;
    title: string;
    category: string;
    imageUrl: string | null;
    address: string;
  };
  room: {
    id: number;
    name: string;
    description: string | null;
  };
}

interface RecommendedProperty {
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

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLoading, setBookingLoading] = useState(true);

  const [recommendedProperties, setRecommendedProperties] = useState<
    RecommendedProperty[]
  >([]);
  const [recommendationLoading, setRecommendationLoading] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (location) {
      params.append('location', location);
    }

    if (dateRange?.from) {
      const year = dateRange.from.getFullYear();
      const month = String(dateRange.from.getMonth() + 1).padStart(2, '0');
      const day = String(dateRange.from.getDate()).padStart(2, '0');

      params.append('checkIn', `${year}-${month}-${day}`);
    }

    if (dateRange?.to) {
      const year = dateRange.to.getFullYear();
      const month = String(dateRange.to.getMonth() + 1).padStart(2, '0');
      const day = String(dateRange.to.getDate()).padStart(2, '0');

      params.append('checkOut', `${year}-${month}-${day}`);
    }

    navigate(`/explore?${params.toString()}`);
  };

  useEffect(() => {
    async function fetchBookings() {
      try {
        setBookingLoading(true);

        const response = await api.get('/bookings/my-bookings');

        setBookings(response.data.data || []);
      } catch (error) {
        console.error('Get dashboard bookings error:', error);
      } finally {
        setBookingLoading(false);
      }
    }

    fetchBookings();
  }, []);

  useEffect(() => {
    async function fetchRecommendedProperties() {
      try {
        setRecommendationLoading(true);

        const response = await api.get('/properties');

        setRecommendedProperties((response.data.data || []).slice(0, 4));
      } catch (error) {
        console.error('Get recommended properties error:', error);
      } finally {
        setRecommendationLoading(false);
      }
    }

    fetchRecommendedProperties();
  }, []);

  function formatPrice(price: number | string) {
    return new Intl.NumberFormat('id-ID').format(Number(price));
  }

  function formatBookingDate(date: string) {
    if (!date) {
      return '-';
    }

    const dateOnly = date.split('T')[0];
    const [year, month, day] = dateOnly.split('-').map(Number);

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  }

  function getStatusLabel(status: string) {
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
  }

  function getStatusClass(status: string) {
    switch (status) {
      case 'MENUNGGU_PEMBAYARAN':
        return 'bg-amber-100 text-amber-700';

      case 'MENUNGGU_KONFIRMASI':
        return 'bg-blue-100 text-blue-700';

      case 'DIPROSES':
        return 'bg-violet-100 text-violet-700';

      case 'SELESAI':
        return 'bg-emerald-100 text-emerald-700';

      case 'DIBATALKAN':
        return 'bg-slate-100 text-slate-600';

      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  const latestBookings = bookings.slice(0, 3);

  return (
    <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="bg-card flex flex-col gap-4 rounded-xl border border-pink-100 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <span className="mb-2 inline-block rounded-md bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
              Dashboard Pencari Properti
            </span>

            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Selamat datang, {user?.name || 'User'}! ✨
            </h1>

            <p className="text-muted-foreground mt-1 text-sm">
              Temukan tempat tinggal impian dan kelola riwayat pemesanan Anda.
            </p>
          </div>

          <Button
            onClick={logout}
            variant="outline"
            className="border-input text-muted-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="relative flex flex-col items-center gap-3 rounded-2xl border border-pink-100 bg-white p-3 shadow-md md:flex-row"
        >
          <div className="flex w-full items-center gap-2 border-b border-slate-200 px-3 py-2 md:w-1/2 md:border-r md:border-b-0">
            <MapPin className="h-5 w-5 text-rose-500" />

            <div className="w-full">
              <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Lokasi Tujuan
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mau cari kos/properti di mana?"
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="relative w-full md:w-1/2">
            <div
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex cursor-pointer items-center gap-2 px-3 py-2"
            >
              <CalendarIcon className="h-5 w-5 text-rose-500" />

              <div className="w-full">
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Tanggal Menginap
                </label>

                <p className="truncate text-sm text-slate-800">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'dd MMM', {
                        locale: id,
                      })} - ${format(dateRange.to, 'dd MMM yyyy', {
                        locale: id,
                      })}`
                    ) : (
                      format(dateRange.from, 'dd MMM yyyy', {
                        locale: id,
                      })
                    )
                  ) : (
                    <span className="text-slate-400">
                      Pilih tanggal check-in & out
                    </span>
                  )}
                </p>
              </div>
            </div>

            {showCalendar && (
              <div className="absolute top-full right-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
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
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-rose-600 text-white hover:bg-rose-700 md:w-auto"
          >
            <Search className="mr-2 h-4 w-4" />
            Cari
          </Button>
        </form>

        {/* Rekomendasi */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Rekomendasi Penginapan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Temukan properti terbaru yang bisa langsung kamu pesan.
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

          {recommendationLoading ? (
            <div className="rounded-2xl border border-pink-100 bg-white p-8 text-center shadow-sm">
              Memuat rekomendasi...
            </div>
          ) : recommendedProperties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center shadow-sm">
              <MapPin className="mx-auto h-10 w-10 text-rose-300" />

              <p className="mt-3 text-sm text-slate-500">
                Belum ada properti tersedia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {recommendedProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-48 bg-rose-50">
                    {property.imageUrl ? (
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-rose-300">
                        <MapPin className="h-12 w-12" />
                      </div>
                    )}

                    <span className="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-rose-700">
                      {property.category}
                    </span>
                  </div>

                  <div className="space-y-3 p-5">
                    <div>
                      <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                        {property.title}
                      </h3>

                      <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-4 w-4 text-rose-500" />

                        <span className="line-clamp-1">{property.address}</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-xs text-slate-500">Mulai dari</p>

                        <p className="text-lg font-bold text-rose-600">
                          Rp{' '}
                          {property.rooms.length > 0
                            ? formatPrice(property.rooms[0].price)
                            : '-'}
                        </p>

                        <p className="text-xs text-slate-500">per malam</p>
                      </div>

                      <Button
                        size="sm"
                        className="bg-rose-600 text-white hover:bg-rose-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/properties/${property.id}`);
                        }}
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Transaksi */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Transaksi Saya
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pantau status dan detail pemesanan Anda.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/transactions')}
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Lihat Semua Transaksi
            </Button>
          </div>

          {bookingLoading ? (
            <div className="rounded-2xl border border-pink-100 bg-white p-8 text-center shadow-sm">
              Memuat transaksi...
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-pink-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <ReceiptText className="h-6 w-6" />
              </div>

              <h3 className="text-base font-semibold">Belum ada transaksi</h3>

              <p className="mt-1 mb-6 text-sm text-slate-500">
                Setelah melakukan pemesanan, transaksi akan muncul di sini.
              </p>

              <Button
                variant="outline"
                onClick={() => navigate('/explore')}
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                Jelajahi Penginapan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {latestBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="h-48 w-full bg-rose-50 md:h-auto md:w-52">
                      {booking.property.imageUrl ? (
                        <img
                          src={booking.property.imageUrl}
                          alt={booking.property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-rose-300">
                          <CalendarIcon className="h-12 w-12" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                      <div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                          <div>
                            <span className="inline-block rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                              {booking.property.category}
                            </span>

                            <h3 className="mt-2 text-lg font-bold">
                              {booking.property.title}
                            </h3>
                          </div>

                          <span
                            className={`inline-flex w-fit items-center justify-center rounded-full px-3 py-1.5 text-center text-xs leading-none font-semibold ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {booking.room.name}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-rose-500" />

                            <span>
                              {formatBookingDate(booking.checkIn)} -{' '}
                              {formatBookingDate(booking.checkOut)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <ReceiptText className="h-4 w-4 text-rose-500" />

                            <span>{booking.bookingCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs text-slate-500">Total</p>

                          <p className="text-xl font-bold text-rose-600">
                            Rp {formatPrice(booking.totalAmount)}
                          </p>
                        </div>

                        <Button
                          onClick={() =>
                            navigate(`/transactions?bookingId=${booking.id}`)
                          }
                          className="bg-rose-600 text-white hover:bg-rose-700"
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {bookings.length > 3 && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/transactions')}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Lihat Semua {bookings.length} Transaksi
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
