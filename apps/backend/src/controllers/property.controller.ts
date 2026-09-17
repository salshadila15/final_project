import cloudinary from '../config/cloudinary';
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';

export const createProperty = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      category,
      description,
      address,
      roomName,
      roomDescription,
      roomQuantity,
      roomPrice,
    } = req.body;

    const tenantId = req.user?.id;

    // =========================
    // AUTH CHECK
    // =========================
    if (!tenantId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    // =========================
    // PROPERTY VALIDATION
    // =========================
    if (!title || !category || !address) {
      res.status(400).json({
        message: 'Judul, kategori, dan alamat wajib diisi',
      });
      return;
    }

    // =========================
    // ROOM VALIDATION
    // =========================
    if (!roomName || !roomQuantity || !roomPrice) {
      res.status(400).json({
        message: 'Nama room, jumlah unit, dan harga per malam wajib diisi',
      });
      return;
    }

    const quantity = Number(roomQuantity);
    const price = Number(roomPrice);

    if (!Number.isInteger(quantity) || quantity < 1) {
      res.status(400).json({
        message: 'Jumlah unit room harus berupa angka minimal 1',
      });
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      res.status(400).json({
        message: 'Harga room tidak valid',
      });
      return;
    }

    // =========================
    // CLOUDINARY UPLOAD
    // =========================
    let imageUrl: string | null = null;

    if (req.file) {
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: 'property_images',
      });

      imageUrl = uploadResponse.secure_url;
    }

    // =========================
    // CREATE PROPERTY + ROOM
    // =========================
    const result = await prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          title,
          category,
          description: description || null,
          imageUrl,
          address,
          tenantId: Number(tenantId),
        },
      });

      const room = await tx.room.create({
        data: {
          propertyId: property.id,
          name: roomName,
          description: roomDescription || null,
          quantity,
          price,
        },
      });

      return {
        property,
        room,
      };
    });

    // =========================
    // RESPONSE
    // =========================
    res.status(201).json({
      message: 'Properti dan room berhasil ditambahkan',
      data: result,
    });
  } catch (error) {
    console.error('Create property error:', error);

    res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const updateProperty = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const propertyId = Number(req.params.id);
    const tenantId = req.user?.id;

    if (!tenantId) {
      res.status(401).json({
        message: 'User tidak terautentikasi',
      });
      return;
    }

    if (Number.isNaN(propertyId)) {
      res.status(400).json({
        message: 'ID properti tidak valid',
      });
      return;
    }

    const { title, category, address, price, room } = req.body;

    if (!title || !category || !address) {
      res.status(400).json({
        message: 'Judul, kategori, dan alamat wajib diisi',
      });
      return;
    }

    const quantity = Number(room);
    const roomPrice = Number(price);

    if (!Number.isInteger(quantity) || quantity < 1) {
      res.status(400).json({
        message: 'Jumlah kamar harus berupa angka minimal 1',
      });
      return;
    }

    if (Number.isNaN(roomPrice) || roomPrice < 0) {
      res.status(400).json({
        message: 'Harga sewa tidak valid',
      });
      return;
    }

    // =========================
    // CHECK PROPERTY OWNERSHIP
    // =========================
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenantId: Number(tenantId),
      },
      include: {
        rooms: {
          orderBy: {
            id: 'asc',
          },
          take: 1,
        },
      },
    });

    if (!property) {
      res.status(404).json({
        message: 'Properti tidak ditemukan atau bukan milik Anda',
      });
      return;
    }

    if (property.rooms.length === 0) {
      res.status(400).json({
        message: 'Properti tidak memiliki room',
      });
      return;
    }

    // Simpan room pertama setelah dipastikan ada.
    const existingRoom = property.rooms[0];

    if (!existingRoom) {
      res.status(400).json({
        message: 'Properti tidak memiliki room',
      });
      return;
    }

    // =========================
    // CLOUDINARY UPLOAD
    // =========================
    let imageUrl = property.imageUrl;

    if (req.file) {
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: 'property_images',
      });

      imageUrl = uploadResponse.secure_url;
    }

    // =========================
    // UPDATE PROPERTY + ROOM
    // =========================
    const result = await prisma.$transaction(async (tx) => {
      const updatedProperty = await tx.property.update({
        where: {
          id: propertyId,
        },
        data: {
          title,
          category,
          address,
          imageUrl,
        },
      });

      const updatedRoom = await tx.room.update({
        where: {
          id: existingRoom.id,
        },
        data: {
          quantity,
          price: roomPrice,
        },
      });

      return {
        property: updatedProperty,
        room: updatedRoom,
      };
    });

    res.status(200).json({
      message: 'Properti berhasil diperbarui',
      data: result,
    });
  } catch (error) {
    console.error('Update property error:', error);

    res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui properti',
    });
  }
};
