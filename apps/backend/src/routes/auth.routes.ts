import { Router, Request, Response } from 'express';
import {
  register,
  verifyAndSetPassword,
  login,
  logout,
  getProfileController,
  getMe
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
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);

export default router;
