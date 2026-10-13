import { Router } from 'express';
import {
  getAllProviders,
  getProviderById,
  getMyProviderProfile,
  updateProviderProfile,
  toggleAvailability,
  recordContactClick,
} from '../controllers/providerController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAllProviders);
router.get('/me', protect, authorize('provider'), getMyProviderProfile);
router.put('/me', protect, authorize('provider'), updateProviderProfile);
router.patch('/me/availability', protect, authorize('provider'), toggleAvailability);
router.post('/:id/call-click', recordContactClick);
router.get('/:id', getProviderById);

export default router;
