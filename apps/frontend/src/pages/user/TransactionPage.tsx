import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Copy,
  Check,
  Home,
  MapPin,
  Users,
  ReceiptText,
  Star,
  CreditCard,
} from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface BookingNight {
  id: number;
  date: string;
  price: string | number;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface Property {
  id: number;
  title: string;
  category: string;
  imageUrl: string | null;
  address: string;
}

interface Room {
  id: number;
  name: string;
  description: string | null;
}

interface Booking {
  id: number;
  bookingCode: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: string | number;
  status: string;
  paymentProof: string | null;
  paymentDeadline: string | null;
  property: Property;
  room: Room;
  nights: BookingNight[];
  review: Review | null;
}

type BankCode = 'BCA' | 'BNI' | 'MANDIRI' | 'BRI';

interface BankOption {
  code: BankCode;
  name: string;
  color: string;
}

const BANK_OPTIONS: BankOption[] = [
  {
    code: 'BCA',
    name: 'BCA',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    code: 'BNI',
    name: 'BNI',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  {
    code: 'MANDIRI',
    name: 'Mandiri',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
  {
    code: 'BRI',
    name: 'BRI',
    color: 'bg-sky-50 border-sky-200 text-sky-700',
  },
];

export default function TransactionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const bookingIdParam = searchParams.get('bookingId');
  const selectedBookingId = bookingIdParam
    ? Number(bookingIdParam)
    : null;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    Record<number, File>
  >({});

  const [selectedBanks, setSelectedBanks] = useState<
    Record<number, BankCode>
  >({});

  const [copiedBookingId, setCopiedBookingId] = useState<number | null>(
    null
  );

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/bookings/my-bookings');

      setBookings(response.data.data || []);
    } catch (error: any) {
      console.error('Get transactions error:', error);

      setError(
        error.response?.data?.message ||
          'Gagal mengambil riwayat transaksi.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  function formatPrice(price: number | string) {
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

  function formatDeadline(date: string) {
    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
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

  function getSelectedBank(bookingId: number): BankCode {
    return selectedBanks[bookingId] || 'BCA';
  }

  function generateVirtualAccount(
    booking: Booking,
    bank: BankCode
  ) {
    const bankPrefix: Record<BankCode, string> = {
      BCA: '3901',
      BNI: '8808',
      MANDIRI: '70012',
      BRI: '7788',
    };

    const bookingNumber = String(booking.id).padStart(6, '0');

    return `${bankPrefix[bank]}${bookingNumber}991`;
  }

  const handleSelectBank = (
    bookingId: number,
    bank: BankCode
  ) => {
    setSelectedBanks((prev) => ({
      ...prev,
      [bookingId]: bank,
    }));

    setCopiedBookingId(null);
  };

  const handleCopyVirtualAccount = async (
    booking: Booking
  ) => {
    const bank = getSelectedBank(booking.id);
    const virtualAccount = generateVirtualAccount(
      booking,
      bank
    );

    try {
      await navigator.clipboard.writeText(virtualAccount);

      setCopiedBookingId(booking.id);

      window.setTimeout(() => {
        setCopiedBookingId((current) =>
          current === booking.id ? null : current
        );
      }, 2000);
    } catch (error) {
      console.error('Copy virtual account error:', error);
      alert('Nomor Virtual Account gagal disalin.');
    }
  };

  const handleUploadPayment = async (bookingId: number) => {
    const file = selectedFiles[bookingId];

    if (!file) {
      alert('Pilih bukti pembayaran terlebih dahulu.');
      return;
    }

    try {
      setUploadingId(bookingId);

      const formData = new FormData();
      formData.append('paymentProof', file);

      await api.post(
        `/bookings/${bookingId}/payment-proof`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('Bukti pembayaran berhasil diunggah.');

      setSelectedFiles((prev) => {
        const copy = { ...prev };
        delete copy[bookingId];
        return copy;
      });

      await fetchBookings();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Gagal mengunggah bukti pembayaran.'
      );
    } finally {
      setUploadingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin membatalkan booking ini?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setUploadingId(bookingId);

      await api.post(`/bookings/${bookingId}/cancel`);

      alert('Booking berhasil dibatalkan.');

      await fetchBookings();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Gagal membatalkan booking.'
      );
    } finally {
      setUploadingId(null);
    }
  };

  const openReviewDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setRating(0);
    setComment('');
    setReviewOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) {
      return;
    }

    if (rating < 1 || rating > 5) {
      alert('Silakan pilih rating terlebih dahulu.');
      return;
    }

    try {
      setSubmittingReview(true);

      await api.post('/reviews', {
        bookingId: selectedBooking.id,
        rating,
        comment: comment.trim() || null,
      });

      alert('Review berhasil dikirim.');

      setReviewOpen(false);
      setSelectedBooking(null);
      setRating(0);
      setComment('');

      await fetchBookings();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Gagal mengirim review.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const displayedBookings =
    selectedBookingId !== null
      ? bookings.filter(
          (booking) => booking.id === selectedBookingId
        )
      : bookings;

  const isSingleTransactionView =
    selectedBookingId !== null;

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-pink-100 bg-white p-12 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">
              Memuat transaksi...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <Button
            variant="outline"
            onClick={() => navigate('/user/dashboard')}
            className="mb-6 rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-sm text-rose-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-pink-50/20 p-6 md:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Button
            variant="outline"
            onClick={() => navigate('/user/dashboard')}
            className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              {isSingleTransactionView
                ? 'Detail Transaksi'
                : 'Riwayat Transaksi'}
            </h1>

            <p className="text-muted-foreground mt-1 text-sm">
              {isSingleTransactionView
                ? 'Lihat detail pemesanan dan pembayaran Anda.'
                : 'Lihat dan kelola seluruh pemesanan Anda.'}
            </p>
          </div>

          {displayedBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <ReceiptText className="h-7 w-7" />
              </div>

              <h2 className="font-semibold text-slate-900">
                {isSingleTransactionView
                  ? 'Transaksi tidak ditemukan'
                  : 'Belum ada transaksi'}
              </h2>

              <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
                {isSingleTransactionView
                  ? 'Transaksi yang Anda pilih tidak ditemukan atau sudah tidak tersedia.'
                  : 'Transaksi pemesanan Anda akan muncul di halaman ini.'}
              </p>

              <Button
                onClick={() => navigate('/explore')}
                className="mt-6 bg-rose-600 text-white hover:bg-rose-700"
              >
                Jelajahi Penginapan
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedBookings.map((booking) => {
                const selectedBank = getSelectedBank(
                  booking.id
                );

                const virtualAccount =
                  generateVirtualAccount(
                    booking,
                    selectedBank
                  );

                const selectedBankInfo =
                  BANK_OPTIONS.find(
                    (bank) => bank.code === selectedBank
                  ) || BANK_OPTIONS[0];

                return (
                  <div
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm"
                  >
                    <div className="h-48 w-full bg-rose-50 md:h-56">
                      {booking.property.imageUrl ? (
                        <img
                          src={booking.property.imageUrl}
                          alt={booking.property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-rose-300">
                          <Home className="h-16 w-16" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-5 p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <span className="inline-block rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                            {booking.property.category}
                          </span>

                          <h2 className="mt-2 text-xl font-bold text-slate-900">
                            {booking.property.title}
                          </h2>

                          <div className="text-muted-foreground mt-2 flex items-start gap-2 text-sm">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />

                            <span>
                              {booking.property.address}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center justify-center rounded-full px-3 py-1.5 text-xs leading-none font-semibold ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-muted-foreground text-xs">
                          Kode Booking
                        </p>

                        <p className="mt-1 font-semibold tracking-wide text-slate-900">
                          {booking.bookingCode}
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-rose-50 p-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-rose-500" />

                            <p className="text-sm font-semibold text-slate-900">
                              Check-in
                            </p>
                          </div>

                          <p className="mt-2 text-sm text-slate-700">
                            {formatDate(booking.checkIn)}
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
                            {formatDate(booking.checkOut)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Kamar
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {booking.room.name}
                          </p>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="mt-0.5 h-4 w-4 text-rose-500" />

                          <div>
                            <p className="text-muted-foreground text-xs">
                              Tamu
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                              {booking.guests} orang
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <h3 className="font-semibold text-slate-900">
                          Rincian Harga
                        </h3>

                        <div className="mt-3 space-y-2">
                          {booking.nights.map((night) => (
                            <div
                              key={night.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {formatDate(night.date)}
                              </span>

                              <span className="font-medium text-slate-900">
                                Rp{' '}
                                {formatPrice(night.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">
                            Total Pembayaran
                          </span>

                          <span className="text-2xl font-bold text-rose-600">
                            Rp{' '}
                            {formatPrice(
                              booking.totalAmount
                            )}
                          </span>
                        </div>
                      </div>

                      {booking.status ===
                        'MENUNGGU_PEMBAYARAN' && (
                        <div className="space-y-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                          <div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-amber-700" />

                              <h3 className="font-bold text-amber-900">
                                Pembayaran
                              </h3>
                            </div>

                            <p className="mt-1 text-sm leading-6 text-amber-800">
                              Pilih bank untuk mendapatkan
                              nomor Virtual Account pembayaran
                              Anda.
                            </p>
                          </div>

                          <div>
                            <p className="mb-3 text-sm font-semibold text-slate-900">
                              Pilih Bank
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {BANK_OPTIONS.map(
                                (bank) => {
                                  const isSelected =
                                    selectedBank ===
                                    bank.code;

                                  return (
                                    <button
                                      key={bank.code}
                                      type="button"
                                      onClick={() =>
                                        handleSelectBank(
                                          booking.id,
                                          bank.code
                                        )
                                      }
                                      className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                                        isSelected
                                          ? 'border-rose-500 bg-white text-rose-700 shadow-sm'
                                          : `${bank.color} hover:bg-white`
                                      }`}
                                    >
                                      {bank.name}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs text-slate-500">
                                  Virtual Account
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                  {selectedBankInfo.name}
                                </p>
                              </div>

                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                Aktif
                              </span>
                            </div>

                            <div className="mt-4 rounded-xl bg-slate-50 p-4">
                              <p className="text-xs text-slate-500">
                                Nomor Virtual Account
                              </p>

                              <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-xl font-bold tracking-wider text-slate-900">
                                  {virtualAccount}
                                </p>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCopyVirtualAccount(
                                      booking
                                    )
                                  }
                                  className="shrink-0 border-slate-300"
                                >
                                  {copiedBookingId ===
                                  booking.id ? (
                                    <>
                                      <Check className="mr-2 h-4 w-4" />
                                      Tersalin
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Salin
                                    </>
                                  )}
                                </Button>
                              </div>

                              <div className="mt-4 border-t border-slate-200 pt-3">
                                <p className="text-xs text-slate-500">
                                  Atas nama
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                  PT Kami Penyewa Properti
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                              <span className="text-sm text-slate-600">
                                Total yang harus dibayar
                              </span>

                              <span className="font-bold text-rose-600">
                                Rp{' '}
                                {formatPrice(
                                  booking.totalAmount
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="rounded-xl bg-white/70 p-4">
                            <p className="font-semibold text-slate-900">
                              Cara pembayaran
                            </p>

                            <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                              <li>
                                1. Pilih bank yang ingin
                                digunakan.
                              </li>

                              <li>
                                2. Salin nomor Virtual
                                Account di atas.
                              </li>

                              <li>
                                3. Lakukan pembayaran sesuai
                                nominal total transaksi.
                              </li>

                              <li>
                                4. Simpan bukti pembayaran
                                Anda.
                              </li>

                              <li>
                                5. Upload bukti pembayaran
                                pada halaman ini.
                              </li>
                            </ol>
                          </div>

                          {booking.paymentDeadline && (
                            <div className="rounded-xl border border-amber-300 bg-amber-100 p-4">
                              <p className="text-xs font-medium text-amber-800">
                                Batas pembayaran
                              </p>

                              <p className="mt-1 font-bold text-amber-900">
                                {formatDeadline(
                                  booking.paymentDeadline
                                )}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-amber-800">
                                Booking akan otomatis
                                dibatalkan apabila pembayaran
                                tidak dilakukan sampai batas
                                waktu tersebut.
                              </p>
                            </div>
                          )}

                          <div className="border-t border-amber-200 pt-5">
                            <p className="font-semibold text-slate-900">
                              Upload Bukti Pembayaran
                            </p>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              Upload bukti pembayaran dalam
                              format JPG atau PNG dengan ukuran
                              maksimal 1 MB.
                            </p>

                            <div className="mt-4 space-y-3">
                              <input
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={(event) => {
                                  const file =
                                    event.target.files?.[0];

                                  if (!file) {
                                    return;
                                  }

                                  if (
                                    file.size >
                                    1 * 1024 * 1024
                                  ) {
                                    alert(
                                      'Ukuran file maksimal 1 MB.'
                                    );
                                    event.target.value = '';
                                    return;
                                  }

                                  setSelectedFiles(
                                    (prev) => ({
                                      ...prev,
                                      [booking.id]: file,
                                    })
                                  );
                                }}
                                className="block w-full rounded-lg text-sm text-slate-700 file:mr-4 file:border-0 file:bg-rose-100 file:px-4 file:py-2 file:font-medium file:text-rose-700 hover:file:bg-rose-200"
                              />

                              {selectedFiles[
                                booking.id
                              ] && (
                                <p className="text-sm text-slate-600">
                                  File dipilih:{' '}
                                  {
                                    selectedFiles[
                                      booking.id
                                    ].name
                                  }
                                </p>
                              )}

                              <Button
                                onClick={() =>
                                  handleUploadPayment(
                                    booking.id
                                  )
                                }
                                disabled={
                                  !selectedFiles[
                                    booking.id
                                  ] ||
                                  uploadingId === booking.id
                                }
                                className="w-full bg-rose-600 text-white hover:bg-rose-700 sm:w-auto"
                              >
                                {uploadingId === booking.id
                                  ? 'Mengunggah...'
                                  : 'Upload Bukti Pembayaran'}
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() =>
                                  handleCancelBooking(
                                    booking.id
                                  )
                                }
                                disabled={
                                  uploadingId === booking.id
                                }
                                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 sm:w-auto"
                              >
                                Batalkan Booking
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {booking.status ===
                        'MENUNGGU_KONFIRMASI' && (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>

                            <div>
                              <h3 className="font-bold text-blue-900">
                                Bukti Pembayaran Diterima
                              </h3>

                              <p className="mt-1 text-sm leading-6 text-blue-800">
                                Bukti pembayaran Anda sudah
                                berhasil dikirim dan sedang
                                menunggu konfirmasi dari
                                pengelola properti.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {booking.status === 'DIPROSES' && (
                        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
                          <h3 className="font-bold text-violet-900">
                            Pembayaran Terverifikasi
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-violet-800">
                            Pembayaran Anda sudah dikonfirmasi.
                            Pemesanan sedang diproses oleh
                            pengelola properti.
                          </p>
                        </div>
                      )}

                      {booking.status === 'SELESAI' && (
                        <div className="border-t border-slate-100 pt-5">
                          {booking.review ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold text-emerald-800">
                                  Review Anda
                                </p>

                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map(
                                    (star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <=
                                          booking.review!.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-300'
                                        }`}
                                      />
                                    )
                                  )}
                                </div>
                              </div>

                              {booking.review.comment && (
                                <p className="mt-2 text-sm leading-6 text-emerald-700">
                                  "{booking.review.comment}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <Button
                              onClick={() =>
                                openReviewDialog(booking)
                              }
                              className="w-full bg-rose-600 text-white hover:bg-rose-700 sm:w-auto"
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Beri Review
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isSingleTransactionView &&
            displayedBookings.length > 0 && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate('/transactions')
                  }
                  className="border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Lihat Semua Transaksi
                </Button>
              </div>
            )}
        </div>
      </div>

      <Dialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Beri Review</DialogTitle>

            <DialogDescription>
              Bagaimana pengalaman Anda menginap di{' '}
              {selectedBooking?.property.title}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-900">
                Rating
              </p>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="rounded-md p-1 transition hover:bg-amber-50"
                    aria-label={`Rating ${star}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="mb-2 block text-sm font-medium text-slate-900"
              >
                Komentar
              </label>

              <Textarea
                id="review-comment"
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                placeholder="Ceritakan pengalaman Anda..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewOpen(false)}
              disabled={submittingReview}
            >
              Batal
            </Button>

            <Button
              type="button"
              onClick={handleSubmitReview}
              disabled={
                rating === 0 || submittingReview
              }
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {submittingReview
                ? 'Mengirim...'
                : 'Kirim Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}