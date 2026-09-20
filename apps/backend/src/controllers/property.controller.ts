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
      city,
      checkInTime,
      checkOutTime,
      roomName,
      roomDescription,
      roomQuantity,
      roomMaxGuests,
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
    if (!title || !category || !address || !city) {
      res.status(400).json({
        message:
          'Judul, kategori, alamat, dan kota wajib diisi',
      });
      return;
    }

    // =========================
    // CHECK-IN / CHECK-OUT
    // =========================
    const finalCheckInTime = checkInTime || '14:00';
    const finalCheckOutTime = checkOutTime || '12:00';

    // =========================
    // ROOM VALIDATION
    // =========================
    if (
      !roomName ||
      !roomQuantity ||
      roomMaxGuests === undefined ||
      roomMaxGuests === '' ||
      roomPrice === undefined ||
      roomPrice === ''
    ) {
      res.status(400).json({
        message:
          'Nama room, jumlah unit, maksimal tamu, dan harga per malam wajib diisi',
      });
      return;
    }

    const quantity = Number(roomQuantity);
    const maxGuests = Number(roomMaxGuests);
    const price = Number(roomPrice);

    if (!Number.isInteger(quantity) || quantity < 1) {
      res.status(400).json({
        message:
          'Jumlah unit room harus berupa angka minimal 1',
      });
      return;
    }

    if (!Number.isInteger(maxGuests) || maxGuests < 1) {
      res.status(400).json({
        message:
          'Maksimal tamu harus berupa angka minimal 1',
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
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        'base64'
      )}`;

      const uploadResponse =
        await cloudinary.uploader.upload(fileBase64, {
          folder: 'property_images',
        });

      imageUrl = uploadResponse.secure_url;
    }

    // =========================
    // CREATE PROPERTY + ROOM
    // =========================
    const result = await prisma.$transaction(
      async (tx) => {
        const property = await tx.property.create({
          data: {
            title,
            category,
            description: description || null,
            imageUrl,
            address,
            city,
            checkInTime: finalCheckInTime,
            checkOutTime: finalCheckOutTime,
            tenantId: Number(tenantId),
          },
        });

        const room = await tx.room.create({
          data: {
            propertyId: property.id,
            name: roomName,
            description: roomDescription || null,
            quantity,
            maxGuests,
            price,
          },
        });

        return {
          property,
          room,
        };
      }
    );

    // =========================
    // RESPONSE
    // =========================
    res.status(201).json({
      message:
        'Properti dan room berhasil ditambahkan',
      data: result,
    });
  } catch (error) {
    console.error(
      'Create property error:',
      error
    );

    res.status(500).json({
      message:
        'Terjadi kesalahan pada server',
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

    // =========================
    // AUTH CHECK
    // =========================
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

    // =========================
    // REQUEST DATA
    // =========================
    const {
      title,
      category,
      description,
      address,
      city,
      checkInTime,
      checkOutTime,
      roomName,
      roomDescription,
      roomQuantity,
      roomPrice: requestedRoomPrice,
      price,
      room,
      specialPrices,
    } = req.body;

    // Support field lama:
    // price -> roomPrice
    // room  -> roomQuantity
    const finalRoomQuantity =
      roomQuantity !== undefined
        ? roomQuantity
        : room;

    const finalRoomPrice =
      requestedRoomPrice !== undefined
        ? requestedRoomPrice
        : price;

    // =========================
    // PROPERTY VALIDATION
    // =========================
    if (
      !title ||
      !category ||
      !address ||
      !city
    ) {
      res.status(400).json({
        message:
          'Judul, kategori, alamat, dan kota wajib diisi',
      });
      return;
    }

    // =========================
    // ROOM VALIDATION
    // =========================
    if (
      finalRoomQuantity === undefined ||
      finalRoomQuantity === ''
    ) {
      res.status(400).json({
        message:
          'Jumlah kamar wajib diisi',
      });
      return;
    }

    if (
      finalRoomPrice === undefined ||
      finalRoomPrice === ''
    ) {
      res.status(400).json({
        message:
          'Harga sewa wajib diisi',
      });
      return;
    }

    const quantity =
      Number(finalRoomQuantity);

    const roomPrice =
      Number(finalRoomPrice);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      res.status(400).json({
        message:
          'Jumlah kamar harus berupa angka minimal 1',
      });
      return;
    }

    if (
      Number.isNaN(roomPrice) ||
      roomPrice < 0
    ) {
      res.status(400).json({
        message:
          'Harga sewa tidak valid',
      });
      return;
    }

    // =========================
    // CHECK PROPERTY OWNERSHIP
    // =========================
    const property =
      await prisma.property.findFirst({
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
        message:
          'Properti tidak ditemukan atau bukan milik Anda',
      });
      return;
    }

    if (property.rooms.length === 0) {
      res.status(400).json({
        message:
          'Properti tidak memiliki room',
      });
      return;
    }

    const existingRoom =
      property.rooms[0];

    if (!existingRoom) {
      res.status(400).json({
        message:
          'Properti tidak memiliki room',
      });
      return;
    }

    // =========================
    // CLOUDINARY UPLOAD
    // =========================
    let imageUrl =
      property.imageUrl;

    if (req.file) {
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        'base64'
      )}`;

      const uploadResponse =
        await cloudinary.uploader.upload(
          fileBase64,
          {
            folder:
              'property_images',
          }
        );

      imageUrl =
        uploadResponse.secure_url;
    }

    // =========================
    // PARSE SPECIAL PRICES
    // =========================
    let parsedSpecialPrices: Array<{
      date: string;
      price: number;
    }> = [];

    if (specialPrices) {
      try {
        const parsed =
          typeof specialPrices === 'string'
            ? JSON.parse(
                specialPrices
              )
            : specialPrices;

        if (!Array.isArray(parsed)) {
          res.status(400).json({
            message:
              'Format special price tidak valid',
          });
          return;
        }

        parsedSpecialPrices =
          parsed.map((item) => ({
            date: String(
              item.date
            ),
            price: Number(
              item.price
            ),
          }));

        for (const item of parsedSpecialPrices) {
          if (!item.date) {
            res.status(400).json({
              message:
                'Tanggal special price tidak valid',
            });
            return;
          }

          if (
            Number.isNaN(
              item.price
            ) ||
            item.price < 0
          ) {
            res.status(400).json({
              message:
                `Harga khusus untuk tanggal ${item.date} tidak valid`,
            });
            return;
          }

          const date =
            new Date(
              `${item.date}T00:00:00.000Z`
            );

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            res.status(400).json({
              message:
                `Tanggal special price tidak valid: ${item.date}`,
            });
            return;
          }
        }
      } catch (error) {
        console.error(
          'Parse special prices error:',
          error
        );

        res.status(400).json({
          message:
            'Format special price tidak valid',
        });
        return;
      }
    }

    // =========================
    // UPDATE PROPERTY + ROOM
    // + SPECIAL PRICES
    // =========================
    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedProperty =
            await tx.property.update({
              where: {
                id: propertyId,
              },
              data: {
                title,
                category,
                description:
                  description || null,
                address,
                city,
                checkInTime:
                  checkInTime ||
                  property.checkInTime ||
                  '14:00',
                checkOutTime:
                  checkOutTime ||
                  property.checkOutTime ||
                  '12:00',
                imageUrl,
              },
            });

          const updatedRoom =
            await tx.room.update({
              where: {
                id: existingRoom.id,
              },
              data: {
                name:
                  roomName ||
                  existingRoom.name,
                description:
                  roomDescription !==
                  undefined
                    ? roomDescription ||
                      null
                    : existingRoom.description,
                quantity,
                price: roomPrice,
              },
            });

          // =========================
          // SAVE SPECIAL PRICES
          // =========================
          for (const item of parsedSpecialPrices) {
            const date =
              new Date(
                `${item.date}T00:00:00.000Z`
              );

            await tx.roomPrice.upsert({
              where: {
                roomId_date: {
                  roomId:
                    existingRoom.id,
                  date,
                },
              },
              update: {
                price: item.price,
              },
              create: {
                roomId:
                  existingRoom.id,
                date,
                price:
                  item.price,
              },
            });
          }

          return {
            property:
              updatedProperty,
            room:
              updatedRoom,
            specialPrices:
              parsedSpecialPrices,
          };
        }
      );

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      message:
        'Properti berhasil diperbarui',
      data: result,
    });
  } catch (error) {
    console.error(
      'Update property error:',
      error
    );

    res.status(500).json({
      message:
        'Terjadi kesalahan saat memperbarui properti',
    });
  }
};

// =====================================================
// GET PROPERTY BY ID
// =====================================================
export const getPropertyById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const propertyId =
      Number(req.params.id);

    // =========================
    // ID VALIDATION
    // =========================
    if (Number.isNaN(propertyId)) {
      res.status(400).json({
        message:
          'ID properti tidak valid',
      });
      return;
    }

    // =========================
    // GET PROPERTY
    // =========================
    const property =
      await prisma.property.findUnique({
        where: {
          id: propertyId,
        },
        include: {
          rooms: {
            orderBy: {
              id: 'asc',
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
          },
        },
      });

    // =========================
    // NOT FOUND
    // =========================
    if (!property) {
      res.status(404).json({
        message:
          'Properti tidak ditemukan',
      });
      return;
    }

    // =========================
    // FORMAT RESPONSE
    // =========================
    const formattedProperty = {
      id: property.id,
      title: property.title,
      category: property.category,
      description:
        property.description,
      imageUrl:
        property.imageUrl,
      address:
        property.address,
      city:
        property.city,
      checkInTime:
        property.checkInTime,
      checkOutTime:
        property.checkOutTime,
      tenantId:
        property.tenantId,
      createdAt:
        property.createdAt,
      updatedAt:
        property.updatedAt,

      rooms: property.rooms.map(
        (room) => ({
          id: room.id,
          name: room.name,
          description:
            room.description,
          quantity:
            room.quantity,
          maxGuests:
            room.maxGuests,
          price:
            Number(room.price),

          prices:
            room.prices.map(
              (item) => ({
                id: item.id,
                date:
                  item.date,
                price:
                  Number(
                    item.price
                  ),
              })
            ),

          availabilities:
            room.availabilities.map(
              (item) => ({
                id: item.id,
                date:
                  item.date,
                isAvailable:
                  item.isAvailable,
              })
            ),
        })
      ),
    };

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      message:
        'Detail properti berhasil diambil',
      data:
        formattedProperty,
    });
  } catch (error) {
    console.error(
      'Get property by ID error:',
      error
    );

    res.status(500).json({
      message:
        'Terjadi kesalahan saat mengambil detail properti',
    });
  }
};