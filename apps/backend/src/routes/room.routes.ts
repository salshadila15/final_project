import { Router, Response } from 'express';

import {
  createRoom,
  updateRoom,
  getRoomsByProperty,
  upsertRoomSpecialPrice,
  deleteRoomSpecialPrice,
} from '../controllers/room.controller';

import {
  verifyToken,
  AuthRequest,
} from '../middlewares/auth.middleware';

const router = Router();

// ============================================
// ADD ROOM
// POST /api/rooms
// ============================================

router.post(
  '/',
  verifyToken,
  (req: AuthRequest, res: Response, next) => {
    if (req.user?.role !== 'TENANT') {
      return res.status(403).json({
        message: 'Akses khusus pengelola/tenant',
      });
    }

    next();
  },
  createRoom
);

// ============================================
// UPDATE ROOM
// PUT /api/rooms/:roomId
// ============================================

router.put(
  '/:roomId',
  verifyToken,
  (req: AuthRequest, res: Response, next) => {
    if (req.user?.role !== 'TENANT') {
      return res.status(403).json({
        message: 'Akses khusus pengelola/tenant',
      });
    }

    next();
  },
  updateRoom
);

// ============================================
// GET ROOMS BY PROPERTY
// GET /api/rooms/property/:propertyId
// ============================================

router.get(
  '/property/:propertyId',
  getRoomsByProperty
);

// ============================================
// ADD / UPDATE SPECIAL PRICE
// POST /api/rooms/:roomId/special-prices
// ============================================

router.post(
  '/:roomId/special-prices',
  verifyToken,
  upsertRoomSpecialPrice
);

// ============================================
// DELETE SPECIAL PRICE
// DELETE /api/rooms/:roomId/special-prices/:date
// ============================================

router.delete(
  '/:roomId/special-prices/:date',
  verifyToken,
  deleteRoomSpecialPrice
);

export default router;