import { Response } from 'express';
import Review from '../models/Review';
import ProviderProfile from '../models/ProviderProfile';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProviderReviews = async (req: any, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error fetching reviews' });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { providerId, rating, comment } = req.body;

    if (!providerId || !rating || !comment) {
      res.status(400).json({ message: 'providerId, rating, and comment are required' });
      return;
    }

    const provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      res.status(404).json({ message: 'Provider not found' });
      return;
    }

    const review = await Review.create({
      providerId,
      userId: req.user._id,
      customerName: req.user.name,
      rating: Number(rating),
      comment,
    });

    // Recalculate provider average rating
    const allReviews = await Review.find({ providerId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    provider.rating = Math.round(avgRating * 10) / 10;
    provider.reviewCount = allReviews.length;
    await provider.save();

    res.status(201).json({ success: true, data: review, providerRating: provider.rating });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error creating review' });
  }
};
