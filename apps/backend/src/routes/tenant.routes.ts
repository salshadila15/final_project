import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/tenants - Ambil daftar tenant
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.tenant.findMany();
    return res.json(tenants);
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal mengambil data tenant', error: error.message });
  }
});

// POST /api/tenants - Tambah tenant baru
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, unit, contact, leaseStatus } = req.body;
    const newTenant = await prisma.tenant.create({
      data: { name, unit, contact, leaseStatus }
    });
    return res.status(201).json({ message: 'Tenant berhasil ditambahkan', tenant: newTenant });
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal menambah tenant', error: error.message });
  }
});

export default router;