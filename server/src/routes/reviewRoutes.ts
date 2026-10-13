import { Router } from 'express';
import { getProviderReviews, createReview } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/:providerId', getProviderReviews);
router.post('/', protect, createReview);

export default router;
