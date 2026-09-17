import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';

export const createProperty = async (req: AuthRequest, res: Response) => {
    try {
        const { title, category, description, imageUrl, room, address, price } = req.body;
        const tenantId = req.user?.id;

        if (!title || !category || !address || !price || !room) {
            return res.status(400).json({ message: 'Judul, kategori, alamat, harga, dan jumlah kamar wajib diisi' });
        }

        const newProperty = await prisma.property.create({
            data: {
                title,
                category,
                description,
                imageUrl,
                room: Number(room),
                address,
                price: parseFloat(price),
                tenantId: Number(tenantId),
          },
    });

    return res.status(201).json({
        message: 'Properti berhasil ditambahkan',
        data: newProperty,
    });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};