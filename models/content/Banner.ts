import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  image: string;
  link?: string;
  position: number;
  type: 'home_slider' | 'middle_banner' | 'sidebar';
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>({
  title: { type: String, required: true },
  image: { type: String, required: true },
  link: String,
  position: { type: Number, default: 0 },
  type: { type: String, enum: ['home_slider', 'middle_banner', 'sidebar'], default: 'home_slider' },
  isActive: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

const Banner: Model<IBanner> = mongoose.model<IBanner>('banners', bannerSchema);
export default Banner;
