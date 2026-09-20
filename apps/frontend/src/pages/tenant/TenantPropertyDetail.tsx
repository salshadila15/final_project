import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Pencil,
  MapPin,
  BedDouble,
  Tag,
  CalendarDays,
  Clock,
} from 'lucide-react';
import api from '@/services/api';

type SpecialPrice = {
  id: number;
  date: string;
  price: number;
};

type Room = {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  maxGuests?: number;
  prices: SpecialPrice[];
  availabilities: {
    id: number;
    date: string;
    isAvailable: boolean;
  }[];
  availableQuantity?: number;
};

type Property = {
  id: number;
  title: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  address: string;
  city: string;
  checkInTime: string;
  checkOutTime: string;
  rooms: Room[];
};

export default function TenantPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        setProperty(response.data.data);
      } catch (error) {
        console.error('Gagal memuat detail properti', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        Memuat detail properti...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="text-muted-foreground">Properti tidak ditemukan.</p>

        <Button onClick={() => navigate('/tenant/dashboard')}>
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  const rooms = property.rooms || [];

  return (
    <div className="flex min-h-screen flex-col bg-pink-50/25">
      {/* HEADER */}
      <header className="bg-card sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 shadow-xs md:px-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tenant/dashboard')}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Dashboard
        </Button>

        <Button
          onClick={() => navigate(`/tenant/properties/edit/${property.id}`)}
          className="bg-rose-600 text-white hover:bg-rose-700"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Properti
        </Button>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4 md:p-10">
        {/* PROPERTY CARD */}
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
          {/* IMAGE */}
          <div className="relative h-64 w-full bg-gray-100 md:h-80">
            {property.imageUrl ? (
              <img
                src={
                  property.imageUrl.startsWith('http')
                    ? property.imageUrl
                    : `http://localhost:8000${property.imageUrl}`
                }
                alt={property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                Tidak ada gambar
              </div>
            )}

            <span className="absolute top-4 left-4 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-rose-700 shadow-xs">
              {property.category}
            </span>
          </div>

          <div className="space-y-6 p-5 md:p-6">
            {/* TITLE + LOCATION */}
            <div>
              <h1 className="text-foreground mb-2 text-2xl font-bold">
                {property.title}
              </h1>

              <div className="text-muted-foreground flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">
                    {property.city}
                  </span>

                  <span>{property.address}</span>
                </div>
              </div>
            </div>

            {/* CHECK-IN / CHECK-OUT */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <h3 className="text-foreground font-semibold">
                  Waktu Menginap
                </h3>

                <p className="text-muted-foreground text-sm">
                  Waktu check-in dan check-out yang berlaku di properti ini.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-pink-100 bg-pink-50/40 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-rose-600" />

                    <span className="text-muted-foreground text-xs font-medium">
                      Check-in
                    </span>
                  </div>

                  <p className="text-foreground text-lg font-bold">
                    {property.checkInTime || '-'}
                  </p>
                </div>

                <div className="rounded-lg border border-pink-100 bg-pink-50/40 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-rose-600" />

                    <span className="text-muted-foreground text-xs font-medium">
                      Check-out
                    </span>
                  </div>

                  <p className="text-foreground text-lg font-bold">
                    {property.checkOutTime || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* PROPERTY DESCRIPTION */}
            {property.description && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-foreground font-semibold">
                  Deskripsi Properti
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* ROOM INFORMATION */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <h3 className="text-foreground font-semibold">Tipe Kamar</h3>

                <p className="text-muted-foreground text-sm">
                  Semua tipe kamar yang tersedia di properti ini.
                </p>
              </div>

              {rooms.length > 0 ? (
                <div className="space-y-5">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-background rounded-xl border p-4"
                    >
                      {/* ROOM HEADER */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-5 w-5 text-rose-600" />

                          <h4 className="font-semibold">{room.name}</h4>
                        </div>

                        <span className="w-fit rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-rose-700">
                          {room.quantity} Unit
                        </span>
                      </div>

                      {/* ROOM DETAILS */}
                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {/* QUANTITY */}
                        <div className="rounded-lg border border-pink-100 bg-pink-50/40 p-4">
                          <span className="text-muted-foreground mb-1 block text-xs">
                            Jumlah Unit
                          </span>

                          <span className="text-foreground text-lg font-bold">
                            {room.quantity} Unit
                          </span>
                        </div>

                        {/* PRICE */}
                        <div className="rounded-lg border border-pink-100 bg-pink-50/40 p-4">
                          <span className="text-muted-foreground mb-1 block text-xs">
                            Harga Dasar
                          </span>

                          <span className="text-lg font-bold text-rose-600">
                            Rp {formatCurrency(room.price)}
                          </span>

                          <span className="text-muted-foreground mt-1 block text-xs">
                            per malam
                          </span>
                        </div>
                      </div>

                      {/* ROOM DESCRIPTION */}
                      {room.description && (
                        <div className="bg-muted/40 mt-3 rounded-lg border p-4">
                          <span className="text-foreground mb-1 block text-xs font-semibold">
                            Deskripsi Kamar
                          </span>

                          <p className="text-muted-foreground text-sm whitespace-pre-line">
                            {room.description}
                          </p>
                        </div>
                      )}

                      {/* SPECIAL PRICES */}
                      <div className="mt-4 border-t pt-4">
                        <div className="mb-3">
                          <h5 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                            <Tag className="h-4 w-4 text-rose-600" />
                            Harga Khusus
                          </h5>
                        </div>

                        {room.prices && room.prices.length > 0 ? (
                          <div className="space-y-2">
                            {room.prices.map((specialPrice) => (
                              <div
                                key={specialPrice.id}
                                className="flex items-center justify-between gap-4 rounded-lg border bg-pink-50/40 px-4 py-3"
                              >
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 text-rose-600" />

                                  <span className="text-sm font-medium">
                                    {formatDate(specialPrice.date)}
                                  </span>
                                </div>

                                <span className="text-sm font-bold text-rose-600">
                                  Rp {formatCurrency(specialPrice.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed p-3 text-center">
                            <p className="text-muted-foreground text-xs">
                              Belum ada harga khusus untuk tipe kamar ini.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-5 text-center">
                  <p className="text-muted-foreground text-sm">
                    Belum ada tipe kamar untuk properti ini.
                  </p>
                </div>
              )}
            </div>

            {/* ACTION */}
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => navigate('/tenant/dashboard')}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>

              <Button
                onClick={() =>
                  navigate(`/tenant/properties/edit/${property.id}`)
                }
                className="w-full bg-rose-600 text-white hover:bg-rose-700 sm:w-auto"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Properti
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}