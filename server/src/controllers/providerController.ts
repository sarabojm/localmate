import { Request, Response } from 'express';
import ProviderProfile from '../models/ProviderProfile';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAllProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, city, minRating, availableOnly, search, sortBy } = req.query;

    const query: any = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (city && city !== 'All') {
      query.city = city;
    }

    if (minRating && Number(minRating) > 0) {
      query.rating = { $gte: Number(minRating) };
    }

    if (availableOnly === 'true') {
      query.isAvailable = true;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { businessName: regex },
        { tagline: regex },
        { category: regex },
        { area: regex },
        { city: regex },
        { 'services.name': regex },
      ];
    }

    let sortOption: any = { rating: -1 };
    if (sortBy === 'experience') {
      sortOption = { experienceYears: -1 };
    } else if (sortBy === 'price_low') {
      sortOption = { pricingStartsAt: 1 };
    } else if (sortBy === 'price_high') {
      sortOption = { pricingStartsAt: -1 };
    }

    const pageNum = parseInt(req.query.page as string, 10);
    const limitNum = parseInt(req.query.limit as string, 10);

    const totalCount = await ProviderProfile.countDocuments(query);

    let queryPromise = ProviderProfile.find(query).sort(sortOption).populate('userId', 'name email avatar');

    if (!isNaN(pageNum) && !isNaN(limitNum) && limitNum > 0) {
      const page = Math.max(1, pageNum);
      queryPromise = queryPromise.skip((page - 1) * limitNum).limit(limitNum);
    }

    const providers = await queryPromise;

    res.json({
      success: true,
      count: providers.length,
      totalCount,
      page: !isNaN(pageNum) ? Math.max(1, pageNum) : 1,
      totalPages: !isNaN(limitNum) && limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1,
      data: providers,
    });
  } catch (error: any) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching providers' });
  }
};

export const getProviderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const provider = await ProviderProfile.findById(req.params.id).populate('userId', 'name email avatar');

    if (!provider) {
      res.status(404).json({ message: 'Provider profile not found' });
      return;
    }

    res.json({ success: true, data: provider });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error fetching provider' });
  }
};

export const getMyProviderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const profile = await ProviderProfile.findOne({ userId: req.user._id }).populate('userId', 'name email avatar');

    if (!profile) {
      res.status(404).json({ message: 'Provider profile not found for this account' });
      return;
    }

    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error fetching profile' });
  }
};

export const updateProviderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    let profile = await ProviderProfile.findOne({ userId: req.user._id });

    if (!profile) {
      res.status(404).json({ message: 'Provider profile not found' });
      return;
    }

    const updatableFields = [
      'businessName',
      'tagline',
      'category',
      'experienceYears',
      'address',
      'city',
      'area',
      'phone',
      'whatsapp',
      'email',
      'about',
      'avatarUrl',
      'coverUrl',
      'pricingStartsAt',
      'services',
      'badges',
      'workingType',
      'workingHours',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (profile as any)[field] = req.body[field];
      }
    });

    await profile.save();

    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error updating profile' });
  }
};

export const toggleAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Provider profile not found' });
      return;
    }

    profile.isAvailable = typeof req.body.isAvailable === 'boolean' ? req.body.isAvailable : !profile.isAvailable;
    await profile.save();

    res.json({ success: true, isAvailable: profile.isAvailable });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error updating availability' });
  }
};

export const recordContactClick = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await ProviderProfile.findByIdAndUpdate(
      req.params.id,
      { $inc: { totalCallsReceived: 1 } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: 'Provider not found' });
      return;
    }

    res.json({ success: true, totalCallsReceived: profile.totalCallsReceived });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
