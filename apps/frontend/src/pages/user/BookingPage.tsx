import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, Home, MapPin, Users } from 'lucide-react';

interface Room {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  maxGuests: number;
  availableQuantity: number;
  price: string | number;
}

interface NightlyPrice {
  date: string;
  price: string | number;
}

interface Property {
  id: number;
  title: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  address: string;
  rooms: Room[];
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const propertyId = searchParams.get('propertyId') || '';
  const roomId = searchParams.get('roomId') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [nightlyPrices, setNightlyPrices] = useState<NightlyPrice[]>([]);
  const [guestCount, setGuestCount] = useState(2);

  const selectedRoom = useMemo(() => {
    if (!property || !roomId) {
      return null;
    }

    return property.rooms.find((room) => room.id === Number(roomId)) || null;
  }, [property, roomId]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    const difference = end.getTime() - start.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  const totalAmount = nightlyPrices.reduce(
    (total, night) => total + Number(night.price),
    0
  );

  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true);
        setError('');

        const numericPropertyId = Number(propertyId);

        if (!Number.isInteger(numericPropertyId)) {
          setError('ID properti tidak valid.');
          setLoading(false);
          return;
        }

        const response = await api.get('/properties/' + numericPropertyId, {
          params: {
            checkIn,
            checkOut,
          },
        });

        setProperty(response.data.data);
      } catch (error) {
        console.error('Get booking property error:', error);

        setError('Gagal mengambil data properti. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }

    if (!propertyId) {
      setError('Data properti tidak ditemukan.');
      setLoading(false);
      return;
    }

    fetchProperty();
  }, [propertyId, checkIn, checkOut]);

  useEffect(() => {
    if (!selectedRoom) {
      return;
    }

    const maxGuests = Math.max(Number(selectedRoom.maxGuests) || 1, 1);

    setGuestCount((current) => {
      if (current < 1) {
        return 1;
      }

      if (current > maxGuests) {
        return maxGuests;
      }

      return current;
    });
  }, [selectedRoom]);

  useEffect(() => {
    async function fetchNightlyPrices() {
      try {
        if (!roomId || !checkIn || !checkOut) {
          return;
        }

        const response = await api.get('/bookings/price-preview', {
          params: {
            roomId: Number(roomId),
            checkIn,
            checkOut,
          },
        });

        const prices = response.data.data.map(
          (item: { date: string; price: string | number }) => ({
            date: item.date.split('T')[0],
            price: item.price,
          })
        );

        setNightlyPrices(prices);
      } catch (error) {
        console.error('Get nightly prices error:', error);
        setNightlyPrices([]);
      }
    }

    fetchNightlyPrices();
  }, [roomId, checkIn, checkOut]);

  function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID').format(price);
  }

  function formatDate(date: string) {
    if (!date) {
      return '-';
    }

    const [year, month, day] = date.split('-').map(Number);

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  }

  function handleBack() {
    navigate(-1);
  }

  const handleCreateBooking = async () => {
    if (!selectedRoom) {
      alert('Kamar yang dipilih tidak ditemukan.');
      return;
    }

    if (!checkIn || !checkOut || nights <= 0) {
      alert('Tanggal menginap tidak valid.');
      return;
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      alert('Jumlah tamu tidak valid.');
      return;
    }

    if (guestCount > selectedRoom.maxGuests) {
      alert(`Room ini maksimal untuk ${selectedRoom.maxGuests} tamu.`);
      return;
    }

    try {
      setBookingLoading(true);

      const response = await api.post('/bookings', {
        propertyId: Number(propertyId),
        roomId: Number(roomId),
        checkIn,
        checkOut,
        guests: guestCount,
      });

      const bookingId = response.data.data.id;

      if (bookingId) {
        navigate(`/transactions?bookingId=${bookingId}`);
        return;
      }

      navigate('/transactions');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membuat booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-pink-100 bg-white p-12 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">
              Memuat data pemesanan...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property || !selectedRoom) {
    return (
      <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-sm text-rose-700">
              {error || 'Kamar yang dipilih tidak ditemukan.'}
            </p>

            <Button
              onClick={handleBack}
              className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
            >
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (nights <= 0) {
    return (
      <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-sm text-rose-700">
              Tanggal check-out harus setelah check-in.
            </p>

            <Button
              onClick={handleBack}
              className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
            >
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Pesan Kamar
          </h1>

          <p className="text-muted-foreground mt-1 text-sm">
            Periksa detail pemesanan sebelum melanjutkan.
          </p>
        </div>

        {/* Property & Room */}
        <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
          <div className="h-52 w-full bg-rose-50 md:h-64">
            {property.imageUrl ? (
              <img
                src={property.imageUrl}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-rose-300">
                <Home className="h-16 w-16" />
              </div>
            )}
          </div>

          <div className="space-y-4 p-6">
            <div>
              <span className="inline-block rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                {property.category}
              </span>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {property.title}
              </h2>

              <div className="text-muted-foreground mt-2 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{property.address}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="font-semibold text-slate-900">
                {selectedRoom.name}
              </h3>

              {selectedRoom.description && (
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {selectedRoom.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-rose-500" />
                  <span>Maksimal {selectedRoom.maxGuests} tamu</span>
                </div>

                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-rose-500" />
                  <span>{selectedRoom.availableQuantity} unit tersedia</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stay Details */}
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Detail menginap</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-rose-50 p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-rose-500" />

                <p className="text-sm font-semibold text-slate-900">Check-in</p>
              </div>

              <p className="mt-2 text-sm text-slate-700">
                {formatDate(checkIn)}
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-rose-500" />

                <p className="text-sm font-semibold text-slate-900">
                  Check-out
                </p>
              </div>

              <p className="mt-2 text-sm text-slate-700">
                {formatDate(checkOut)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-rose-500" />

                <p className="text-sm font-semibold text-slate-900">
                  Jumlah tamu
                </p>
              </div>

              <select
                value={guestCount}
                onChange={(event) => setGuestCount(Number(event.target.value))}
                className="mt-3 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              >
                {Array.from(
                  {
                    length: Math.max(Number(selectedRoom.maxGuests) || 1, 1),
                  },
                  (_, index) => index + 1
                ).map((guest) => (
                  <option key={guest} value={guest}>
                    {guest} {guest === 1 ? 'tamu' : 'tamu'}
                  </option>
                ))}
              </select>

              <p className="text-muted-foreground mt-2 text-xs">
                Maksimal {selectedRoom.maxGuests} tamu untuk room ini.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Durasi</span>

                <span className="font-semibold text-slate-900">
                  {nights} malam
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Ringkasan harga</h2>

          <div className="mt-4 space-y-3">
            {nightlyPrices.map((night) => {
              const isSpecialPrice =
                Number(night.price) !== Number(selectedRoom.price);

              return (
                <div
                  key={night.date}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="text-slate-700">{formatDate(night.date)}</p>

                    {isSpecialPrice && (
                      <p className="text-xs font-medium text-rose-600">
                        Harga khusus
                      </p>
                    )}
                  </div>

                  <span
                    className={
                      isSpecialPrice
                        ? 'font-semibold text-rose-600'
                        : 'font-medium text-slate-900'
                    }
                  >
                    Rp {formatPrice(Number(night.price))}
                  </span>
                </div>
              );
            })}

            {nightlyPrices.length === 0 && (
              <div className="rounded-xl bg-rose-50 p-4 text-center">
                <p className="text-sm text-rose-700">
                  Harga belum berhasil dimuat.
                </p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Harga dasar / malam
                </span>

                <span className="font-medium text-slate-900">
                  Rp {formatPrice(Number(selectedRoom.price))}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Durasi</span>

                <span className="font-medium text-slate-900">
                  {nights} malam
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Total</span>

                <span className="text-2xl font-bold text-rose-600">
                  Rp {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-rose-600 py-6 text-base font-semibold text-white hover:bg-rose-700"
          onClick={handleCreateBooking}
          disabled={bookingLoading || nightlyPrices.length !== nights}
        >
          {bookingLoading ? 'Memproses...' : 'Lanjutkan Pemesanan'}
        </Button>
      </div>
    </div>
  );
}
