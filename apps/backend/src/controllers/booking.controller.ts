import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  getRoomAvailability,
  getRoomNightlyPrices,
  getUserBookings,
} from '../services/booking.service';
import cloudinary from '../config/cloudinary';

export const createBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    const { propertyId, roomId, checkIn, checkOut, guests } = req.body;

    if (!propertyId || !roomId || !checkIn || !checkOut || !guests) {
      res.status(400).json({
        message: 'Data booking belum lengkap',
      });
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      res.status(400).json({
        message: 'Format tanggal tidak valid',
      });
      return;
    }

    const room = await prisma.room.findUnique({
      where: { id: Number(roomId) },
    });

    if (!room) {
      res.status(404).json({
        message: 'Room tidak ditemukan',
      });
      return;
    }

    if (room.propertyId !== Number(propertyId)) {
      res.status(400).json({
        message: 'Room tidak sesuai dengan properti yang dipilih',
      });
      return;
    }

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      res.status(400).json({
        message: 'Tanggal check-out harus setelah check-in',
      });
      return;
    }

    const availability = await getRoomAvailability(
      Number(roomId),
      checkInDate,
      checkOutDate
    );

    if (availability.availableQuantity <= 0) {
      res.status(400).json({
        message: 'Kamar sudah tidak tersedia untuk tanggal tersebut',
      });
      return;
    }

    const nightlyPrices = await getRoomNightlyPrices(
      Number(roomId),
      checkInDate,
      nights
    );

    const totalAmount = nightlyPrices.reduce(
      (total, night) => total + Number(night.price),
      0
    );

    const bookingCode = 'BK-' + Date.now().toString().slice(-8);

    const paymentDeadline = new Date();
    paymentDeadline.setHours(paymentDeadline.getHours() + 24);

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        userId: Number(userId),
        propertyId: Number(propertyId),
        roomId: Number(roomId),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: Number(guests),
        totalAmount,
        paymentDeadline,
      },
    });

    const bookingNights = nightlyPrices.map((night) => ({
      bookingId: booking.id,
      date: night.date,
      price: night.price,
    }));

    await prisma.bookingNight.createMany({
      data: bookingNights,
    });

    res.status(201).json({
      message: 'Booking berhasil dibuat',
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error', error);

    res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const getBookingPricePreview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomId, checkIn, checkOut } = req.query;

    if (!roomId || !checkIn || !checkOut) {
      res.status(400).json({
        message: 'roomId, checkIn, dan checkOut wajib diisi',
      });
      return;
    }

    const checkInParts = String(checkIn).split('-').map(Number);
    const checkOutParts = String(checkOut).split('-').map(Number);

    if (checkInParts.length !== 3 || checkOutParts.length !== 3) {
      res.status(400).json({
        message: 'Format tanggal harus YYYY-MM-DD',
      });
      return;
    }

    const [checkInYear, checkInMonth, checkInDay] = checkInParts;
    const [checkOutYear, checkOutMonth, checkOutDay] = checkOutParts;
    if (
      !checkInYear ||
      !checkInMonth ||
      !checkInDay ||
      !checkOutYear ||
      !checkOutMonth ||
      !checkOutDay
    ) {
      res.status(400).json({
        message: 'Tanggal tidak valid',
      });
      return;
    }

    const checkInDate = new Date(
      Date.UTC(checkInYear, checkInMonth - 1, checkInDay)
    );

    const checkOutDate = new Date(
      Date.UTC(checkOutYear, checkOutMonth - 1, checkOutDay)
    );

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      res.status(400).json({
        message: 'Format tanggal tidak valid',
      });
      return;
    }

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      res.status(400).json({
        message: 'Tanggal check-out harus setelah check-in',
      });
      return;
    }

    const prices = await getRoomNightlyPrices(
      Number(roomId),
      checkInDate,
      nights
    );

    res.status(200).json({
      data: prices,
    });
  } catch (error) {
    console.error('Get booking price preview error:', error);

    res.status(500).json({
      message: 'Gagal mengambil harga booking',
    });
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    const bookings = await getUserBookings(Number(userId));

    res.status(200).json({
      data: bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);

    res.status(500).json({
      message: 'Gagal mengambil riwayat pemesanan',
    });
  }
};

export const uploadPaymentProof = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const bookingId = Number(req.params.id);

    if (!userId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    if (!Number.isInteger(bookingId)) {
      res.status(400).json({
        message: 'ID booking tidak valid',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: 'Bukti pembayaran wajib diunggah',
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      res.status(404).json({
        message: 'Booking tidak ditemukan',
      });
      return;
    }

    if (booking.userId !== Number(userId)) {
      res.status(403).json({
        message: 'Anda tidak memiliki akses ke booking ini',
      });
      return;
    }

    if (booking.status !== 'MENUNGGU_PEMBAYARAN') {
      res.status(400).json({
        message:
          'Bukti pembayaran tidak dapat diunggah untuk status booking ini',
      });
      return;
    }

    if (booking.paymentDeadline && new Date() > booking.paymentDeadline) {
      res.status(400).json({
        message: 'Batas waktu pembayaran sudah berakhir',
      });
      return;
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      'base64'
    )}`;

    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'payment_proofs',
      resource_type: 'image',
    });

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        paymentProof: uploadResponse.secure_url,
        status: 'MENUNGGU_KONFIRMASI',
      },
    });

    res.status(200).json({
      message: 'Bukti pembayaran berhasil diunggah',
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error('Upload payment proof error:', error);

    if (error?.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        message: 'Ukuran bukti pembayaran maksimal 1 MB',
      });
      return;
    }

    res.status(400).json({
      message: error?.message || 'Gagal mengunggah bukti pembayaran',
    });
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const bookingId = Number(req.params.id);

    if (!userId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    if (!Number.isInteger(bookingId)) {
      res.status(400).json({
        message: 'ID booking tidak valid',
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      res.status(404).json({
        message: 'Booking tidak ditemukan',
      });
      return;
    }

    if (booking.userId !== Number(userId)) {
      res.status(403).json({
        message: 'Anda tidak memiliki akses ke booking ini',
      });
      return;
    }

    if (booking.status !== 'MENUNGGU_PEMBAYARAN') {
      res.status(400).json({
        message: 'Booking hanya dapat dibatalkan sebelum pembayaran',
      });
      return;
    }

    if (booking.paymentDeadline && new Date() > booking.paymentDeadline) {
      await prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: 'DIBATALKAN',
        },
      });

      res.status(400).json({
        message:
          'Batas waktu pembayaran sudah berakhir. Booking dibatalkan otomatis.',
      });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: 'DIBATALKAN',
      },
    });

    res.status(200).json({
      message: 'Booking berhasil dibatalkan',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);

    res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const approveBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.user?.id;
    const bookingId = Number(req.params.id);

    if (!tenantId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    if (!Number.isInteger(bookingId)) {
      res.status(400).json({
        message: 'ID booking tidak valid',
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        property: {
          select: {
            tenantId: true,
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({
        message: 'Booking tidak ditemukan',
      });
      return;
    }

    if (booking.property.tenantId !== Number(tenantId)) {
      res.status(403).json({
        message: 'Anda tidak memiliki akses ke booking ini',
      });
      return;
    }

    if (booking.status !== 'MENUNGGU_KONFIRMASI') {
      res.status(400).json({
        message:
          'Booking hanya dapat disetujui saat menunggu konfirmasi pembayaran',
      });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: 'DIPROSES',
      },
    });

    res.status(200).json({
      message: 'Pembayaran berhasil disetujui',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Approve booking error:', error);

    res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const rejectBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.user?.id;
    const bookingId = Number(req.params.id);

    if (!tenantId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    if (!Number.isInteger(bookingId)) {
      res.status(400).json({
        message: 'ID booking tidak valid',
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        property: {
          select: {
            tenantId: true,
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({
        message: 'Booking tidak ditemukan',
      });
      return;
    }

    if (booking.property.tenantId !== Number(tenantId)) {
      res.status(403).json({
        message: 'Anda tidak memiliki akses ke booking ini',
      });
      return;
    }

    if (booking.status !== 'MENUNGGU_KONFIRMASI') {
      res.status(400).json({
        message:
          'Booking hanya dapat ditolak saat menunggu konfirmasi pembayaran',
      });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: 'DIBATALKAN',
      },
    });

    res.status(200).json({
      message: 'Pembayaran ditolak dan booking dibatalkan',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Reject booking error:', error);

    res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const getTenantBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.user?.id;

    if (!tenantId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: {
        property: {
          tenantId: Number(tenantId),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            address: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        nights: {
          orderBy: {
            date: 'asc',
          },
          select: {
            id: true,
            date: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      data: bookings,
    });
  } catch (error) {
    console.error('Get tenant bookings error:', error);

    res.status(500).json({
      message: 'Gagal mengambil booking tenant',
    });
  }
};

export const completeBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.user?.id;
    const bookingId = Number(req.params.id);

    if (!tenantId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    if (!Number.isInteger(bookingId)) {
      res.status(400).json({
        message: 'ID booking tidak valid',
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        property: {
          select: {
            tenantId: true,
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({
        message: 'Booking tidak ditemukan',
      });
      return;
    }

    if (booking.property.tenantId !== Number(tenantId)) {
      res.status(403).json({
        message: 'Anda tidak memiliki akses ke booking ini',
      });
      return;
    }

    if (booking.status !== 'DIPROSES') {
      res.status(400).json({
        message:
          'Booking hanya dapat diselesaikan saat statusnya sedang diproses',
      });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: 'SELESAI',
      },
    });

    res.status(200).json({
      message: 'Booking berhasil diselesaikan',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Complete booking error:', error);

    res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};
