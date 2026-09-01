import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { createProperty } from '../controllers/property.controller';
import { verifyToken, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Middleware pengecekan khusus tenant
const isTenant = (req: AuthRequest, res: Response, next: Function) => {
    if (req.user && req.user.role === 'TENANT') {
        next();
    } else {
        res.status(403).json({ message: 'Akses khusus pengelola/tenant' });
    }
};

// Endpoint Tambah Properti (POST /api/properties)
router.post('/', verifyToken, isTenant, createProperty, async (req: AuthRequest, res: Response) => {
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

        res.status(201).json({
            message: 'Properti berhasil ditambahkan',
            data: newProperty,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// Endpoint Ambil Daftar Properti Milik Tenant (GET /api/properties/my-properties)
router.get('/my-properties', verifyToken, isTenant, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user?.id;

        const properties = await prisma.property.findMany({
            where: { tenantId: Number(tenantId) },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({ data: properties });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data properti' });
    }
});

export default router;