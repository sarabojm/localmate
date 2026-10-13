import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  providerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    providerId: { type: Schema.Types.ObjectId, ref: 'ProviderProfile', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
