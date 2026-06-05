import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  userId: string;
  storeName: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  contact: {
    email: string;
    phone: string;
  };
  address: {
    country: string;
    city: string;
    area: string;
  };
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalSales: number;
}

const vendorSchema = new Schema<IVendor>({
  _id: { type: String as any, required: true },
  userId: { type: String, required: true, unique: true, index: true },
  storeName: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  logo: String,
  banner: String,
  contact: {
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  address: {
    country: String,
    city: String,
    area: String
  },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'], default: 'PENDING' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IVendor>('Vendor', vendorSchema);
