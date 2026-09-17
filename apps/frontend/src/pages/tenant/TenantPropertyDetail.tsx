import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, MapPin, CalendarDays, BedDouble } from 'lucide-react';
import api from '@/services/api';

export default function TenantPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        setProperty(response.data.data);
      } catch (error) {
        console.error("Gagal memuat detail properti", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat detail properti...</div>;
  }

  if (!property) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Properti tidak ditemukan.</p>
        <Button onClick={() => navigate('/tenant/dashboard')}>Kembali ke Dashboard</Button>
      </div>
    );
  }

  // Format tanggal agar mudah dibaca (Contoh: 1 Jan 2026)
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-pink-50/25">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-6 md:px-12 shadow-xs">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tenant/dashboard')} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
        </Button>
        <Button 
          onClick={() => navigate(`/tenant/properties/edit/${property.id}`)}
          className="bg-rose-600 text-white hover:bg-rose-700"
        >
          <Pencil className="h-4 w-4 mr-2" /> Edit Properti Ini
        </Button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
        <div className="rounded-xl overflow-hidden border bg-card shadow-sm">
          <div className="h-80 w-full bg-gray-100 relative">
            {property.imageUrl ? (
              <img 
                src={property.imageUrl.startsWith('http') ? property.imageUrl : `http://localhost:8000${property.imageUrl}`} 
                alt={property.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Tidak ada gambar</div>
            )}
            <span className="absolute top-4 left-4 bg-white/90 text-rose-700 text-xs font-semibold px-3 py-1 rounded-md shadow-xs">
              {property.category}
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{property.title}</h1>
              <div className="flex items-center text-muted-foreground text-sm gap-2">
                <MapPin className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{property.address}</span>
              </div>
            </div>

            {/* Informasi Harga, Kamar, dan Ketersediaan Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="p-4 rounded-lg bg-pink-50/50 border border-pink-100">
                <span className="text-xs text-muted-foreground block mb-1">Harga Sewa</span>
                <span className="text-lg font-bold text-rose-600">
                  Rp {property.price?.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/ {property.period}</span>
                </span>
              </div>

              <div className="p-4 rounded-lg bg-pink-50/50 border border-pink-100">
                <span className="text-xs text-muted-foreground block mb-1">Jumlah Kamar</span>
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <BedDouble className="h-4 w-4 text-rose-600" />
                  <span>{property.room} Kamar</span>
                </div>
              </div>

              {/* Card Ketersediaan Tanggal Sewa */}
              <div className="p-4 rounded-lg bg-pink-50/50 border border-pink-100">
                <span className="text-xs text-muted-foreground block mb-1">Periode Tersedia</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CalendarDays className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{formatDate(property.startDate)} s.d. {formatDate(property.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Deskripsi Properti */}
            {property.description && (
              <div className="pt-4 border-t space-y-2">
                <h3 className="font-semibold text-foreground">Deskripsi Properti</h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}