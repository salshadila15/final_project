import { Router } from 'express';
import {
  createBooking,
  getBookingPricePreview,
  getMyBookings,
  uploadPaymentProof,
  cancelBooking,
  approveBooking,
  rejectBooking,
  getTenantBookings,
  completeBooking,
} from '../controllers/booking.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { paymentUpload } from '../middlewares/upload';

const router = Router();

router.get('/price-preview', verifyToken, getBookingPricePreview);

router.get('/my-bookings', verifyToken, getMyBookings);

router.get('/tenant-bookings', verifyToken, getTenantBookings);

router.post(
  '/:id/payment-proof',
  verifyToken,
  paymentUpload.single('paymentProof'),
  uploadPaymentProof
);

router.post('/:id/cancel', verifyToken, cancelBooking);

router.post('/:id/approve', verifyToken, approveBooking);

router.post('/:id/reject', verifyToken, rejectBooking);

router.post('/:id/complete', verifyToken, completeBooking);

router.post('/', verifyToken, createBooking);

export default router;
