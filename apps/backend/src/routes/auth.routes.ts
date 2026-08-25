import { Router, Request, Response } from 'express';
import {
  register,
  verifyAndSetPassword,
  login,
  getProfileController,
} from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/test', verifyToken, (req: Request, res: Response) => {
  res.json({ message: 'Rute auth berhasil diakses!' });
});

router.post('/register', register);
router.get('/verify-password', verifyAndSetPassword);
router.post('/verify-password', verifyAndSetPassword);
router.post('/login', login);

// Rute privat yang diproteksi oleh token
router.get('/me', verifyToken, getProfileController);

export default router;
