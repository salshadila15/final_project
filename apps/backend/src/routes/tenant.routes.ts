import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/tenants - Ambil daftar tenant
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.user.findMany({
      where: { 
        role: 'TENANT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return res.json(tenants);
  } catch (error: any) {
    return res.status(500).json({ 
      message: 'Gagal mengambil data tenant', 
      error: error.message,
    });
  }
});

// POST /api/tenants - Tambah tenant baru
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email ) {
      return res.status(400).json({
        message: 'Nama dan email wajib diisi',
      });
    }

    const newTenant = await prisma.user.create({
      data: {
        name,
        email,
        role: 'TENANT',
      },
    });

    return res.status(201).json({ 
      message: 'Tenant berhasil ditambahkan', 
      tenant: newTenant,
    });
  } catch (error: any) {
    return res.status(500).json({ 
      message: 'Gagal menambah tenant', 
      error: error.message,
    });
  }
});

export default router;