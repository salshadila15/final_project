import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';

// ============================================
// ADD ROOM
// POST /api/rooms
// ============================================

export const createRoom = async (
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

    if (req.user?.role !== 'TENANT') {
      res.status(403).json({
        message: 'Akses khusus pengelola/tenant',
      });
      return;
    }

    const {
      propertyId,
      name,
      description,
      quantity,
      maxGuests,
      price,
    } = req.body;

    if (
      !propertyId ||
      !name ||
      quantity === undefined ||
      maxGuests === undefined ||
      price === undefined
    ) {
      res.status(400).json({
        message:
          'Property, nama room, jumlah unit, maksimal tamu, dan harga wajib diisi',
      });
      return;
    }

    const parsedPropertyId = Number(propertyId);
    const parsedQuantity = Number(quantity);
    const parsedMaxGuests = Number(maxGuests);
    const parsedPrice = Number(price);

    if (
      Number.isNaN(parsedPropertyId) ||
      parsedPropertyId < 1
    ) {
      res.status(400).json({
        message: 'ID property tidak valid',
      });
      return;
    }

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      res.status(400).json({
        message:
          'Jumlah unit harus berupa angka minimal 1',
      });
      return;
    }

    if (
      !Number.isInteger(parsedMaxGuests) ||
      parsedMaxGuests < 1
    ) {
      res.status(400).json({
        message:
          'Maksimal tamu harus berupa angka minimal 1',
      });
      return;
    }

    if (
      Number.isNaN(parsedPrice) ||
      parsedPrice < 0
    ) {
      res.status(400).json({
        message: 'Harga room tidak valid',
      });
      return;
    }

    const property = await prisma.property.findFirst({
      where: {
        id: parsedPropertyId,
        tenantId: Number(tenantId),
      },
    });

    if (!property) {
      res.status(404).json({
        message:
          'Properti tidak ditemukan atau bukan milik Anda',
      });
      return;
    }

    const room = await prisma.room.create({
      data: {
        propertyId: parsedPropertyId,
        name: String(name).trim(),
        description: description
          ? String(description).trim()
          : null,
        quantity: parsedQuantity,
        maxGuests: parsedMaxGuests,
        price: parsedPrice,
      },
    });

    res.status(201).json({
      message: 'Tipe kamar berhasil ditambahkan',
      data: {
        ...room,
        price: Number(room.price),
      },
    });
  } catch (error) {
    console.error('Create room error:', error);

    res.status(500).json({
      message: 'Gagal menambahkan tipe kamar',
    });
  }
};

// ============================================
// UPDATE ROOM
// PUT /api/rooms/:roomId
// ============================================

export const updateRoom = async (
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

    if (req.user?.role !== 'TENANT') {
      res.status(403).json({
        message: 'Akses khusus pengelola/tenant',
      });
      return;
    }

    const roomId = Number(req.params.roomId);

    if (!Number.isInteger(roomId) || roomId < 1) {
      res.status(400).json({
        message: 'ID room tidak valid',
      });
      return;
    }

    const {
      name,
      description,
      quantity,
      maxGuests,
      price,
    } = req.body;

    if (
      !name ||
      quantity === undefined ||
      maxGuests === undefined ||
      price === undefined
    ) {
      res.status(400).json({
        message:
          'Nama room, jumlah unit, maksimal tamu, dan harga wajib diisi',
      });
      return;
    }

    const parsedQuantity = Number(quantity);
    const parsedMaxGuests = Number(maxGuests);
    const parsedPrice = Number(price);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      res.status(400).json({
        message:
          'Jumlah unit harus berupa angka minimal 1',
      });
      return;
    }

    if (
      !Number.isInteger(parsedMaxGuests) ||
      parsedMaxGuests < 1
    ) {
      res.status(400).json({
        message:
          'Maksimal tamu harus berupa angka minimal 1',
      });
      return;
    }

    if (
      Number.isNaN(parsedPrice) ||
      parsedPrice < 0
    ) {
      res.status(400).json({
        message: 'Harga room tidak valid',
      });
      return;
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        property: {
          tenantId: Number(tenantId),
        },
      },
      select: {
        id: true,
        propertyId: true,
      },
    });

    if (!room) {
      res.status(404).json({
        message:
          'Room tidak ditemukan atau bukan milik properti Anda',
      });
      return;
    }

    const updatedRoom = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        name: String(name).trim(),
        description: description
          ? String(description).trim()
          : null,
        quantity: parsedQuantity,
        maxGuests: parsedMaxGuests,
        price: parsedPrice,
      },
    });

    res.status(200).json({
      message: 'Tipe kamar berhasil diperbarui',
      data: {
        ...updatedRoom,
        price: Number(updatedRoom.price),
      },
    });
  } catch (error) {
    console.error('Update room error:', error);

    res.status(500).json({
      message: 'Gagal memperbarui tipe kamar',
    });
  }
};

// ============================================
// GET ROOMS BY PROPERTY
// GET /api/rooms/property/:propertyId
// ============================================

export const getRoomsByProperty = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const propertyId = Number(req.params.propertyId);

    if (Number.isNaN(propertyId)) {
      res.status(400).json({
        message: 'ID property tidak valid',
      });
      return;
    }

    const rooms = await prisma.room.findMany({
      where: {
        propertyId,
      },
      include: {
        prices: {
          orderBy: {
            date: 'asc',
          },
        },
        availabilities: {
          orderBy: {
            date: 'asc',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    res.status(200).json({
      data: rooms.map((room) => ({
        ...room,
        price: Number(room.price),
        prices: room.prices.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      })),
    });
  } catch (error) {
    console.error(
      'Get rooms by property error:',
      error
    );

    res.status(500).json({
      message: 'Gagal mengambil tipe kamar',
    });
  }
};

// ============================================
// ADD / UPDATE SPECIAL PRICE
// POST /api/rooms/:roomId/special-prices
// ============================================

export const upsertRoomSpecialPrice = async (
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

    if (req.user?.role !== 'TENANT') {
      res.status(403).json({
        message: 'Akses khusus pengelola/tenant',
      });
      return;
    }

    const roomId = Number(req.params.roomId);

    if (!Number.isInteger(roomId) || roomId < 1) {
      res.status(400).json({
        message: 'ID room tidak valid',
      });
      return;
    }

    const { date, price } = req.body;

    if (!date || price === undefined) {
      res.status(400).json({
        message: 'Tanggal dan harga khusus wajib diisi',
      });
      return;
    }

    const parsedPrice = Number(price);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      res.status(400).json({
        message: 'Harga khusus tidak valid',
      });
      return;
    }

    const parsedDate = new Date(
      `${String(date)}T00:00:00.000Z`
    );

    if (Number.isNaN(parsedDate.getTime())) {
      res.status(400).json({
        message: 'Tanggal tidak valid',
      });
      return;
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        property: {
          tenantId: Number(tenantId),
        },
      },
      select: {
        id: true,
      },
    });

    if (!room) {
      res.status(404).json({
        message:
          'Room tidak ditemukan atau bukan milik properti Anda',
      });
      return;
    }

    const specialPrice =
      await prisma.roomPrice.upsert({
        where: {
          roomId_date: {
            roomId,
            date: parsedDate,
          },
        },
        update: {
          price: parsedPrice,
        },
        create: {
          roomId,
          date: parsedDate,
          price: parsedPrice,
        },
      });

    res.status(200).json({
      message: 'Harga khusus berhasil disimpan',
      data: {
        ...specialPrice,
        price: Number(specialPrice.price),
      },
    });
  } catch (error) {
    console.error(
      'Upsert room special price error:',
      error
    );

    res.status(500).json({
      message: 'Gagal menyimpan harga khusus',
    });
  }
};

// ============================================
// DELETE SPECIAL PRICE
// DELETE /api/rooms/:roomId/special-prices/:date
// ============================================

export const deleteRoomSpecialPrice = async (
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

    if (req.user?.role !== 'TENANT') {
      res.status(403).json({
        message: 'Akses khusus pengelola/tenant',
      });
      return;
    }

    const roomId = Number(req.params.roomId);
    const date = String(req.params.date);

    if (!Number.isInteger(roomId) || roomId < 1) {
      res.status(400).json({
        message: 'ID room tidak valid',
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        message: 'Tanggal wajib diisi',
      });
      return;
    }

    const parsedDate = new Date(
      `${date}T00:00:00.000Z`
    );

    if (Number.isNaN(parsedDate.getTime())) {
      res.status(400).json({
        message: 'Tanggal tidak valid',
      });
      return;
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        property: {
          tenantId: Number(tenantId),
        },
      },
      select: {
        id: true,
      },
    });

    if (!room) {
      res.status(404).json({
        message:
          'Room tidak ditemukan atau bukan milik properti Anda',
      });
      return;
    }

    await prisma.roomPrice.delete({
      where: {
        roomId_date: {
          roomId,
          date: parsedDate,
        },
      },
    });

    res.status(200).json({
      message: 'Harga khusus berhasil dihapus',
    });
  } catch (error) {
    console.error(
      'Delete room special price error:',
      error
    );

    res.status(500).json({
      message: 'Gagal menghapus harga khusus',
    });
  }
};