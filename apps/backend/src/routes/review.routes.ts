import { Router } from 'express';
import {
  createReview,
  getPropertyReviews,
} from '../controllers/review.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, createReview);
router.get('/property/:propertyId', getPropertyReviews);

export default router;
