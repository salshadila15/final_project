import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Home,
  MapPin,
  Users,
  CalendarDays,
  Star,
} from 'lucide-react';

interface Room {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  availableQuantity: number;
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

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function PropertyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');

  // Date selection
  const [selectedCheckIn, setSelectedCheckIn] = useState(
    searchParams.get('checkIn') || ''
  );
  const [selectedCheckOut, setSelectedCheckOut] = useState(
    searchParams.get('checkOut') || ''
  );

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  // =========================================================
  // FETCH PROPERTY
  // =========================================================

  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true);
        setError('');

        const propertyId = Number(id);

        if (!Number.isInteger(propertyId)) {
          setError('ID properti tidak valid.');
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();

        if (checkIn) {
          params.set('checkIn', checkIn);
        }

        if (checkOut) {
          params.set('checkOut', checkOut);
        }

        const queryString = params.toString();

        const response = await api.get(
          `/properties/${propertyId}${queryString ? `?${queryString}` : ''}`
        );

        setProperty(response.data.data);
      } catch (error) {
        console.error('Get property detail error:', error);
        setError('Gagal mengambil detail properti. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id, checkIn, checkOut]);

  // =========================================================
  // FETCH REVIEWS
  // =========================================================

  useEffect(() => {
    async function fetchReviews() {
      try {
        setReviewsLoading(true);

        const propertyId = Number(id);

        if (!Number.isInteger(propertyId)) {
          return;
        }

        const response = await api.get(`/reviews/property/${propertyId}`);

        setReviews(response.data.data || []);
      } catch (error) {
        console.error('Get property reviews error:', error);
      } finally {
        setReviewsLoading(false);
      }
    }

    fetchReviews();
  }, [id]);

  // =========================================================
  // HELPERS
  // =========================================================

  function formatPrice(price: string | number) {
    return new Intl.NumberFormat('id-ID').format(Number(price));
  }

  function formatDate(date: string) {
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

  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function handleBack() {
    navigate('/user/dashboard');
  }

  // =========================================================
  // DATE HANDLERS
  // =========================================================

  function handleCheckInChange(value: string) {
    setSelectedCheckIn(value);

    // Reset checkout if it becomes invalid
    if (selectedCheckOut && value >= selectedCheckOut) {
      setSelectedCheckOut('');
    }
  }

  function handleCheckOutChange(value: string) {
    setSelectedCheckOut(value);
  }

  function handleCheckAvailability() {
    const params = new URLSearchParams();

    if (selectedCheckIn) {
      params.set('checkIn', selectedCheckIn);
    }

    if (selectedCheckOut) {
      params.set('checkOut', selectedCheckOut);
    }

    navigate(`/properties/${id}?${params.toString()}`);
  }

  // =========================================================
  // ROOM SELECTION
  // =========================================================

  function handleChooseRoom(roomId: number) {
    const params = new URLSearchParams();

    if (selectedCheckIn) {
      params.set('checkIn', selectedCheckIn);
    }

    if (selectedCheckOut) {
      params.set('checkOut', selectedCheckOut);
    }

    params.set('propertyId', String(id));
    params.set('roomId', String(roomId));

    navigate('/booking?' + params.toString());
  }

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      : 0;

  const canCheckAvailability =
    Boolean(selectedCheckIn) && Boolean(selectedCheckOut);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-pink-100 bg-white p-12 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">
              Memuat detail properti...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !property) {
    return (
      <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-sm text-rose-700">
              {error || 'Properti tidak ditemukan.'}
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

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* BACK BUTTON */}

        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        {/* PROPERTY IMAGE */}

        <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
          <div className="h-64 w-full bg-rose-50 md:h-96">
            {property.imageUrl ? (
              <img
                src={property.imageUrl}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-rose-300">
                <Home className="h-20 w-20" />
              </div>
            )}
          </div>
        </div>

        {/* PROPERTY INFORMATION */}

        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <span className="inline-block rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                {property.category}
              </span>

              <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
                {property.title}
              </h1>
            </div>

            <div className="text-muted-foreground flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />

              <span>{property.address}</span>
            </div>

            {property.description && (
              <div className="border-t border-slate-100 pt-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Tentang properti
                </h2>

                <p className="mt-2 text-sm leading-6 whitespace-pre-line text-slate-600">
                  {property.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* STAY DATES */}

        <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />

            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900">
                Tentukan tanggal menginap
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pilih tanggal check-in dan check-out sebelum memilih kamar.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* CHECK IN */}

                <div>
                  <label
                    htmlFor="check-in"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Check-in
                  </label>

                  <input
                    id="check-in"
                    type="date"
                    value={selectedCheckIn}
                    min={getTomorrowDate()}
                    onChange={(event) =>
                      handleCheckInChange(event.target.value)
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                {/* CHECK OUT */}

                <div>
                  <label
                    htmlFor="check-out"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Check-out
                  </label>

                  <input
                    id="check-out"
                    type="date"
                    value={selectedCheckOut}
                    min={selectedCheckIn || getTomorrowDate()}
                    disabled={!selectedCheckIn}
                    onChange={(event) =>
                      handleCheckOutChange(event.target.value)
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              <Button
                onClick={handleCheckAvailability}
                disabled={!canCheckAvailability}
                className="mt-4 w-full bg-rose-600 text-white hover:bg-rose-700 sm:w-auto"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Cek Ketersediaan
              </Button>

              {checkIn && checkOut && (
                <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3">
                  <p className="text-sm font-medium text-rose-800">
                    Tanggal menginap
                  </p>

                  <p className="mt-1 text-sm text-rose-700">
                    {formatDate(checkIn)} – {formatDate(checkOut)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROOMS */}

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Pilihan kamar
            </h2>

            <p className="text-muted-foreground mt-1 text-sm">
              Pilih tipe kamar yang sesuai dengan kebutuhanmu.
            </p>
          </div>

          {property.rooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center">
              <Home className="mx-auto h-10 w-10 text-rose-300" />

              <p className="text-muted-foreground mt-3 text-sm">
                Belum ada kamar tersedia untuk properti ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {property.rooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {room.name}
                      </h3>

                      {room.description && (
                        <p className="text-muted-foreground mt-2 text-sm leading-6">
                          {room.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4 text-rose-500" />

                        <span>
                          {room.availableQuantity} kamar tersedia
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <div className="text-left md:text-right">
                        <p className="text-xl font-bold text-rose-600">
                          Rp {formatPrice(room.price)}
                        </p>

                        <p className="text-muted-foreground text-xs">
                          per malam
                        </p>
                      </div>

                      <Button
                        onClick={() => handleChooseRoom(room.id)}
                        disabled={
                          room.availableQuantity <= 0 ||
                          !canCheckAvailability
                        }
                        className="w-full bg-rose-600 text-white hover:bg-rose-700 md:w-auto"
                      >
                        {room.availableQuantity <= 0
                          ? 'Kamar Penuh'
                          : !canCheckAvailability
                            ? 'Pilih Tanggal Dahulu'
                            : 'Pilih Kamar'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REVIEWS */}

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Review Pengguna
            </h2>

            <p className="text-muted-foreground mt-1 text-sm">
              Lihat pengalaman pengguna lain yang pernah menginap di properti
              ini.
            </p>
          </div>

          {reviewsLoading ? (
            <div className="rounded-2xl border border-pink-100 bg-white p-6 text-center shadow-sm">
              <p className="text-muted-foreground text-sm">
                Memuat review...
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center shadow-sm">
              <Star className="mx-auto h-10 w-10 text-amber-300" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                Belum ada review
              </p>

              <p className="text-muted-foreground mt-1 text-sm">
                Jadilah pengguna pertama yang memberikan review untuk properti
                ini.
              </p>
            </div>
          ) : (
            <>
              {/* AVERAGE RATING */}

              <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Star className="h-7 w-7 fill-amber-400 text-amber-400" />

                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      {averageRating.toFixed(1)}
                    </p>

                    <p className="text-muted-foreground text-xs">
                      dari {reviews.length} review
                    </p>
                  </div>
                </div>
              </div>

              {/* REVIEW LIST */}

              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {review.user.name}
                        </p>

                        <div className="mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>

                      <p className="text-muted-foreground text-xs">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>

                    {review.comment && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}