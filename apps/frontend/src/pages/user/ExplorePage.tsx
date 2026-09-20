import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MapPin,
  Home,
  Users,
  Search,
  Star,
} from 'lucide-react';

interface Room {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  maxGuests: number;
  price: string | number;
}

interface Property {
  id: number;
  title: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  address: string;
  averageRating?: number;
  reviewCount?: number;
  rooms: Room[];
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '2';

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/properties/search', {
          params: {
            location: location || undefined,
            checkIn: checkIn || undefined,
            checkOut: checkOut || undefined,
            guests: guests || undefined,
          },
        });

        setProperties(response.data.data || []);
      } catch (error) {
        console.error('Search properties error:', error);
        setError('Gagal mencari properti. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }

    if (!checkIn || !checkOut) {
      setLoading(false);
      setError(
        'Silakan pilih tanggal check-in dan check-out terlebih dahulu.'
      );
      return;
    }

    fetchProperties();
  }, [location, checkIn, checkOut, guests]);

  function formatPrice(price: string | number) {
    return new Intl.NumberFormat('id-ID').format(Number(price));
  }

  function formatDate(date: string) {
    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  function handleBack() {
    navigate('/user/dashboard');
  }

  function handleDetail(propertyId: number) {
    const params = new URLSearchParams();

    if (checkIn) {
      params.set('checkIn', checkIn);
    }

    if (checkOut) {
      params.set('checkOut', checkOut);
    }

    if (guests) {
      params.set('guests', guests);
    }

    navigate('/properties/' + propertyId + '?' + params.toString());
  }

  return (
    <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Jelajahi Properti
            </h1>

            <p className="text-muted-foreground text-sm">
              Temukan properti yang sesuai dengan kebutuhanmu.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-pink-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {location && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="h-4 w-4 text-rose-500" />

                <span>
                  <span className="text-slate-500">Lokasi:</span>{' '}
                  <span className="font-semibold">{location}</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Search className="h-4 w-4 text-rose-500" />

              <span>
                <span className="text-slate-500">Menginap:</span>{' '}
                <span className="font-semibold">
                  {formatDate(checkIn)}
                  {' – '}
                  {formatDate(checkOut)}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Users className="h-4 w-4 text-rose-500" />

              <span>
                <span className="text-slate-500">Tamu:</span>{' '}
                <span className="font-semibold">
                  {guests} {Number(guests) === 1 ? 'tamu' : 'tamu'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-pink-100 bg-white p-12 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">
              Mencari properti yang tersedia...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm text-rose-700">{error}</p>

            <Button
              onClick={handleBack}
              className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
            >
              Kembali ke Pencarian
            </Button>
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="rounded-xl border border-dashed border-pink-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Home className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-base font-semibold">
              Properti tidak ditemukan
            </h2>

            <p className="text-muted-foreground mt-1 text-sm">
              Tidak ada properti yang tersedia untuk lokasi, tanggal, dan
              jumlah tamu yang kamu pilih.
            </p>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-foreground text-lg font-semibold">
                {properties.length} properti ditemukan
              </h2>

              <p className="text-muted-foreground text-sm">
                Menampilkan properti yang tersedia untuk periode dan jumlah
                tamu pilihanmu.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => {
                const firstRoom = property.rooms[0];

                return (
                  <div
                    key={property.id}
                    className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="h-48 w-full bg-rose-50">
                      {property.imageUrl ? (
                        <img
                          src={property.imageUrl}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-rose-300">
                          <Home className="h-12 w-12" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <span className="inline-block rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                          {property.category}
                        </span>

                        <h2 className="mt-2 line-clamp-1 text-lg font-semibold text-slate-900">
                          {property.title}
                        </h2>

                        <div className="text-muted-foreground mt-1 flex items-start gap-1.5 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />

                          <span className="line-clamp-2">
                            {property.address}
                          </span>
                        </div>

                        {/* RATING */}
                        <div className="mt-2 flex items-center gap-2">
                          {property.reviewCount &&
                          property.reviewCount > 0 ? (
                            <>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                                <span className="text-sm font-semibold text-slate-800">
                                  {Number(
                                    property.averageRating || 0
                                  ).toFixed(1)}
                                </span>
                              </div>

                              <span className="text-sm text-slate-500">
                                ({property.reviewCount} ulasan)
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Belum ada ulasan
                            </span>
                          )}
                        </div>
                      </div>

                      {firstRoom ? (
                        <div className="border-t border-slate-100 pt-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {firstRoom.name}
                              </p>

                              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                                <Users className="h-3.5 w-3.5" />

                                <span>
                                  {firstRoom.quantity} unit • maksimal{' '}
                                  {firstRoom.maxGuests} tamu
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-bold text-rose-600">
                                Rp {formatPrice(firstRoom.price)}
                              </p>

                              <p className="text-muted-foreground text-xs">
                                / malam
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="border-t border-slate-100 pt-3 text-sm text-amber-600">
                          Belum ada room tersedia.
                        </p>
                      )}

                      <Button
                        onClick={() => handleDetail(property.id)}
                        className="w-full bg-rose-600 text-white hover:bg-rose-700"
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}