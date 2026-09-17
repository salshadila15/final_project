import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createReview = async (
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

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || rating === undefined) {
      res.status(400).json({
        message: 'Booking dan rating wajib diisi',
      });
      return;
    }

    const numericBookingId = Number(bookingId);
    const numericRating = Number(rating);

    if (!Number.isInteger(numericBookingId)) {
      res.status(400).json({
        message: 'ID booking tidak valid',
      });
      return;
    }

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      res.status(400).json({
        message: 'Rating harus berupa angka 1 sampai 5',
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: numericBookingId,
      },
      include: {
        review: true,
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
        message: 'Bukan booking milik Anda',
      });
      return;
    }

    if (booking.status !== 'SELESAI') {
      res.status(400).json({
        message: 'Review hanya dapat diberikan setelah booking selesai',
      });
      return;
    }

    if (booking.review) {
      res.status(400).json({
        message: 'Booking ini sudah memiliki review',
      });
      return;
    }

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        propertyId: booking.propertyId,
        userId: booking.userId,
        rating: numericRating,
        comment: comment?.trim() || null,
      },
    });

    res.status(201).json({
      message: 'Review berhasil ditambahkan',
      data: review,
    });
  } catch (error) {
    console.error('Create review error:', error);

    res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const getPropertyReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const propertyId = Number(req.params.propertyId);

    if (!Number.isInteger(propertyId)) {
      res.status(400).json({
        message: 'ID property tidak valid',
      });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: {
        propertyId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      data: reviews,
    });
  } catch (error) {
    console.error('Get reviews error:', error);

    res.status(500).json({
      message: 'Gagal mengambil review',
    });
  }
};
