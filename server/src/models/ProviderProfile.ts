import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceItem {
  id: string;
  name: string;
  price: number;
  unit?: string;
}

export interface IProviderProfile extends Document {
  userId: mongoose.Types.ObjectId;
  username?: string;
  businessName: string;
  tagline: string;
  category: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  address: string;
  city: string;
  area: string;
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  whatsapp?: string;
  email?: string;
  about: string;
  avatarUrl: string;
  coverUrl?: string;
  isVerified: boolean;
  isAvailable: boolean;
  pricingStartsAt: number;
  services: IServiceItem[];
  badges: string[];
  workingType?: string;
  workingHours?: string;
  totalCallsReceived: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: 'per visit' },
});

const ProviderProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, trim: true, lowercase: true, index: true },
    businessName: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    experienceYears: { type: Number, default: 1 },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    area: { type: String, required: true },
    location: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
    },
    phone: { type: String, required: true },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    about: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    pricingStartsAt: { type: Number, default: 199 },
    services: [ServiceItemSchema],
    badges: [{ type: String }],
    workingType: { type: String, default: 'On-site / Home Visit' },
    workingHours: { type: String, default: '9:00 AM - 8:00 PM' },
    totalCallsReceived: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);
