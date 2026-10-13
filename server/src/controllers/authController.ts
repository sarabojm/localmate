import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ProviderProfile from '../models/ProviderProfile';
import { AuthRequest } from '../middleware/authMiddleware';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'localmate_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      whatsapp,
      businessName,
      category,
      city,
      area,
      address,
      location,
      workingType,
      workingHours,
      pricingStartsAt,
      about,
    } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: role || 'customer',
      avatar: userAvatar,
    });

    // If registered as a provider, create their initial provider profile / visiting card
    if (user.role === 'provider') {
      await ProviderProfile.create({
        userId: user._id,
        businessName: businessName || `${name}'s Services`,
        tagline: `Professional ${category || 'Service'} Specialist`,
        category: category || 'Electrician',
        phone: phone || '',
        whatsapp: whatsapp || phone || '',
        email: email.toLowerCase(),
        address: address || (area ? `${area}, ${city || 'Local'}` : 'Main Road'),
        city: city || 'Bangalore',
        area: area || 'Downtown',
        location: location || { lat: 12.9716, lng: 77.5946 },
        about: about || `Hi, I'm ${name}. I provide reliable, top-quality services with complete customer satisfaction. Contact me directly for quick assistance!`,
        avatarUrl: userAvatar,
        pricingStartsAt: Number(pricingStartsAt) || 199,
        workingType: workingType || 'On-site / Home Visit',
        workingHours: workingHours || '9:00 AM - 8:00 PM',
        isAvailable: true,
        isVerified: true,
        badges: ['New Provider', 'Leaflet Listed'],
        services: [
          { id: 'srv-1', name: 'Standard Inspection & Consultation', price: Number(pricingStartsAt) || 199, unit: 'per visit' },
        ],
      });
    }

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    res.json({ success: true, user: req.user });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
