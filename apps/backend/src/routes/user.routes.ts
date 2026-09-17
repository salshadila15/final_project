import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Gunakan 'req: Request' agar variabel 'req' terpakai
router.get('/', async (req: Request, res: Response) => {
  try {
    // Contoh jika nanti butuh query param: const { search } = req.query;
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal mengambil data user', error: error.message });
  }
});

export default router;