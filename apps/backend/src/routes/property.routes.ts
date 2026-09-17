import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import {
  createProperty,
  updateProperty,
} from '../controllers/property.controller';
import { verifyToken, AuthRequest } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload';

const router = Router();

// ============================================
// CREATE PROPERTY
// POST /api/properties
// ============================================

router.post(
  '/',
  verifyToken,
  (req: AuthRequest, res: Response, next) => {
    if (req.user?.role !== 'TENANT') {
      return res.status(403).json({
        message: 'Akses khusus pengelola/tenant',
      });
    }

    next();
  },
  upload.single('picture'),
  createProperty
);

// ============================================
// UPDATE PROPERTY
// PUT /api/properties/:id
// ============================================

router.put(
  '/:id',
  verifyToken,
  (req: AuthRequest, res: Response, next) => {
    if (req.user?.role !== 'TENANT') {
      return res.status(403).json({
        message: 'Akses khusus pengelola/tenant',
      });
    }

    next();
  },
  upload.single('image'),
  updateProperty
);

// ============================================
// GET MY PROPERTIES
// GET /api/properties/my-properties
// ============================================

router.get(
  '/my-properties',
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== 'TENANT') {
        return res.status(403).json({
          message: 'Akses khusus pengelola/tenant',
        });
      }

      const tenantId = Number(req.user.id);

      const properties = await prisma.property.findMany({
        where: {
          tenantId,
        },
        include: {
          rooms: {
            select: {
              id: true,
              name: true,
              quantity: true,
              price: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({
        data: properties,
      });
    } catch (error) {
      console.error('Get my properties error:', error);

      res.status(500).json({
        message: 'Gagal mengambil data properti',
      });
    }
  }
);

// ============================================
// GET ALL PROPERTIES
// GET /api/properties
// ============================================

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      data: properties,
    });
  } catch (error) {
    console.error('Get properties error:', error);

    res.status(500).json({
      message: 'Gagal memuat daftar properti',
    });
  }
});

// ============================================
// SEARCH PROPERTIES
// GET /api/properties/search
// ============================================

router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const location =
      typeof req.query.location === 'string' ? req.query.location.trim() : '';

    const checkIn =
      typeof req.query.checkIn === 'string' ? req.query.checkIn : '';

    const checkOut =
      typeof req.query.checkOut === 'string' ? req.query.checkOut : '';

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        message: 'Check-in dan check-out wajib diisi',
      });
    }

    const startDate = new Date(`${checkIn}T00:00:00`);
    const endDate = new Date(`${checkOut}T00:00:00`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: 'Format tanggal tidak valid',
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        message: 'Check-out harus setelah check-in',
      });
    }

    const properties = await prisma.property.findMany({
      where: location
        ? {
            OR: [
              {
                title: {
                  contains: location,
                  mode: 'insensitive',
                },
              },
              {
                address: {
                  contains: location,
                  mode: 'insensitive',
                },
              },
              {
                category: {
                  contains: location,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {},
      include: {
        rooms: {
          include: {
            availabilities: {
              where: {
                date: {
                  gte: startDate,
                  lt: endDate,
                },
              },
            },
            prices: {
              where: {
                date: {
                  gte: startDate,
                  lt: endDate,
                },
              },
            },
          },
        },
      },
    });

    const results = properties.filter((property) => {
      return property.rooms.some((room) => {
        const unavailableDates = room.availabilities.filter(
          (availability) => !availability.isAvailable
        );

        return unavailableDates.length === 0;
      });
    });

    return res.status(200).json({
      data: results,
    });
  } catch (error) {
    console.error('Search properties error:', error);

    return res.status(500).json({
      message: 'Gagal mencari properti',
    });
  }
});

// ============================================
// GET PROPERTY DETAIL
// GET /api/properties/:id
// PUBLIC - guest dan USER boleh melihat detail
// ============================================

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const propertyId = Number(req.params.id);

    if (Number.isNaN(propertyId)) {
      return res.status(400).json({
        message: 'ID properti tidak valid',
      });
    }

    const checkIn =
      typeof req.query.checkIn === 'string' ? req.query.checkIn : '';

    const checkOut =
      typeof req.query.checkOut === 'string' ? req.query.checkOut : '';

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (checkIn || checkOut) {
      if (!checkIn || !checkOut) {
        return res.status(400).json({
          message: 'Check-in dan check-out harus diisi',
        });
      }

      startDate = new Date(`${checkIn}T00:00:00`);
      endDate = new Date(`${checkOut}T00:00:00`);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        return res.status(400).json({
          message: 'Format tanggal tidak valid',
        });
      }

      if (endDate <= startDate) {
        return res.status(400).json({
          message: 'Check-out harus setelah check-in',
        });
      }
    }

    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            description: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({
        message: 'Properti tidak ditemukan',
      });
    }

    if (!startDate || !endDate) {
      return res.status(200).json({
        data: {
          ...property,
          rooms: property.rooms.map((room) => ({
            ...room,
            availableQuantity: room.quantity,
          })),
        },
      });
    }

    const ACTIVE_BOOKING_STATUSES = [
      'MENUNGGU_PEMBAYARAN',
      'MENUNGGU_KONFIRMASI',
      'DIPROSES',
    ] as const;

    const roomsWithAvailability = await Promise.all(
      property.rooms.map(async (room) => {
        const overlappingBookings = await prisma.booking.count({
          where: {
            roomId: room.id,
            status: {
              in: [...ACTIVE_BOOKING_STATUSES],
            },
            checkIn: {
              lt: endDate,
            },
            checkOut: {
              gt: startDate,
            },
          },
        });

        const unavailableDates = await prisma.roomAvailability.count({
          where: {
            roomId: room.id,
            date: {
              gte: startDate,
              lt: endDate,
            },
            isAvailable: false,
          },
        });

        const availableQuantity =
          unavailableDates > 0
            ? 0
            : Math.max(room.quantity - overlappingBookings, 0);

        return {
          ...room,
          availableQuantity,
        };
      })
    );

    return res.status(200).json({
      data: {
        ...property,
        rooms: roomsWithAvailability,
      },
    });
  } catch (error) {
    console.error('Get property detail error:', error);

    return res.status(500).json({
      message: 'Gagal mengambil detail properti',
    });
  }
});

export default router;
